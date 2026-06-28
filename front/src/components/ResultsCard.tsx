import React from 'react';
import { InvoiceData } from '../types/invoice';
import { FaCheckCircle, FaSave, FaRedo, FaDownload, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-8 invoice-card">
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
          <FaCheckCircle className="text-success w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">Invoice Extracted</h3>
          <p className="text-sm text-success">Successfully processed</p>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">VENDOR</div>
          <div className="text-2xl font-semibold text-neutral-900">{data.vendor}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">DATE</div>
          <div className="text-2xl font-semibold text-neutral-900">{formatDate(data.date)}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-1">TOTAL</div>
          <div className="text-3xl font-bold text-primary amount">
            {formatCurrency(data.grand_total)}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-neutral-700 mb-3">LINE ITEMS</div>
        
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-center px-4 py-3 font-medium w-20">Qty</th>
                <th className="text-right px-4 py-3 font-medium">Unit Price</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{item.name}</td>
                    <td className="px-4 py-3 text-center text-neutral-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-neutral-500">
                    No line items extracted
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-neutral-50 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-neutral-700">Grand Total</td>
                <td className="px-4 py-3 text-right text-xl text-primary">
                  {formatCurrency(data.grand_total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary */}
      {data.items_summary && (
        <div className="mb-8 bg-neutral-50 rounded-2xl px-4 py-3 text-sm text-neutral-600">
          <span className="font-medium text-neutral-700">Summary:</span> {data.items_summary}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onViewInvoice && (
          <button
            onClick={onViewInvoice}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
          >
            <FaEye className="w-4 h-4" />
            View Invoice
          </button>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 disabled:opacity-70 text-neutral-700 px-6 py-3 rounded-2xl font-medium transition-colors"
        >
          <FaSave className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </button>

        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-2xl font-medium transition-colors"
        >
          <FaDownload className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={onUploadAnother}
          className="flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-2xl font-medium transition-colors"
        >
          <FaRedo className="w-4 h-4" />
          Upload Another
        </button>
      </div>
    </div>
  );
};

export default ResultsCard;
