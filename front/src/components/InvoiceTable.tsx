import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { FaEye, FaDownload, FaTrash, FaArrowUp, FaArrowDown, FaSort } from 'react-icons/fa';
import { format } from 'date-fns';

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
  const itemsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateShort = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleSort = (field: 'date' | 'vendor' | 'amount') => {
    onSort(field);
  };

  const renderSortIcon = (field: 'date' | 'vendor' | 'amount') => {
    if (sortBy !== field) return <FaSort className="inline ml-1 w-3 h-3 opacity-50" />;
    return sortOrder === 'asc' 
      ? <FaArrowUp className="inline ml-1 w-3 h-3" /> 
      : <FaArrowDown className="inline ml-1 w-3 h-3" />;
  };

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-neutral-200 rounded-3xl">
        <div className="text-5xl mb-3">📄</div>
        <p className="text-lg font-medium text-neutral-700">No invoices yet</p>
        <p className="text-neutral-500 mt-1">Upload your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container bg-white border border-neutral-200 rounded-3xl overflow-hidden">
        <table className="w-full text-sm invoice-table">
          <thead className="bg-neutral-50">
            <tr>
              <th 
                className="text-left px-6 py-4 font-semibold cursor-pointer select-none hover:bg-neutral-100" 
                onClick={() => handleSort('date')}
              >
                Date {renderSortIcon('date')}
              </th>
              <th 
                className="text-left px-6 py-4 font-semibold cursor-pointer select-none hover:bg-neutral-100" 
                onClick={() => handleSort('vendor')}
              >
                Vendor {renderSortIcon('vendor')}
              </th>
              <th 
                className="text-right px-6 py-4 font-semibold cursor-pointer select-none hover:bg-neutral-100" 
                onClick={() => handleSort('amount')}
              >
                Amount {renderSortIcon('amount')}
              </th>
              <th className="text-left px-6 py-4 font-semibold">Items</th>
              <th className="text-center px-6 py-4 font-semibold">Source</th>
              <th className="text-right px-6 py-4 font-semibold pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {currentInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 text-neutral-700 whitespace-nowrap">
                  {formatDateShort(invoice.date)}
                </td>
                <td className="px-6 py-4 font-medium text-neutral-900">
                  {invoice.vendor}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-neutral-900 whitespace-nowrap">
                  {formatCurrency(invoice.grand_total)}
                </td>
                <td className="px-6 py-4 text-neutral-600 max-w-[260px] truncate">
                  {invoice.items_summary || (invoice.items?.length ? `${invoice.items.length} items` : '-')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    invoice.source === 'web' ? 'bg-blue-100 text-blue-700' : 
                    invoice.source === 'email' ? 'bg-purple-100 text-purple-700' : 
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {invoice.source || 'web'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(invoice)}
                      className="p-2 text-neutral-500 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                      aria-label="View details"
                      title="View details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(invoice)}
                      className="p-2 text-neutral-500 hover:text-success hover:bg-success/10 rounded-xl transition"
                      aria-label="Download invoice"
                      title="Download"
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this invoice?')) {
                          onDelete(invoice.id);
                        }
                      }}
                      className="p-2 text-neutral-500 hover:text-error hover:bg-error/10 rounded-xl transition"
                      aria-label="Delete invoice"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2 text-sm">
          <div className="text-neutral-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-4 py-1.5 border border-neutral-300 rounded-xl disabled:opacity-40 hover:bg-neutral-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-1.5 border border-neutral-300 rounded-xl disabled:opacity-40 hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
