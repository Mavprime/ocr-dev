import React, { useState } from 'react';
import { useInvoiceUpload } from '../hooks/useInvoiceUpload';
import UploadZone from '../components/UploadZone';
import ResultsCard from '../components/ResultsCard';
import DetailsModal from '../components/DetailsModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Invoice } from '../types/invoice';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const INVOICES_URL = import.meta.env.VITE_API_INVOICES_URL;

const MAX_HISTORY = 15;

/** Same normalisation as useInvoiceList so the modal gets a proper Invoice shape. */
const normalizeInvoice = (raw: any, idx: number): Invoice => {
  const grand = raw.grand_total ?? raw['Total Amount'] ?? raw.total ?? 0;
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

const fetchLatestInvoice = async (): Promise<Invoice | null> => {
  const response = await axios.get(INVOICES_URL, { timeout: 20000 });
  const body = response.data;
  const rows: any[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
    ? body.data
    : body && typeof body === 'object' && (body.vendor !== undefined || body.Vendor !== undefined)
    ? [body]
    : [];

  const invoices = rows.map(normalizeInvoice).slice(0, MAX_HISTORY);
  // Return the newest by date
  if (!invoices.length) return null;
  invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return invoices[0];
};

const Upload: React.FC = () => {
  const { uploadFile, status, progress, data, error, reset } = useInvoiceUpload();
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInvoice, setModalInvoice] = useState<Invoice | null>(null);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);

  const handleFileSelect = (file: File) => {
    reset();
    uploadFile(file);
  };

  const handleDownload = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invoice', 20, 20);
    doc.setFontSize(12);
    doc.text(`Vendor: ${data.vendor}`, 20, 32);
    doc.text(`Date: ${data.date}`, 20, 39);
    doc.text(`Grand Total: ${data.grand_total} ETB`, 20, 46);

    (doc as any).autoTable({
      startY: 55,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: (data.items || []).map((i) => [i.name, i.quantity, i.unit_price, i.total]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    doc.save(`invoice-${(data.vendor || 'invoice').toLowerCase().replace(/\s/g, '-')}.pdf`);
  };

  /** Fetch the latest invoice from the API and open it in the detail modal. */
  const handleViewLatestInvoice = async () => {
    setIsFetchingInvoice(true);
    try {
      const latest = await fetchLatestInvoice();
      if (latest) {
        setModalInvoice(latest);
        setShowDetailModal(true);
      } else {
        toast.error('No invoices found yet. Try again in a moment.', { duration: 4000 });
        navigate('/invoices');
      }
    } catch {
      toast.error('Could not fetch invoice. Check your connection.', { duration: 4000 });
      navigate('/invoices');
    } finally {
      setIsFetchingInvoice(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Upload Your Invoice</h1>
        <p className="text-neutral-600 mt-1">Quick, accurate invoice processing</p>
      </div>

      {/* Initial upload zone */}
      {status === 'idle' && <UploadZone onFileSelect={handleFileSelect} disabled={false} />}

      {/* Upload progress (sending bytes) */}
      {status === 'uploading' && (
        <div className="mt-6 bg-white rounded-2xl p-8 border border-neutral-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-700">Uploading file...</span>
            <span className="font-mono text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary progress-bar rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-neutral-500 text-center">Sending your invoice...</p>
        </div>
      )}

      {/* Processing (n8n running OCR + AI) */}
      {status === 'processing' && (
        <div className="mt-6 bg-white rounded-2xl p-10 border border-neutral-200 text-center">
          <div className="w-14 h-14 mx-auto mb-5 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            Reading your invoice…
          </h3>
          <p className="text-neutral-500">
            Extracting vendor, date and totals with Document AI + DeepSeek. This usually takes a few seconds.
          </p>
        </div>
      )}

      {/* Uploaded — file received, processing in background (OCR-3.0) */}
      {status === 'uploaded' && (
        <div className="mt-6 bg-white rounded-2xl p-10 border border-green-200 text-center">
          <div className="w-14 h-14 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-1">
            Upload Successful!
          </h3>
          <p className="text-neutral-500 mb-4">
            Your invoice has been received and is being processed in the background.
            It will appear in your invoice list shortly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleViewLatestInvoice}
              disabled={isFetchingInvoice}
              className="px-6 py-2.5 bg-primary hover:bg-blue-600 disabled:opacity-70 text-white rounded-2xl font-semibold transition-colors"
            >
              {isFetchingInvoice ? 'Loading…' : 'View Invoice'}
            </button>
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-2xl font-medium transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Completed — show the extracted result */}
      {status === 'completed' && data && (
        <div className="mt-6">
          <ResultsCard
            data={data}
            onSave={() => {
              toast.success('Saved to your Google Sheet.', { icon: '🗂️' });
              navigate('/invoices');
            }}
            onUploadAnother={reset}
            onDownload={handleDownload}
            onViewInvoice={() => setShowDetailModal(true)}
          />
        </div>
      )}

      {/* Detail modal — shown for completed extraction or fetched latest invoice */}
      <DetailsModal
        invoice={showDetailModal ? (modalInvoice || data || null) : null}
        onClose={() => { setShowDetailModal(false); setModalInvoice(null); }}
      />

      {/* Error state */}
      {status === 'failed' && error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-error mt-0.5">⚠️</div>
            <div className="flex-1">
              <p className="font-medium text-red-800">Upload failed</p>
              <p className="text-red-700 mt-1 text-sm">{error}</p>
              <button
                onClick={reset}
                className="mt-3 text-sm px-4 py-1.5 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-8 text-center text-xs text-neutral-500">
        Supports PDF, JPG and PNG • Up to 10MB • Powered by n8n + AI
      </div>
    </div>
  );
};

export default Upload;
