import React from 'react';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  className?: string;
  label?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
  label,
}) => {
  const setPreset = (preset: 'today' | 'last7' | 'thisMonth' | 'season2024' | 'clear') => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    switch (preset) {
      case 'today': {
        const dStr = formatDate(today);
        onChange(dStr, dStr);
        break;
      }
      case 'last7': {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        onChange(formatDate(d7), formatDate(today));
        break;
      }
      case 'thisMonth': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        onChange(formatDate(startOfMonth), formatDate(today));
        break;
      }
      case 'season2024': {
        onChange('2024-01-01', '2024-12-31');
        break;
      }
      case 'clear': {
        onChange('', '');
        break;
      }
    }
  };

  const hasFilter = Boolean(startDate || endDate);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 ${className}`}>
      {/* Date Inputs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="uppercase text-[11px] tracking-wider">DATE RANGE:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            title="Start Date"
          />
          <span className="text-xs text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            title="End Date"
          />
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={() => setPreset('clear')}
            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Preset Quick Badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
        <span className="text-slate-400 uppercase text-[10px] tracking-wider">Quick:</span>
        <button
          type="button"
          onClick={() => setPreset('today')}
          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setPreset('last7')}
          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          7 Days
        </button>
        <button
          type="button"
          onClick={() => setPreset('thisMonth')}
          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => setPreset('season2024')}
          className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer font-bold"
        >
          Season 2024
        </button>
      </div>
    </div>
  );
};
