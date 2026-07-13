import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Invoice, InvoiceData, JobStatus } from '../types/invoice';
import api from '../lib/api';
import supabase from '../lib/supabaseClient';

// Webhook trigger path appended to VITE_API_URL (or its localhost fallback).
const UPLOAD_PATH = '8a102812-cb84-422b-b168-a20f9de68f4b';

/**
 * The n8n web flow is synchronous: it receives the file, runs Google Document AI
 * + DeepSeek, writes to Google Sheets, and responds with the extracted invoice in
 * the SAME request. AI extraction can take a while, so allow a generous timeout.
 */
const PROCESS_TIMEOUT = 150_000; // 150s for upload + OCR + AI extraction

/**
 * Clock-drift buffer: accept Realtime INSERT events whose `created_at` falls
 * within this many milliseconds **before** the client-side upload start time.
 * Server clocks may lag up to 30 s behind the browser, so the window is
 * [uploadStart - 30s, +∞).
 */
const CLOCK_DRIFT_BUFFER_MS = 30_000;

interface UseInvoiceUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  status: JobStatus;
  progress: number;
  data: InvoiceData | null;
  error: string | null;
  /** The fully-hydrated invoice (with database id) from the Realtime INSERT
   *  event — null until background processing completes and the row appears
   *  in Supabase. Use this to open the detail modal / navigate to the exact
   *  invoice. */
  latestProcessedInvoice: Invoice | null;
  reset: () => void;
}

/**
 * Determine the type of response n8n returned.
 * OCR-3.0 sends an immediate success ack; older workflows return the full invoice.
 */
type UploadResponse =
  | { kind: 'ack'; message: string; job_id?: string }
  | { kind: 'invoice'; data: InvoiceData }
  | { kind: 'unknown' };

const classifyResponse = (payload: any): UploadResponse => {
  // OCR-3.0 immediate acknowledgment
  if (payload?.status === 'success') {
    return {
      kind: 'ack',
      message: payload.message || 'File uploaded successfully!',
      job_id: payload.job_id,
    };
  }

  // Full invoice response: { status: "completed", data: { vendor, date, grand_total, ... } }
  const d = payload?.data ?? payload;
  if (d && (d.vendor !== undefined || d.grand_total !== undefined)) {
    return {
      kind: 'invoice',
      data: {
        vendor: d.vendor ?? 'Unknown',
        date: d.date ?? '',
        grand_total: Number(d.grand_total) || 0,
        items_summary: d.items_summary ?? '',
        items: Array.isArray(d.items) ? d.items : [],
        source: d.source ?? 'web',
      },
    };
  }

  return { kind: 'unknown' };
};

// ── Row mappers ─────────────────────────────────────────────────────────────

/** Map a raw Supabase row to InvoiceData (no id). */
const rowToInvoiceData = (row: Record<string, unknown>): InvoiceData => ({
  vendor: (row.vendor as string) ?? 'Unknown',
  date: (row.date as string) ?? '',
  grand_total: Number(row.grand_total) || 0,
  items_summary: (row.items_summary as string) ?? '',
  items: Array.isArray(row.items) ? (row.items as InvoiceData['items']) : [],
  source: (row.source as string) ?? 'web',
  tin: (row.tin as string) ?? undefined,
  fs_no: (row.fs_no as string) ?? undefined,
  subtotal: typeof row.subtotal === 'number' ? row.subtotal : undefined,
  vat_amount: typeof row.vat_amount === 'number' ? row.vat_amount : undefined,
  upload_id: (row.upload_id as string) ?? undefined,
});

/** Map a raw Supabase row to a full Invoice (with id + created_at). */
const rowToInvoice = (row: Record<string, unknown>): Invoice => ({
  ...rowToInvoiceData(row),
  id: (row.id as string) || '',
  created_at: (row.created_at as string) ?? (row.date as string) ?? '',
});

// ── Persistence helpers ──────────────────────────────────────────────────────

/**
 * After OCR extraction succeeds, persist the invoice row into Supabase
 * so it shows up in the user's invoice history.
 *
 * user_id is set to auth.uid() so RLS policies can match the row to the
 * authenticated user on subsequent SELECT / DELETE queries.
 */
const saveInvoiceToSupabase = async (data: InvoiceData, uploadId?: string): Promise<Invoice | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    console.error('Cannot save invoice to Supabase: no authenticated session.');
    return null;
  }

  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    vendor: data.vendor,
    date: data.date,
    grand_total: data.grand_total,
    items_summary: data.items_summary,
    items: data.items,
    source: data.source || 'web',
  };

  // Include the client-generated upload_id so n8n and Realtime can correlate.
  if (uploadId) {
    insertPayload.upload_id = uploadId;
  }

  const { data: rows, error: insertError } = await supabase
    .from('invoices')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError) {
    console.error('Failed to save invoice to Supabase:', insertError);
    return null;
  }

  return rowToInvoice(rows as unknown as Record<string, unknown>);
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useInvoiceUpload = (): UseInvoiceUploadReturn => {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [latestProcessedInvoice, setLatestProcessedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  /** Active Supabase Realtime channel — torn down on unmount / reset / completion. */
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  /** Client-generated correlation token sent to n8n and matched in Realtime. */
  const uploadIdRef = useRef<string>('');
  /** Timestamp (ms) when the upload was initiated — used for the 30 s drift buffer. */
  const uploadStartedAtRef = useRef<number>(0);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      // Clean up any active Realtime subscription on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // ── Realtime helpers ─────────────────────────────────────────────────────

  /** Tear down the current Realtime channel if one is active. */
  const teardownChannel = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  /**
   * Shared handler: a matching INSERT row was received (via Realtime or
   * race-condition fetch). Transition the state machine to `completed`.
   */
  const onInvoiceRowReceived = useCallback(
    (row: Record<string, unknown>, source: 'realtime' | 'poll') => {
      if (!mountedRef.current) return;
      if (status === 'completed') return; // already handled

      const invoice = rowToInvoice(row);
      const invoiceData = rowToInvoiceData(row);

      setData(invoiceData);
      setLatestProcessedInvoice(invoice);
      setStatus('completed');

      const label = source === 'realtime' ? 'live Realtime event' : 'race-condition poll';
      console.log(`[useInvoiceUpload] Invoice matched via ${label}:`, invoice.id);
      toast.success('Invoice processed successfully!', { icon: '✅', duration: 3000 });

      // We got our result — tear down the subscription.
      teardownChannel();
    },
    // We intentionally read `status` inside via the closure; the ref guards
    // against double-fire, but this dependency keeps ESLint happy.
    [status, teardownChannel],
  );

  /**
   * Returns `true` when `row` plausibly belongs to the upload that's currently
   * in flight.
   *
   * Match order (first wins):
   * 1. Exact `upload_id` match — the gold standard, no clock concerns.
   * 2. `created_at` within the 30 s drift buffer of the client upload start time.
   * 3. If neither check can be performed (missing fields), accept the row.
   */
  const rowBelongsToCurrentUpload = useCallback((row: Record<string, unknown>): boolean => {
    const currentUploadId = uploadIdRef.current;

    // ── 1. Exact upload_id match ──────────────────────────────────────────
    const rowUploadId = row.upload_id as string | undefined;
    if (currentUploadId && rowUploadId) {
      return rowUploadId === currentUploadId;
    }

    // ── 2. Timestamp buffer ───────────────────────────────────────────────
    const createdAt = row.created_at as string | undefined;
    if (createdAt) {
      const rowTime = new Date(createdAt).getTime();
      if (Number.isNaN(rowTime)) return true; // unparseable — accept
      const earliestAcceptable = uploadStartedAtRef.current - CLOCK_DRIFT_BUFFER_MS;
      return rowTime >= earliestAcceptable;
    }

    // ── 3. No data to filter — accept ────────────────────────────────────
    return true;
  }, []);

  // ── Realtime Subscription ───────────────────────────────────────────────

  /**
   * Subscribe to Supabase Realtime INSERT events on the `invoices` table
   * filtered by the current user. When the n8n background pipeline finishes
   * and inserts the processed row, we transition `uploaded` → `completed`.
   *
   * Also performs a one-time fetch after the subscription is live to catch
   * rows that may have been inserted before the channel became active.
   */
  const subscribeToInvoiceInsert = useCallback(
    (userId: string) => {
      teardownChannel();

      const currentUploadId = uploadIdRef.current;
      const channelName = `invoice-upload-${userId}-${currentUploadId || Date.now()}`;

      console.log(
        `[useInvoiceUpload] Opening Realtime channel "${channelName}"` +
          (currentUploadId ? ` for upload_id=${currentUploadId}` : ''),
      );

      const channel = supabase
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
            if (!mountedRef.current) return;
            console.log('[useInvoiceUpload] Realtime INSERT event received:', payload.new);

            const row = payload.new as Record<string, unknown>;
            if (rowBelongsToCurrentUpload(row)) {
              onInvoiceRowReceived(row, 'realtime');
            } else {
              console.log(
                '[useInvoiceUpload] INSERT event ignored — does not belong to current upload.',
              );
            }
          },
        )
        .subscribe((subStatus, err) => {
          switch (subStatus) {
            case 'SUBSCRIBED':
              console.log(`[useInvoiceUpload] Channel "${channelName}" is SUBSCRIBED.`);

              // ── Race-condition guard ────────────────────────────────────
              // After the channel is live, do a single fetch for the latest
              // row. If n8n finished and inserted before our channel was
              // active, this catches it.
              supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .then(({ data: rows, error: fetchErr }) => {
                  if (!mountedRef.current) return;
                  if (fetchErr) {
                    console.error(
                      '[useInvoiceUpload] Race-condition poll failed:',
                      fetchErr,
                    );
                    return;
                  }
                  if (!rows || rows.length === 0) return;

                  const latest = rows[0] as Record<string, unknown>;
                  if (rowBelongsToCurrentUpload(latest)) {
                    console.log(
                      '[useInvoiceUpload] Race-condition poll found matching row — using it.',
                    );
                    onInvoiceRowReceived(latest, 'poll');
                  }
                });
              break;

            case 'CHANNEL_ERROR':
              console.error(
                `[useInvoiceUpload] Realtime connection FAILED for channel "${channelName}":`,
                err,
              );
              toast.error(
                'Live update connection failed. Please refresh the page if results do not appear.',
                { duration: 6000 },
              );
              break;

            case 'CLOSED':
              console.log(`[useInvoiceUpload] Channel "${channelName}" closed.`);
              break;

            case 'TIMED_OUT':
              console.warn(`[useInvoiceUpload] Channel "${channelName}" timed out.`);
              break;

            default:
              // 'joined', 'left', etc. — informational only
              console.log(
                `[useInvoiceUpload] Channel "${channelName}" status: ${subStatus}`,
              );
          }
        });

      channelRef.current = channel;
    },
    [teardownChannel, rowBelongsToCurrentUpload, onInvoiceRowReceived],
  );

  // ── Upload ──────────────────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File) => {
      // ── Validation ──────────────────────────────────────────────────────
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        const msg = 'Please upload a valid PDF or image (JPG, PNG).';
        setError(msg);
        toast.error(msg);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        const msg = 'File is too large. Maximum size is 10MB.';
        setError(msg);
        toast.error(msg);
        return;
      }

      // ── Reset state ─────────────────────────────────────────────────────
      setStatus('uploading');
      setProgress(0);
      setData(null);
      setLatestProcessedInvoice(null);
      setError(null);
      teardownChannel();

      // Generate a client-side correlation token. n8n receives it in the
      // multipart payload and can persist it to the `invoices` row so the
      // Realtime listener can do an exact-match lookup.
      const uploadId = crypto.randomUUID();
      uploadIdRef.current = uploadId;
      uploadStartedAtRef.current = Date.now();

      console.log(`[useInvoiceUpload] Starting upload ${uploadId}`);

      // ── Auth token ──────────────────────────────────────────────────────
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const userId = session?.user?.id;

      // ── Build request ───────────────────────────────────────────────────
      const formData = new FormData();
      formData.append('file', file);
      // Include the correlation token so n8n can persist it to the DB row.
      formData.append('upload_id', uploadId);
      if (userId) {
        formData.append('user_id', userId);
      }

      const controller = new AbortController();
      abortRef.current = controller;

      api
        .post(UPLOAD_PATH, formData, {
          timeout: PROCESS_TIMEOUT,
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          onUploadProgress: (progressEvent) => {
            if (!mountedRef.current) return;
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
              if (pct >= 100) setStatus('processing');
            }
          },
        })
        .then(async (response) => {
          if (!mountedRef.current) return;

          const result = classifyResponse(response.data);

          if (result.kind === 'ack') {
            // ── Async (OCR-3.0) path ────────────────────────────────────
            // n8n acknowledged receipt; background processing is underway.
            // Subscribe to Supabase Realtime so we know when the INSERT lands.
            setStatus('uploaded');
            toast.success(result.message, { icon: '📤', duration: 4000 });

            // Grab the current user ID for the Realtime filter.
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const activeUserId = currentSession?.user?.id;
            if (activeUserId) {
              subscribeToInvoiceInsert(activeUserId);
            } else {
              console.warn(
                '[useInvoiceUpload] No authenticated session — cannot subscribe to Realtime. ' +
                  'The UI will stay on "Preparing results…" until the user refreshes.',
              );
            }
          } else if (result.kind === 'invoice') {
            // ── Sync (legacy) path ──────────────────────────────────────
            // Full invoice returned inline — no Realtime subscription needed.
            setData(result.data);
            setStatus('completed');
            toast.success('Invoice extracted successfully!', { icon: '✅', duration: 3000 });

            // Persist to Supabase and capture the returned row so
            // latestProcessedInvoice has the database id.
            const saved = await saveInvoiceToSupabase(result.data, uploadId);
            if (saved) {
              setLatestProcessedInvoice(saved);
            }
          } else {
            setStatus('failed');
            const errMsg =
              (response.data as any)?.message ||
              'Processing finished but no invoice data was returned.';
            setError(errMsg);
            toast.error(errMsg);
          }
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          if (!mountedRef.current) return;

          setStatus('failed');

          let errorMessage = 'Something went wrong. Please try again.';

          if (axios.isAxiosError(err)) {
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
              errorMessage = 'Processing took too long. Try a smaller or clearer file.';
            } else if (!err.response) {
              errorMessage = 'Unable to reach the server. Check your connection and try again.';
            } else if (err.response.status === 413) {
              errorMessage = 'File is too large.';
            } else if (err.response.status === 404) {
              errorMessage = 'Service unavailable. Please try again later.';
            } else {
              errorMessage = (err.response.data as any)?.message || 'Upload failed.';
            }
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }

          setError(errorMessage);
          toast.error(errorMessage);
          console.error('[useInvoiceUpload] Upload error:', err);

          teardownChannel();
        });
    },
    [subscribeToInvoiceInsert, teardownChannel],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    teardownChannel();
    uploadIdRef.current = '';
    uploadStartedAtRef.current = 0;
    setStatus('idle');
    setProgress(0);
    setData(null);
    setLatestProcessedInvoice(null);
    setError(null);
  }, [teardownChannel]);

  return { uploadFile, status, progress, data, latestProcessedInvoice, error, reset };
};
