import React, { useState } from 'react';
import { useInvoiceList } from '../hooks/useInvoiceList';
import FilterBar from '../components/FilterBar';
import InvoiceTable from '../components/InvoiceTable';
import DetailsModal from '../components/DetailsModal';
import { useLanguage } from '../components/LanguageProvider';
import { Invoice } from '../types/invoice';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { RefreshCcw, ShieldCheck, WalletCards } from 'lucide-react';

const Invoices: React.FC = () => {
  const { t, textClass, isAmharic } = useLanguage();
  const {
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
    totalCount,
  } = useInvoiceList();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleSort = (field: 'date' | 'vendor' | 'amount') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Vendor: ${invoice.vendor}`, 20, 32);
    doc.text(`Date: ${invoice.date}`, 20, 39);
    doc.text(`Grand Total: ${invoice.grand_total} ETB`, 20, 46);

    const tableData = (invoice.items || []).map(item => [
      item.name,
      item.quantity,
      item.unit_price,
      item.total,
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    doc.save(`invoice-${invoice.vendor.toLowerCase().replace(/\s/g, '-')}.pdf`);
  };

  const handleDelete = async (id: string) => {
    await deleteInvoice(id);
  };

  const SkeletonRow = () => (
    <tr>
      <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-32 rounded" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
      <td className="px-4 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-40 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded-full mx-auto" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
    </tr>
  );

  const skeletonHeaders = [
    'table.date',
    'table.vendor',
    'table.taxIds',
    'table.subtotal',
    'table.vat',
    'table.grandTotal',
    'table.items',
    'table.source',
    'table.actions',
  ] as const;

  return (
    <div className={textClass}>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('invoices.title')}</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('invoices.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="ui-surface rounded-xl px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <WalletCards className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              <span>{t('invoices.totalVisible')}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {t('invoices.count', { count: filteredInvoices.length })}
            </div>
          </div>
          <div className="ui-surface rounded-xl px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
              <span>{t('invoices.compliance')}</span>
            </div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{t('invoices.complianceValue')}</div>
          </div>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:text-cyan-300"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> {t('invoices.refresh')}
          </button>
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        totalCount={totalCount}
        filteredCount={filteredInvoices.length}
        onClear={clearFilters}
      />

      {isLoading ? (
        <div className="invoice-table-shell ui-surface overflow-hidden rounded-2xl">
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
                {skeletonHeaders.map((key) => (
                  <th
                    key={key}
                    className={`invoice-table-th ${isAmharic ? 'i18n-am-header' : ''} ${
                      key === 'table.subtotal' || key === 'table.vat' || key === 'table.grandTotal' || key === 'table.actions'
                        ? 'invoice-table-th--right'
                        : key === 'table.source'
                          ? 'invoice-table-th--center'
                          : ''
                    } ${key === 'table.actions' ? 'pr-5' : ''}`}
                  >
                    <span className="inline-flex flex-wrap items-center gap-0.5 leading-snug">{t(key)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
          </div>
        </div>
      ) : error ? (
        <div className="ui-surface rounded-2xl p-5 text-center">
          <p className="font-semibold text-red-600 dark:text-red-300">{t('invoices.loadFailed')}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button onClick={refetch} className="mt-4 text-sm text-cyan-600 underline dark:text-cyan-300">{t('invoices.retry')}</button>
        </div>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onView={setSelectedInvoice}
          onDelete={handleDelete}
          onDownload={handleDownload}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      <DetailsModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};

export default Invoices;