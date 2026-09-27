import React, { useState } from 'react';
import { Receipt, Plus, Search, RotateCcw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { matchesUniversalSearch } from '../../utils/searchUtils';

export const RentManagementView: React.FC = () => {
  const { coldStorages, rentPayments, addRentPayment, addToast } = useApp();
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states with default date only, empty others
  const getToday = () => new Date().toISOString().split('T')[0];
  const [paymentStorageId, setPaymentStorageId] = useState(coldStorages[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer' | 'Cheque' | 'Cash' | 'Online'>('Bank Transfer');
  const [remarks, setRemarks] = useState('');

  const resetFilters = () => {
    setSelectedStorage('all');
    setSearchTerm('');
    addToast('Rent ledger filters reset', 'info');
  };

  const filteredPayments = rentPayments.filter((p) => {
    if (selectedStorage !== 'all' && p.coldStorageId !== selectedStorage) return false;
    const storageName = coldStorages.find((c) => c.id === p.coldStorageId)?.name || '';
    return matchesUniversalSearch(p, searchTerm, [storageName, p.paymentRef, p.paymentMode, p.amountPaid, p.remarks]);
  });

  const totalPaid = filteredPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);

  const resetForm = () => {
    setPaymentStorageId(coldStorages[0]?.id || '');
    setPaymentDate(getToday());
    setAmountPaid('');
    setPaymentRef('');
    setPaymentMode('Bank Transfer');
    setRemarks('');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amountPaid);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast('Please enter a valid payment amount', 'warning');
      return;
    }
    if (!paymentRef.trim()) {
      addToast('Please enter a payment reference or voucher number', 'warning');
      return;
    }

    addRentPayment({
      coldStorageId: paymentStorageId || coldStorages[0]?.id,
      date: paymentDate,
      paymentRef: paymentRef.trim().toUpperCase(),
      amountPaid: parsedAmount,
      paymentMode,
      remarks: remarks.trim(),
    });

    addToast(`Recorded rent payment of ৳${parsedAmount.toLocaleString()}`, 'success');
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header strictly following Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              RENT LEDGER
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Storage rent payments, accruals and settlements
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer font-medium"
          >
            <option value="all">ALL STORAGES</option>
            {coldStorages.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>RECORD PAYMENT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 uppercase"
          title="Reset filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Settled Rent</p>
          <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ৳{totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transactions</p>
          <p className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {filteredPayments.length} Records
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Storage Contracts</p>
          <p className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {coldStorages.length} Units
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            PAYMENT TRANSACTION HISTORY
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-850 text-white font-bold border-b border-slate-700 select-none">
              <tr>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-200">DATE</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-200">COLD STORAGE</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-200">PAYMENT REF</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-200">PAYMENT MODE</th>
                <th className="py-2.5 px-4 text-right font-bold uppercase tracking-wider text-slate-200">AMOUNT PAID</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-slate-200">REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No rent payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const storage = coldStorages.find((c) => c.id === p.coldStorageId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-4 font-mono font-medium">{p.date}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {storage?.name || p.coldStorageId}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {p.paymentRef}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ৳{p.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {p.remarks || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <h3 className="text-xs font-bold uppercase text-slate-900 dark:text-white tracking-wider">
                RECORD STORAGE RENT PAYMENT
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  COLD STORAGE FACILITY
                </label>
                <select
                  value={paymentStorageId}
                  onChange={(e) => setPaymentStorageId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                >
                  {coldStorages.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    PAYMENT DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    AMOUNT (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    PAYMENT METHOD
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    VOUCHER / REF NO
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  REMARKS
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors uppercase cursor-pointer"
                >
                  SAVE PAYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
