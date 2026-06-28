import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Invoice } from '../types/invoice';

// Full URL of the n8n "get-invoices" webhook (returns the 15 most recent rows from Google Sheets).
const INVOICES_URL =
  import.meta.env.VITE_API_INVOICES_URL ||
  `${import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'}/get-invoices`;

const MAX_HISTORY = 15;

/** Map a raw row (formatted by n8n, or a bare Google Sheet row) into our Invoice shape. */
const normalizeInvoice = (raw: any, idx: number): Invoice => {
  const grand =
    raw.grand_total ?? raw['Total Amount'] ?? raw.total ?? 0;
  return {
    id: raw.id || `${raw.date || raw.Date || ''}-${raw.vendor || raw.Vendor || ''}-${idx}`,
    vendor: raw.vendor ?? raw.Vendor ?? 'Unknown',
    date: raw.date ?? raw.Date ?? '',
    grand_total: typeof grand === 'number' ? grand : parseFloat(String(grand).replace(/[^0-9.\-]/g, '')) || 0,
    items_summary: raw.items_summary ?? raw.Summary ?? '',
    items: Array.isArray(raw.items) ? raw.items : [],
    source: raw.source ?? raw.Source ?? 'web',
    created_at: raw.created_at ?? raw.date ?? raw.Date ?? '',
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
  deleteInvoice: (id: string) => void;
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

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(INVOICES_URL, { timeout: 20000 });

      // n8n may return a bare array, { data: [...] }, or — when the sheet has a
      // single row — a bare object. Normalize all of these to an array.
      const body = response.data;
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : body && typeof body === 'object' && (body.vendor !== undefined || body.Vendor !== undefined)
        ? [body]
        : [];

      const normalized = rows.map(normalizeInvoice).slice(0, MAX_HISTORY);
      setInvoices(normalized);
    } catch (err) {
      console.error('Failed to load invoices from Google Sheets:', err);
      setError(
        axios.isAxiosError(err) && !err.response
          ? 'Could not reach the server. Check the get-invoices webhook URL and that the workflow is active.'
          : 'Could not load invoice history.'
      );
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filtering and Sorting
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(inv =>
        inv.vendor.toLowerCase().includes(term) ||
        (inv.items_summary && inv.items_summary.toLowerCase().includes(term))
      );
    }

    // Date range
    if (dateFrom) {
      result = result.filter(inv => inv.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(inv => inv.date <= dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

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

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const refetch = () => {
    fetchInvoices();
  };

  // Hides the row from the current view only. The Google Sheet remains the source of
  // truth, so a Refresh will bring it back unless you also delete the row in Sheets.
  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

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
