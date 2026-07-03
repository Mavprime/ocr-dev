import React, { useEffect } from 'react';
import { Invoice, InvoiceData } from '../types/invoice';
import { BadgeCheck, Download, ReceiptText, X } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLanguage } from './LanguageProvider';

interface DetailsModalProps {
  invoice: Invoice | InvoiceData | null;
  onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ invoice, onClose }) => {
  const { t, textClass, isAmharic } = useLanguage();
  const thClass = `px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 ${isAmharic ? 'i18n-am-header whitespace-normal text-xs leading-snug' : ''}`;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!invoice) return null;

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
      return format(new Date(dateStr), 'dd MMMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Vendor: ${invoice.vendor}`, 20, 32);
    doc.text(`Date: ${formatDate(invoice.date)}`, 20, 39);
    doc.text(`TIN: ${invoice.tin || '-'}`, 20, 46);
    doc.text(`FS No: ${invoice.fs_no || '-'}`, 20, 53);
    doc.text(`Source: ${invoice.source || 'web'}`, 20, 60);

    const tableData = (invoice.items || []).map(item => [
      item.name,
      item.quantity.toString(),
      safeCurrency(item.unit_price),
      safeCurrency(item.total),
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text(`Grand Total: ${safeCurrency(invoice.grand_total)}`, 20, finalY + 15);

    doc.save(`invoice-${invoice.vendor.replace(/\s+/g, '-')}.pdf`);
  };

  const detailFields = [
    { label: t('modal.date'), value: formatDate(invoice.date) },
    { label: t('modal.source'), value: invoice.source || 'web' },
    { label: t('table.tin'), value: invoice.tin || '-' },
    { label: t('table.fsNo'), value: invoice.fs_no || '-' },
    { label: t('modal.subtotal'), value: safeCurrency(invoice.subtotal) },
    { label: t('modal.vat'), value: safeCurrency(invoice.vat_amount) },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className={`modal ui-surface max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl ${textClass}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/82 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
              <ReceiptText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t('modal.details')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('modal.reviewExport')}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-300 dark:hover:text-slate-100" aria-label={t('modal.close')}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="uppercase text-xs tracking-[1px] text-slate-500 dark:text-slate-400">{t('modal.vendor')}</div>
              <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">{invoice.vendor}</div>
            </div>
            <div className="text-right">
              <div className="uppercase text-xs tracking-[1px] text-slate-500 dark:text-slate-400">{t('modal.totalAmount')}</div>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-300">{safeCurrency(invoice.grand_total)}</div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {detailFields.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-200/70 bg-white/72 px-3 py-2.5 dark:border-slate-800/80 dark:bg-slate-950/45">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
              </div>
            ))}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('modal.items')}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{invoice.items?.length || 0}</div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <BadgeCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              <h3 className="font-semibold">{t('modal.lineItems')}</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white/75 dark:border-slate-800/80 dark:bg-slate-950/45">
              <table className={`w-full text-sm ${isAmharic ? 'min-w-[36rem]' : ''}`}>
                <thead className="bg-slate-100/80 dark:bg-slate-900/72">
                  <tr>
                    <th className={`${thClass} text-left`}>{t('results.item')}</th>
                    <th className={`${thClass} w-16 text-center`}>{t('results.qty')}</th>
                    <th className={`${thClass} min-w-[7rem] text-right`}>{t('modal.unit')}</th>
                    <th className={`${thClass} text-right`}>{t('results.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
                  {(invoice.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-cyan-500/5 dark:hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{item.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{safeCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 dark:text-slate-100">{safeCurrency(item.total)}</td>
                    </tr>
                  ))}
                  {(!invoice.items || invoice.items.length === 0) && (
                    <tr><td colSpan={4} className="p-4 text-center text-slate-500 dark:text-slate-400">{t('modal.noItems')}</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/80 font-semibold dark:bg-slate-900/72">
                    <td colSpan={3} className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{t('table.grandTotal')}</td>
                    <td className="px-4 py-3 text-right text-lg font-mono text-cyan-600 dark:text-cyan-300">{safeCurrency(invoice.grand_total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {invoice.items_summary && (
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('modal.itemsSummary')}</div>
              <div className="mt-1 rounded-2xl border border-dashed border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-slate-700 dark:text-slate-300">{invoice.items_summary}</div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-slate-200/70 bg-white/82 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72">
          <button
            onClick={downloadPDF}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Download className="h-4 w-4" /> {t('modal.downloadPdf')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 py-2.5 text-sm font-medium text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-200 dark:hover:text-cyan-300"
          >
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;