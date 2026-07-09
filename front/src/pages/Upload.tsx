import React, { useMemo, useState } from 'react';
import { useInvoiceUpload } from '../hooks/useInvoiceUpload';
import { useInvoiceList } from '../hooks/useInvoiceList';
import UploadZone from '../components/UploadZone';
import ResultsCard from '../components/ResultsCard';
import DetailsModal from '../components/DetailsModal';
import { useNavigate } from 'react-router-dom';
import { Invoice } from '../types/invoice';
import supabase from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  LoaderCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../components/AuthProvider';
import { useLanguage } from '../components/LanguageProvider';

const fetchLatestInvoice = async (): Promise<Invoice | null> => {
  // RLS handles tenant isolation — no explicit user_id filter needed.
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as Invoice;
};

const Upload: React.FC = () => {
  const { uploadFile, status, progress, data, error, reset } = useInvoiceUpload();
  const { totalCount, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } = useInvoiceList();
  const { t, textClass } = useLanguage();
  const { isAnonymous } = useAuth();
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalInvoice, setModalInvoice] = useState<Invoice | null>(null);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);

  const checklist = useMemo(
    () => [
      {
        key: 'upload',
        label: t('upload.step.upload'),
        sublabel: t('upload.step.uploadSub'),
        state: status === 'idle' ? 'idle' : status === 'uploading' ? 'active' : 'done',
      },
      {
        key: 'layout',
        label: t('upload.step.read'),
        sublabel: status === 'processing' ? t('upload.processingLayout') : t('upload.step.readSub'),
        state: status === 'processing' ? 'active' : status === 'uploaded' || status === 'completed' ? 'done' : 'idle',
      },
      {
        key: 'tax',
        label: t('upload.step.prepare'),
        sublabel: t('upload.step.prepareSub'),
        state: status === 'uploaded' ? 'active' : status === 'completed' ? 'done' : 'idle',
      },
    ],
    [status, t],
  );

  const progressLabel =
    status === 'uploading'
      ? `${progress}%`
      : status === 'processing'
        ? t('upload.progress.reading')
        : t('upload.progress.finalizing');

  /** Reset upload state AND refresh the invoice count for the limit guard. */
  const handleReset = () => {
    reset();
    refetchHistory();
  };

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
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 ${textClass}`}>{t('upload.title')}</h1>
          <p className={`mt-1 text-sm text-slate-500 dark:text-slate-400 ${textClass}`}>{t('upload.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="ui-surface rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ScanSearch className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
              {t('upload.freeTrial')}
            </div>
            <div className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">{t('upload.usedCount', { count: totalCount, max: 3 })}</div>
          </div>
          <div className="ui-surface rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
              {t('upload.formats')}
            </div>
            <div className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">PDF, JPG, PNG</div>
          </div>
        </div>
      </div>

      {status === 'idle' && (
        <>
          {isHistoryLoading ? (
            <div>
              <UploadZone onFileSelect={handleFileSelect} disabled={false} />
              <p className={`mt-3 text-center text-xs text-slate-500 dark:text-slate-400 ${textClass}`}>{t('upload.checkingLimit')}</p>
            </div>
          ) : historyError ? (
            <div>
              <UploadZone onFileSelect={handleFileSelect} disabled={false} />
              <p className={`mt-3 text-center text-xs text-amber-600 dark:text-amber-300 ${textClass}`}>
                {t('upload.limitCheckFailed')}
              </p>
            </div>
          ) : totalCount >= 3 ? (
            <div>
              <UploadZone onFileSelect={handleFileSelect} disabled={true} />
              <div className="ui-surface mt-3 rounded-2xl overflow-hidden">
                <div className="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_42%)] px-5 py-5">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                    <Crown className="h-3.5 w-3.5" />
                    {t('upload.premium')}
                  </div>
                  <p className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${textClass}`}>
                    {t('upload.freeUploadsUsed')}
                  </p>
                  <p className={`mb-4 mt-2 text-sm text-slate-600 dark:text-slate-300 ${textClass}`}>
                    {t('upload.limitDesc')}
                  </p>
                  {isAnonymous ? (
                    /* Anonymous guest — prompt account creation first */
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        {t('auth.signupButton')}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/upgrade')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
                      >
                        {t('upgrade.title')}
                      </button>
                    </div>
                  ) : (
                    /* Permanent account — upgrade flow */
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/upgrade')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        {t('upgrade.title')}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <a
                        href="https://wa.me/251701681571"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
                      >
                        {t('upload.upgradeWhatsapp')}
                      </a>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200/70 bg-white/60 px-6 py-4 text-left text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-400">
                  {t('upload.upgradeNote')}
                  {isAnonymous && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
                      >
                        {t('auth.signupButton')} &rarr;
                      </button>
                      <span className="ml-1">{t('auth.noAccount')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <UploadZone onFileSelect={handleFileSelect} disabled={false} />
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('upload.freeUsed', { count: totalCount, max: 3 })}
              </p>
            </div>
          )}
        </>
      )}

      {(status === 'uploading' || status === 'processing' || status === 'uploaded') && (
        <div className="ui-surface mt-5 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {t('upload.processing')}
              </div>
              <h3 className={`mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${textClass}`}>
                {status === 'uploaded' ? t('upload.almostReady') : t('upload.working')}
              </h3>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              {progressLabel}
            </div>
          </div>

          {status === 'uploading' && (
            <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80">
              <div
                className="progress-bar h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="space-y-3">
            {checklist.map((step) => (
              <div
                key={step.key}
                className={`rounded-2xl border px-4 py-3 transition-all ${
                  step.state === 'done'
                    ? 'border-cyan-500/18 bg-cyan-500/8'
                    : step.state === 'active'
                    ? 'border-cyan-500/28 bg-cyan-500/10'
                    : 'border-slate-200/70 bg-white/60 dark:border-slate-800/80 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-cyan-600 dark:bg-slate-950/45 dark:text-cyan-300">
                    {step.state === 'done' ? (
                      <BadgeCheck className="h-4 w-4" />
                    ) : step.state === 'active' ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 opacity-60" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{step.label}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{step.sublabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {status === 'uploaded' && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleViewLatestInvoice}
                disabled={isFetchingInvoice}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70"
              >
                {isFetchingInvoice ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                {isFetchingInvoice ? t('upload.loading') : t('upload.viewInvoice')}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
              >
                {t('upload.another')}
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'completed' && data && (
        <div className="mt-6">
          <ResultsCard
            data={data}
            onSave={() => {
              toast.success(t('upload.saved'), { icon: '🗂️' });
              navigate('/invoices');
            }}
            onUploadAnother={handleReset}
            onDownload={handleDownload}
            onViewInvoice={() => setShowDetailModal(true)}
          />
        </div>
      )}

      <DetailsModal
        invoice={showDetailModal ? (modalInvoice || data || null) : null}
        onClose={() => { setShowDetailModal(false); setModalInvoice(null); }}
      />

      {status === 'failed' && error && (
        <div className="ui-surface mt-5 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-red-500 dark:text-red-300">⚠️</div>
            <div className="flex-1">
              <p className={`font-medium text-slate-900 dark:text-slate-100 ${textClass}`}>{t('upload.failed')}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
              >
                {t('upload.tryAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        {t('upload.footerFormats')}
      </div>
    </div>
  );
};

export default Upload;
