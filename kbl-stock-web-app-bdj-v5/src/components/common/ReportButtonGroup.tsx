import React from 'react';
import { Printer, FileSpreadsheet, FileText } from 'lucide-react';

interface ReportButtonGroupProps {
  onPrint?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  disabled?: boolean;
}

export const ReportButtonGroup: React.FC<ReportButtonGroupProps> = ({
  onPrint,
  onExportExcel,
  onExportPdf,
  disabled = false,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title="Print preview and print report"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="uppercase text-[11px] font-bold">PRINT</span>
        </button>
      )}

      {onExportExcel && (
        <button
          type="button"
          onClick={onExportExcel}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title="Export report data to Microsoft Excel"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="uppercase text-[11px] font-bold">EXCEL</span>
        </button>
      )}

      {onExportPdf && (
        <button
          type="button"
          onClick={onExportPdf}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title="Export report document as PDF"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span className="uppercase text-[11px] font-bold">PDF</span>
        </button>
      )}
    </div>
  );
};
