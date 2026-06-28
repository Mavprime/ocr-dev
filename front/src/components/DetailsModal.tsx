import React, { useEffect } from 'react';
import { Invoice, InvoiceData } from '../types/invoice';
import { FaTimes, FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DetailsModalProps {
  invoice: Invoice | InvoiceData | null;
  onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ invoice, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
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
    doc.text(`Source: ${invoice.source || 'web'}`, 20, 46);

    // Line items table
    const tableData = (invoice.items || []).map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.total),
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text(`Grand Total: ${formatCurrency(invoice.grand_total)}`, 20, finalY + 15);

    doc.save(`invoice-${invoice.vendor.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div 
        className="modal bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-neutral-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-neutral-900">Invoice Details</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 p-1" aria-label="Close">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="uppercase text-xs tracking-[1px] text-neutral-500">Vendor</div>
              <div className="font-semibold text-2xl">{invoice.vendor}</div>
            </div>
            <div className="text-right">
              <div className="uppercase text-xs tracking-[1px] text-neutral-500">Total Amount</div>
              <div className="text-3xl font-bold text-primary">{formatCurrency(invoice.grand_total)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
            <div><span className="text-neutral-500">Date:</span> {formatDate(invoice.date)}</div>
            <div><span className="text-neutral-500">Source:</span> {invoice.source || 'web'}</div>
            <div><span className="text-neutral-500">Items:</span> {invoice.items?.length || 0}</div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3 text-neutral-800">Line Items</h3>
            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-center px-4 py-3 w-16">Qty</th>
                    <th className="text-right px-4 py-3">Unit</th>
                    <th className="text-right px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(invoice.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  {(!invoice.items || invoice.items.length === 0) && (
                    <tr><td colSpan={4} className="p-4 text-center text-neutral-500">No items</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-50 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right">Grand Total</td>
                    <td className="px-4 py-3 text-right text-lg text-primary">{formatCurrency(invoice.grand_total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {invoice.items_summary && (
            <div>
              <div className="text-sm text-neutral-500">Items Summary</div>
              <div className="mt-1">{invoice.items_summary}</div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex gap-3">
          <button 
            onClick={downloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-2xl font-semibold hover:bg-blue-600"
          >
            <FaDownload /> Download PDF
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-neutral-300 font-medium hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
