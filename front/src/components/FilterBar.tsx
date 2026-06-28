import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  totalCount: number;
  filteredCount: number;
  onClear: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  totalCount,
  filteredCount,
  onClear,
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <FaSearch className="absolute left-4 top-3.5 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by vendor or item..."
            className="w-full pl-11 pr-4 py-2.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-primary text-sm"
            aria-label="Search invoices"
          />
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div>
            <label className="text-xs text-neutral-500 block mb-1 ml-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-neutral-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full md:w-auto"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1 ml-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-neutral-300 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full md:w-auto"
            />
          </div>
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-2 mt-auto px-4 py-2.5 text-sm text-neutral-600 hover:text-neutral-800 border border-neutral-300 rounded-2xl hover:bg-neutral-50 transition"
        >
          <FaTimes className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="mt-3 text-xs text-neutral-500 flex items-center gap-2">
        Showing <span className="font-semibold text-neutral-700">{filteredCount}</span> of {totalCount} invoices
      </div>
    </div>
  );
};

export default FilterBar;
