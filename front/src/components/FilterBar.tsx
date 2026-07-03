import React from 'react';
import { Search, X } from 'lucide-react';

import { useLanguage } from './LanguageProvider';

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
  const { t, textClass } = useLanguage();

  return (
    <div className="ui-surface mb-4 rounded-2xl p-3">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('filter.search')}
            className={`w-full rounded-2xl border border-slate-200/70 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-100 ${textClass}`}
            aria-label={t('filter.search')}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div>
            <label className={`ml-1 mb-1 block text-xs text-slate-500 dark:text-slate-400 ${textClass}`}>
              {t('filter.from')}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-500/10 md:w-auto dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label className={`ml-1 mb-1 block text-xs text-slate-500 dark:text-slate-400 ${textClass}`}>
              {t('filter.to')}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-500/10 md:w-auto dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          onClick={onClear}
          className={`mt-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-cyan-300 ${textClass}`}
        >
          <X className="h-3.5 w-3.5" /> {t('filter.clear')}
        </button>
      </div>

      <div className={`mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${textClass}`}>
        {t('filter.showing', { filtered: filteredCount, total: totalCount })}
      </div>
    </div>
  );
};

export default FilterBar;