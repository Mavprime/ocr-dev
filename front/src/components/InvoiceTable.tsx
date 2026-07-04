import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { ArrowDown, ArrowUp, Download, Eye, Inbox, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { useLanguage } from './LanguageProvider';

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDownload: (invoice: Invoice) => void;
  sortBy: 'date' | 'vendor' | 'amount';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'date' | 'vendor' | 'amount') => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onView,
  onDelete,
  onDownload,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { t, textClass, isAmharic } = useLanguage();
  const itemsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  const thLabel = isAmharic ? 'i18n-am-header' : '';
  const thBase = `invoice-table-th ${thLabel}`;
  const thSortable = `${thBase} cursor-pointer select-none transition-colors hover:bg-slate-100/80 hover:text-slate-800 dark:hover:bg-slate-700/50 dark:hover:text-white`;
  const thRight = `${thBase} invoice-table-th--right`;
  const thCenter = `${thBase} invoice-table-th--center`;

  const thContent = (label: string, sortIcon?: React.ReactNode) => (
    <span className="inline-flex flex-wrap items-center gap-0.5 leading-snug">
      <span>{label}</span>
      {sortIcon}
    </span>
  );

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

  const formatDateShort = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const renderSortIcon = (field: 'date' | 'vendor' | 'amount') => {
    if (sortBy !== field) {
      return <span className="ml-1 inline-block h-3 w-3 opacity-0 group-hover/th:opacity-30" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-cyan-600 dark:text-cyan-400" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-cyan-600 dark:text-cyan-400" />
    );
  };

  if (invoices.length === 0) {
    return (
      <div className="ui-surface rounded-2xl py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          <Inbox className="h-6 w-6" />
        </div>
        <p className={`text-lg font-medium text-slate-800 dark:text-slate-100 ${textClass}`}>{t('table.empty')}</p>
        <p className={`mt-1 text-slate-500 dark:text-slate-400 ${textClass}`}>{t('table.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="invoice-table-shell ui-surface overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <div className="table-container">
          <table className={`invoice-table text-sm ${isAmharic ? '' : 'w-full'}`}>
            <colgroup>
              <col className="col-date w-[7.5rem]" />
              <col className="col-vendor" />
              <col className="col-tax" />
              <col className="col-money" />
              <col className="col-money" />
              <col className="col-money" />
              <col className="col-items" />
              <col className="col-source w-[5.5rem]" />
              <col className="col-actions w-[7.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/95 dark:border-slate-700/90 dark:bg-slate-800/95">
                <th className={`group/th ${thSortable}`} onClick={() => onSort('date')}>
                  {thContent(t('table.date'), renderSortIcon('date'))}
                </th>
                <th className={`group/th ${thSortable}`} onClick={() => onSort('vendor')}>
                  {thContent(t('table.vendor'), renderSortIcon('vendor'))}
                </th>
                <th className={thBase}>{thContent(t('table.taxIds'))}</th>
                <th className={thRight}>{thContent(t('table.subtotal'))}</th>
                <th className={thRight}>{thContent(t('table.vat'))}</th>
                <th className={`group/th ${thRight} ${thSortable}`} onClick={() => onSort('amount')}>
                  {thContent(t('table.grandTotal'), renderSortIcon('amount'))}
                </th>
                <th className={thBase}>{thContent(t('table.items'))}</th>
                <th className={thCenter}>{thContent(t('table.source'))}</th>
                <th className={`${thRight} pr-5`}>{thContent(t('table.actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice, rowIndex) => (
                <tr
                  key={invoice.id}
                  className={`group/row border-b border-slate-100 transition-colors last:border-b-0 dark:border-slate-800/80 ${
                    rowIndex % 2 === 0
                      ? 'bg-white/60 dark:bg-slate-900/20'
                      : 'bg-slate-50/40 dark:bg-slate-900/35'
                  } hover:bg-cyan-500/[0.06] dark:hover:bg-cyan-500/[0.08]`}
                >
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {formatDateShort(invoice.date)}
                    </span>
                  </td>
                  <td className="col-vendor px-4 py-3.5 align-top font-medium text-slate-900 dark:text-slate-50">
                    {invoice.vendor}
                  </td>
                  <td className="col-tax px-4 py-3.5 align-top">
                    <div className="flex min-w-[8.5rem] flex-col gap-1.5">
                      <span className={`inline-flex w-fit max-w-full rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] leading-snug text-slate-700 dark:bg-slate-800 dark:text-slate-200 ${thLabel}`}>
                        <span className="shrink-0">{t('table.tin')}</span>{' '}
                        <span>{invoice.tin || '—'}</span>
                      </span>
                      <span className={`inline-flex w-fit max-w-full rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] leading-snug text-slate-700 dark:bg-slate-800 dark:text-slate-200 ${thLabel}`}>
                        <span className="shrink-0">{t('table.fsNo')}</span>{' '}
                        <span>{invoice.fs_no || '—'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-sm text-slate-700 dark:text-slate-200">
                    {safeCurrency(invoice.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-sm text-slate-700 dark:text-slate-200">
                    {safeCurrency(invoice.vat_amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-900 dark:text-cyan-300">
                    {safeCurrency(invoice.grand_total)}
                  </td>
                  <td className={`col-items max-w-[220px] truncate px-4 py-3.5 text-slate-600 dark:text-slate-300 ${isAmharic ? 'min-w-[10rem] max-w-[280px]' : ''} ${textClass}`}>
                    {invoice.items_summary ||
                      (invoice.items?.length ? t('table.itemsCount', { count: invoice.items.length }) : '—')}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <span className="inline-flex rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                        {invoice.source || 'web'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 pr-5">
                    <div className="flex items-center justify-end gap-1 opacity-90 transition-opacity group-hover/row:opacity-100">
                      <button
                        onClick={() => onView(invoice)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                        aria-label={t('table.viewDetails')}
                        title={t('table.viewDetails')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDownload(invoice)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                        aria-label={t('table.download')}
                        title={t('table.download')}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('table.deleteConfirm'))) {
                            onDelete(invoice.id);
                          }
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-500/40 dark:hover:text-red-400"
                        aria-label={t('table.delete')}
                        title={t('table.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className={`mt-4 flex items-center justify-between px-1 text-sm ${textClass}`}>
          <div className="text-slate-500 dark:text-slate-400">
            {t('table.page', { current: currentPage, total: totalPages })}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-slate-700 transition hover:text-cyan-600 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-300"
            >
              {t('table.previous')}
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200/70 bg-white/80 px-3.5 py-1.5 text-slate-700 transition hover:text-cyan-600 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-300"
            >
              {t('table.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;