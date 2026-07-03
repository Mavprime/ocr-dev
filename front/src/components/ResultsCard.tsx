import React from 'react';
import { InvoiceData } from '../types/invoice';
import { ArrowRight, BadgeCheck, Download, Eye, RefreshCcw, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from './LanguageProvider';

interface ResultsCardProps {
  data: InvoiceData;
  onSave: () => void;
  onUploadAnother: () => void;
  onDownload: () => void;
  onViewInvoice?: () => void;
  isSaving?: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({
  data,
  onSave,
  onUploadAnother,
  onDownload,
  onViewInvoice,
  isSaving = false
}) => {
  const { t, textClass, isAmharic } = useLanguage();
  const thClass = `px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 ${isAmharic ? 'i18n-am-header whitespace-normal text-xs leading-snug' : ''}`;

  const safeCurrency = (amount: number | string | undefined | null): string => {
    if (amount == null) return '—';
    const n = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(n);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const specFields = [
    { label: t('results.vendor'), value: data.vendor || t('results.unknown') },
    { label: t('results.invoiceDate'), value: formatDate(data.date) },
    { label: t('results.grandTotal'), value: safeCurrency(data.grand_total), valueClass: 'font-mono text-cyan-600 dark:text-cyan-300' },
  ];

  return (
    <div className={`ui-surface rounded-2xl p-5 invoice-card animate-reveal-up ${textClass}`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t('results.extracted')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('results.reviewBeforeSave')}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
          {t('results.ready')}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-slate-200/70 bg-white/72 p-4 dark:border-slate-800/80 dark:bg-slate-950/45">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{t('results.lineItems')}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('results.rows', { count: data.items?.length || 0 })}</div>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-slate-200/70 dark:border-slate-800/80">
            <table className={`w-full text-sm ${isAmharic ? 'min-w-[36rem]' : ''}`}>
              <thead className="bg-slate-100/80 dark:bg-slate-900/70">
                <tr>
                  <th className={`${thClass} text-left`}>{t('results.item')}</th>
                  <th className={`${thClass} text-center`}>{t('results.qty')}</th>
                  <th className={`${thClass} min-w-[7rem] text-right`}>{t('results.unitPrice')}</th>
                  <th className={`${thClass} text-right`}>{t('results.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                {data.items && data.items.length > 0 ? (
                  data.items.map((item, index) => (
                    <tr key={index} className="bg-white/65 transition-colors hover:bg-cyan-500/5 dark:bg-transparent dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">{safeCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">{safeCurrency(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      {t('results.noItems')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.items_summary && (
            <div className="mt-4 rounded-[24px] border border-dashed border-cyan-500/25 bg-cyan-500/5 px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-100">{t('results.summary')}</span> {data.items_summary}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200/70 bg-white/72 p-5 dark:border-slate-800/80 dark:bg-slate-950/45">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{t('results.specSheet')}</div>
          {specFields.map(({ label, value, valueClass }) => (
            <div key={label} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900/55">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
              <div className={`mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 ${valueClass || ''}`}>{value}</div>
            </div>
          ))}

          <div className="grid gap-3 pt-2">
            {onViewInvoice && (
              <button
                onClick={onViewInvoice}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
              >
                <Eye className="h-4 w-4" />
                {t('results.view')}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:text-cyan-600 disabled:opacity-70 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('results.saving') : t('results.save')}
            </button>

            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
            >
              <Download className="h-4 w-4" />
              {t('results.downloadPdf')}
            </button>

            <button
              onClick={onUploadAnother}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
            >
              <RefreshCcw className="h-4 w-4" />
              {t('results.uploadAnother')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;