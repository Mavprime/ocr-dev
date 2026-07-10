import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Invoice } from '../types/invoice';
import supabase from '../lib/supabaseClient';

const MAX_HISTORY = 15;

/** Safely coerce a raw value (number, string, or null/undefined) into a number or undefined. */
const parseNumeric = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'number') return isFinite(v) ? v : undefined;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : undefined;
};

/**
 * Map a raw database row into the frontend Invoice shape.
 *
 * Handles both camelCase (Supabase column names) and PascalCase
 * (legacy Google-Sheets-origin rows that were migrated).
 */
const normalizeInvoice = (raw: Record<string, unknown>, idx: number): Invoice => {
  const grand =
    (raw.grand_total as number) ??
    (raw['Total Amount'] as number) ??
    (raw.total as number) ??
    0;

  return {
    id: (raw.id as string) || `${raw.date ?? raw.Date ?? ''}-${raw.vendor ?? raw.Vendor ?? ''}-${idx}`,
    vendor: (raw.vendor as string) ?? (raw.Vendor as string) ?? 'Unknown',
    date: (raw.date as string) ?? (raw.Date as string) ?? '',
    grand_total:
      typeof grand === 'number' ? grand : parseFloat(String(grand).replace(/[^0-9.\-]/g, '')) || 0,
    items_summary: (raw.items_summary as string) ?? (raw.Summary as string) ?? '',
    items: Array.isArray(raw.items) ? (raw.items as Invoice['items']) : [],
    source: (raw.source as string) ?? (raw.Source as string) ?? 'web',
    created_at: (raw.created_at as string) ?? (raw.date as string) ?? (raw.Date as string) ?? '',

    // Tax fields — map both camelCase (Supabase) and PascalCase (legacy Sheets rows)
    tin: (raw.tin as string) ?? (raw.TIN as string) ?? undefined,
    fs_no: (raw.fs_no as string) ?? (raw.FS_No as string) ?? undefined,
    subtotal: parseNumeric((raw.subtotal as number | string) ?? (raw.Subtotal as number | string)),
    vat_amount: parseNumeric(
      (raw.vat_amount as number | string) ??
        (raw.VAT_Amount as number | string) ??
        (raw.VAT as number | string),
    ),
  };
};

interface UseInvoiceListReturn {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  sortBy: 'date' | 'vendor' | 'amount';
  setSortBy: (sort: 'date' | 'vendor' | 'amount') => void;
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
  clearFilters: () => void;
  refetch: () => void;
  /** Delete an invoice from Supabase. Returns true on success, false on failure. */
  deleteInvoice: (id: string) => Promise<boolean>;
  totalCount: number;
}

export const useInvoiceList = (): UseInvoiceListReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'vendor' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /** Tracks the active Supabase Realtime channel so we can unsubscribe on unmount. */
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  /** Incremented on every Realtime INSERT — triggers a cache-bust refetch. */
  const realtimeInsertVersion = useRef(0);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // RLS scopes this query to auth.uid() automatically — no .eq('user_id', …) needed.
      const { data, error: supabaseError } = await supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false })
        .limit(MAX_HISTORY);

      if (supabaseError) {
        console.error('[useInvoiceList] Failed to load invoices from Supabase:', supabaseError);
        setError('Could not load invoice history.');
        setInvoices([]);
        return;
      }

      const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
      const normalized = rows.map(normalizeInvoice).slice(0, MAX_HISTORY);
      setInvoices(normalized);

      console.log(`[useInvoiceList] Fetched ${normalized.length} invoices.`);
    } catch (err) {
      console.error('[useInvoiceList] Failed to load invoices:', err);
      setError('Could not load invoice history.');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ── Supabase Realtime Subscription ───────────────────────────────────────

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      // Get the current user ID for the filter
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        console.warn(
          '[useInvoiceList] No authenticated session — cannot set up Realtime subscription. ' +
            'The invoice list will not receive live updates.',
        );
        return;
      }

      // Tear down any existing channel (safety net)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `invoice-list-${userId}`;

      console.log(`[useInvoiceList] Opening Realtime channel "${channelName}"`);

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'invoices',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('[useInvoiceList] Realtime INSERT event received:', payload.new);

            const row = payload.new as Record<string, unknown>;
            const normalized = normalizeInvoice(row, Date.now());

            setInvoices((prev) => {
              // Avoid duplicates
              if (prev.some((inv) => inv.id === normalized.id)) return prev;
              // Prepend the new invoice and cap at MAX_HISTORY.
              return [normalized, ...prev].slice(0, MAX_HISTORY);
            });

            // ── Cache-bust refetch ────────────────────────────────────────
            // The optimistic prepend above makes the UI responsive immediately,
            // but a full refetch ensures the sort order is correct and any
            // concurrent inserts are picked up. This also synchronizes the
            // list with the upload flow's `latestProcessedInvoice`.
            realtimeInsertVersion.current += 1;
            fetchInvoices();
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'invoices',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const deletedId = (payload.old as Record<string, unknown>).id as string;
            if (!deletedId) return;

            console.log(`[useInvoiceList] Realtime DELETE event for id=${deletedId}`);
            setInvoices((prev) => prev.filter((inv) => inv.id !== deletedId));
          },
        )
        .subscribe((subStatus, err) => {
          switch (subStatus) {
            case 'SUBSCRIBED':
              console.log(`[useInvoiceList] Channel "${channelName}" is SUBSCRIBED.`);
              break;

            case 'CHANNEL_ERROR':
              console.error(
                `[useInvoiceList] Realtime connection FAILED for channel "${channelName}":`,
                err,
              );
              break;

            case 'CLOSED':
              console.log(`[useInvoiceList] Channel "${channelName}" closed.`);
              break;

            case 'TIMED_OUT':
              console.warn(`[useInvoiceList] Channel "${channelName}" timed out.`);
              break;

            default:
              console.log(
                `[useInvoiceList] Channel "${channelName}" status: ${subStatus}`,
              );
          }
        });

      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      // Clean up the Realtime subscription on unmount
      if (channelRef.current) {
        console.log('[useInvoiceList] Cleaning up Realtime channel on unmount.');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // Intentionally empty — run once on mount. The userId is stable within a
    // session and fetchInvoices is stable ([] deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter & Sort ────────────────────────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Text search — vendor name or items summary
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.vendor.toLowerCase().includes(term) ||
          (inv.items_summary && inv.items_summary.toLowerCase().includes(term)),
      );
    }

    // Date range
    if (dateFrom) {
      result = result.filter((inv) => inv.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((inv) => inv.date <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (sortBy === 'vendor') {
        valA = a.vendor.toLowerCase();
        valB = b.vendor.toLowerCase();
      } else {
        valA = a.grand_total;
        valB = b.grand_total;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, searchTerm, dateFrom, dateTo, sortBy, sortOrder]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setSortBy('date');
    setSortOrder('desc');
  }, []);

  const refetch = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  /**
   * Delete an invoice from the Supabase database.
   *
   * On success the row is removed from the remote table and the local list
   * is refreshed so every client sees the same state.  On failure the row
   * stays untouched and an error toast is shown.
   */
  const deleteInvoice = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase.from('invoices').delete().eq('id', id);

        if (deleteError) {
          console.error('[useInvoiceList] Failed to delete invoice:', deleteError);
          toast.error('Could not delete invoice. Please try again.');
          return false;
        }

        toast.success('Invoice deleted.', { duration: 2500 });
        // Re-fetch so local state matches the database.
        // (The Realtime DELETE handler above already removes it optimistically,
        // but a refetch ensures sort order and limit are correct.)
        await fetchInvoices();
        return true;
      } catch (err) {
        console.error('[useInvoiceList] Failed to delete invoice:', err);
        toast.error('Something went wrong. Please try again.');
        return false;
      }
    },
    [fetchInvoices],
  );

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    invoices,
    filteredInvoices,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    clearFilters,
    refetch,
    deleteInvoice,
    totalCount: invoices.length,
  };
};
