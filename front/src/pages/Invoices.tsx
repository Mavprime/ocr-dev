import React, { useState } from 'react';
import { useInvoiceList } from '../hooks/useInvoiceList';
import FilterBar from '../components/FilterBar';
import InvoiceTable from '../components/InvoiceTable';
import DetailsModal from '../components/DetailsModal';
import { Invoice } from '../types/invoice';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaSync } from 'react-icons/fa';

const Invoices: React.FC = () => {
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

  const handleDelete = (id: string) => {
    deleteInvoice(id);
  };

  // Skeleton loading state
  const SkeletonRow = () => (
    <tr>
      <td className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-32 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-40 rounded" /></td>
      <td className="px-6 py-4"><div className="skeleton h-5 w-12 rounded-full mx-auto" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
    </tr>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Your Invoices</h1>
          <p className="text-neutral-500 mt-0.5">All processed invoices in one place</p>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-neutral-300 rounded-2xl hover:bg-neutral-50"
        >
          <FaSync className="w-3.5 h-3.5" /> Refresh
        </button>
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
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Vendor</th>
                <th className="text-right px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-center px-6 py-4">Source</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-red-700">Failed to load invoices</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button onClick={refetch} className="mt-4 text-sm underline">Retry</button>
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
