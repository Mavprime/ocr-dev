import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { InvoiceData, JobStatus } from '../types/invoice';
import api from '../lib/api';
import supabase from '../lib/supabaseClient';

// Webhook trigger path appended to VITE_API_URL (or its localhost fallback).
const UPLOAD_PATH = 'a2bdee7f-0dcd-490b-891d-2a5d182ebabc';

/**
 * The n8n web flow is synchronous: it receives the file, runs Google Document AI
 * + DeepSeek, writes to Google Sheets, and responds with the extracted invoice in
 * the SAME request. AI extraction can take a while, so allow a generous timeout.
 */
const PROCESS_TIMEOUT = 150000; // 150s for upload + OCR + AI extraction

interface UseInvoiceUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  status: JobStatus;
  progress: number;
  data: InvoiceData | null;
  error: string | null;
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
  // OCR-3.0 immediate acknowledgment: { status: "success", message: "...", job_id: "..." }
  if (payload?.status === 'success') {
    return { kind: 'ack', message: payload.message || 'File uploaded successfully!', job_id: payload.job_id };
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

/**
 * After OCR extraction succeeds, persist the invoice row into Supabase
 * so it shows up in the user's invoice history.
 *
 * No user_id is passed — RLS scopes the insert to the authenticated user.
 */
const saveInvoiceToSupabase = async (data: InvoiceData): Promise<void> => {
  const { error: insertError } = await supabase
    .from('invoices')
    .insert({
      vendor: data.vendor,
      date: data.date,
      grand_total: data.grand_total,
      items_summary: data.items_summary,
      items: data.items,
      source: data.source || 'web',
    });

  if (insertError) {
    console.error('Failed to save invoice to Supabase:', insertError);
    // Don't throw — the OCR succeeded, it just wasn't persisted locally.
    // The n8n workflow still wrote to Google Sheets as a fallback.
  }
};

export const useInvoiceUpload = (): UseInvoiceUploadReturn => {
  const [status, setStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    // Validation
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

    // Reset state
    setStatus('uploading');
    setProgress(0);
    setData(null);
    setError(null);

    // Fetch the active session access token for bearer auth
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    abortRef.current = controller;

    api.post(UPLOAD_PATH, formData, {
      timeout: PROCESS_TIMEOUT,
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      onUploadProgress: (progressEvent) => {
        if (!mountedRef.current) return;
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(pct);
          // Bytes are all sent — now n8n is doing OCR + AI extraction.
          if (pct >= 100) setStatus('processing');
        }
      },
    })
      .then((response) => {
        if (!mountedRef.current) return;

        const result = classifyResponse(response.data);

        if (result.kind === 'ack') {
          // OCR-3.0 immediate response — file received, processing in background
          setStatus('uploaded');
          toast.success(result.message, { icon: '📤', duration: 4000 });
        } else if (result.kind === 'invoice') {
          // Full invoice returned (legacy sync workflow or fast OCR)
          setData(result.data);
          setStatus('completed');
          toast.success('Invoice extracted successfully!', { icon: '✅', duration: 3000 });

          // Persist the extracted invoice to Supabase (RLS handles user scoping)
          saveInvoiceToSupabase(result.data);
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
        console.error('Upload error:', err);
      });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setProgress(0);
    setData(null);
    setError(null);
  }, []);

  return { uploadFile, status, progress, data, error, reset };
};
