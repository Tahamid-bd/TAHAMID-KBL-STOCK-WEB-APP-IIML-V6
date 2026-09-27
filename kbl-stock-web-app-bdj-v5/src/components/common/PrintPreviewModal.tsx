import React from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  documentTitle?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onConfirmPrint?: () => void;
  columns?: any[];
  data?: any[];
  summaryItems?: { label: string; value: any }[];
  filename?: string;
  orientation?: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  documentTitle,
  subtitle,
  children,
  onConfirmPrint,
  columns,
  data,
  summaryItems,
}) => {
  const { companySettings } = useApp();

  if (!isOpen) return null;

  const displayTitle = documentTitle || title || 'Document Print Preview';

  const handlePrint = () => {
    if (onConfirmPrint) {
      onConfirmPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {displayTitle}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT NOW</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto bg-white text-slate-900 shadow-xl border border-slate-200 rounded-xl p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0">
            {/* Document Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    {companySettings?.companyName || 'KISHAN BOTANIX LTD.'}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    {companySettings?.companyTagline || 'Enterprise Certified Potato Seed & Cold Storage Management'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {companySettings?.address || 'Dhaka, Bangladesh'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] uppercase font-bold tracking-widest">
                    OFFICIAL REPORT
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono mt-1.5">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Subtitle / Title banner */}
            <div className="mb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-sky-700">
                {displayTitle}
              </h2>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>

            {/* Summary Items if provided */}
            {summaryItems && summaryItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                {summaryItems.map((s, idx) => (
                  <div key={idx}>
                    <p className="text-[10px] text-slate-500 uppercase">{s.label}</p>
                    <p className="font-bold text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Document Content / Table */}
            <div className="printable-document-body overflow-x-auto">
              {columns && data ? (
                <table className="w-full text-left border-collapse text-xs border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase text-[10px]">
                      {columns.map((col, ci) => (
                        <th key={ci} className="py-2 px-3 border-r border-slate-200">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.slice(0, 100).map((row, ri) => (
                      <tr key={ri} className="hover:bg-slate-50">
                        {columns.map((col, ci) => (
                          <td key={ci} className="py-1.5 px-3 border-r border-slate-200 text-[11px]">
                            {row[col.key] !== undefined ? String(row[col.key]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                children || (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    Document ready for printing.
                  </div>
                )
              )}
            </div>

            {/* Signature Area */}
            <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-700">
              <div>
                <div className="border-b border-slate-400 mb-2 h-10" />
                <span>Prepared By</span>
              </div>
              <div>
                <div className="border-b border-slate-400 mb-2 h-10" />
                <span>Store In-Charge</span>
              </div>
              <div>
                <div className="border-b border-slate-400 mb-2 h-10" />
                <span>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
