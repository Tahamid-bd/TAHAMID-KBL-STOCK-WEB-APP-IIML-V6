import React, { useState } from 'react';
import { FileText, Files, Warehouse, Search, Printer, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/exportUtils';

interface ReportsViewProps {
  reportType?: 'reports-challan' | 'reports-sr' | 'reports-storage' | string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reportType = 'reports-challan' }) => {
  const { stockTransactions, deliveryTransactions, coldStorages, varieties, companySettings, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const isChallan = reportType === 'reports-challan';
  const isSr = reportType === 'reports-sr';
  const isStorage = reportType === 'reports-storage';

  const title = isChallan
    ? 'KBL Challan Cross-Reference & Reconciliation Report'
    : isSr
    ? 'SR-Wise Lot Register & Traceability Status'
    : 'Cold Storage Occupancy & Chamber Balance Report';

  const subtitle = isChallan
    ? 'Cross-matching consignor challans, gate audit records and warehouse receipts'
    : isSr
    ? 'Detailed serial receipt lot registry, grower batches and seed grading breakdown'
    : 'Chamber utilization metrics, current balances and stored seed varieties';

  // Build report dataset
  const reportData = stockTransactions.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.kblChallanNo.toLowerCase().includes(q) ||
      s.srNo.toLowerCase().includes(q) ||
      s.truckNo?.toLowerCase().includes(q) ||
      s.growerFarmerName?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const cols = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'KBL Challan', key: 'kblChallanNo', width: 18 },
      { header: 'SR Lot No', key: 'srNo', width: 16 },
      { header: 'Sacks Received', key: 'sackQuantity', width: 14 },
      { header: 'Total MT', key: 'totalMt', width: 14 },
      { header: 'Grower / Farmer', key: 'growerFarmerName', width: 22 },
      { header: 'Vehicle No', key: 'truckNo', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    exportToExcel(reportData, cols, `${reportType}_report`, title, companySettings);
    addToast?.(`Exported ${title} to Excel`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              {isChallan ? <Files className="w-5 h-5" /> : isSr ? <FileText className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-48 sm:w-60 font-medium"
          />
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PRINT</span>
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">KBL Challan</th>
                <th className="py-2.5 px-4">SR Lot No</th>
                <th className="py-2.5 px-4">Cold Storage</th>
                <th className="py-2.5 px-4">Variety</th>
                <th className="py-2.5 px-4 text-right">Bags</th>
                <th className="py-2.5 px-4 text-right">Total MT</th>
                <th className="py-2.5 px-4">Grower / Party</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching records found for this report.
                  </td>
                </tr>
              ) : (
                reportData.map((s) => {
                  const storage = coldStorages.find((c) => c.id === s.coldStorageId);
                  const variety = varieties.find((v) => v.id === s.varietyId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-4 font-mono">{s.date}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {s.kblChallanNo}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {s.srNo}
                      </td>
                      <td className="py-2.5 px-4">{storage?.name || s.coldStorageId}</td>
                      <td className="py-2.5 px-4">{variety?.name || s.varietyId}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {s.sackQuantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {s.totalMt} MT
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {s.growerFarmerName || 'Apex Agro Farm'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
