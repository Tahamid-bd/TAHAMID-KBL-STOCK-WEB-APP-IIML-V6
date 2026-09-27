import React, { useState, useEffect } from 'react';
import { X, Truck, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryTransaction } from '../../types';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecord?: DeliveryTransaction | null;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  editRecord,
}) => {
  const {
    coldStorages,
    varieties,
    seedClasses,
    grades,
    potatoTypes,
    stockTransactions,
    addDeliveryTransaction,
    updateDeliveryTransaction,
    addToast,
    currentUser,
  } = useApp();

  const getToday = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(getToday());
  const [coldStorageId, setColdStorageId] = useState<string>('');
  const [srNo, setSrNo] = useState<string>('');
  const [varietyId, setVarietyId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>('');
  const [potatoTypeId, setPotatoTypeId] = useState<string>('');
  const [bagsOut, setBagsOut] = useState<string>('');
  const [kgPerBag, setKgPerBag] = useState<number>(50);
  const [customerReceiver, setCustomerReceiver] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Active SR list filtered by coldStorage if selected
  const availableSrNumbers = React.useMemo(() => {
    let list = stockTransactions;
    if (coldStorageId) {
      list = list.filter((s) => s.coldStorageId === coldStorageId);
    }
    const uniqueSrs = Array.from(new Set(list.map((s) => s.srNo).filter(Boolean)));
    return uniqueSrs;
  }, [stockTransactions, coldStorageId]);

  // Synchronize state when editRecord changes or modal opens
  useEffect(() => {
    if (editRecord) {
      setDate(editRecord.date || getToday());
      setColdStorageId(editRecord.coldStorageId || '');
      setSrNo(editRecord.srNo || editRecord.deliveryReference || '');
      setVarietyId(editRecord.varietyId || '');
      setClassId(editRecord.classId || '');
      setGradeId(editRecord.gradeId || '');
      setPotatoTypeId(editRecord.potatoTypeId || '');
      setBagsOut(editRecord.sackQuantity ? String(editRecord.sackQuantity) : '');
      setKgPerBag(editRecord.kgPerBag || 50);
      setCustomerReceiver(editRecord.customerReceiver || editRecord.clientReceiver || '');
      setRemarks(editRecord.remarks || '');
    } else {
      setDate(getToday());
      setColdStorageId('');
      setSrNo('');
      setVarietyId('');
      setClassId('');
      setGradeId('');
      setPotatoTypeId('');
      setBagsOut('');
      setKgPerBag(50);
      setCustomerReceiver('');
      setRemarks('');
    }
  }, [editRecord, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const parsedBags = Number(bagsOut) || 0;
  const totalKg = parsedBags * (Number(kgPerBag) || 50);
  const totalMt = Number((totalKg / 1000).toFixed(3));

  const resetForm = () => {
    setDate(getToday());
    setColdStorageId('');
    setSrNo('');
    setVarietyId('');
    setClassId('');
    setGradeId('');
    setPotatoTypeId('');
    setBagsOut('');
    setKgPerBag(50);
    setCustomerReceiver('');
    setRemarks('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      addToast?.('Date is required', 'warning');
      return;
    }
    if (!coldStorageId) {
      addToast?.('Please select a Cold Storage facility', 'warning');
      return;
    }
    if (!srNo.trim()) {
      addToast?.('Delivery Against Issued SR No is required', 'warning');
      return;
    }
    if (parsedBags <= 0) {
      addToast?.('Please enter a valid bag quantity greater than 0', 'warning');
      return;
    }

    const payload = {
      date,
      coldStorageId,
      srNo: srNo.trim().toUpperCase(),
      deliveryReference: srNo.trim().toUpperCase(),
      varietyId: varietyId || varieties[0]?.id || 'v-asterix',
      classId: classId || seedClasses[0]?.id || 'sc-foundation',
      gradeId: gradeId || grades[0]?.id || 'gr-a',
      productionBlockId: 'pb-1',
      potatoTypeId: potatoTypeId || potatoTypes[0]?.id || 'pt-seed',
      sackQuantity: parsedBags,
      kgPerBag: Number(kgPerBag) || 50,
      totalKg,
      totalMt,
      customerReceiver: customerReceiver.trim() || 'Internal Dispatch',
      clientReceiver: customerReceiver.trim() || 'Internal Dispatch',
      remarks: remarks.trim(),
      status: 'approved' as const,
    };

    if (editRecord) {
      updateDeliveryTransaction(editRecord.id, payload as any);
      addToast?.(`Delivery record for SR ${payload.srNo} updated successfully!`, 'success');
    } else {
      addDeliveryTransaction(payload as any);
      addToast?.(`New Delivery of ${parsedBags} bags recorded successfully!`, 'success');
    }

    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs no-print cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editRecord ? 'EDIT DELIVERY / DISPATCH ENTRY' : 'NEW DELIVERY / DISPATCH ENTRY'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {editRecord
                  ? `Updating dispatch for SR ${editRecord.srNo || editRecord.deliveryReference}`
                  : 'Record outbound potato seed delivery from cold storage'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Row 1: Date & Cold Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                DATE <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                COLD STORAGE NAME <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={coldStorageId}
                onChange={(e) => setColdStorageId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"
              >
                <option value="">Select Cold Storage</option>
                {coldStorages.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.name} ({cs.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Delivery Against Issued SR No */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              DELIVERY AGAINST ISSUED SR NO <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={srNo}
                onChange={(e) => setSrNo(e.target.value)}
                className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold uppercase tracking-wider"
              />
              {availableSrNumbers.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSrNo(e.target.value);
                      // Auto-fill variety and class from matching stock transaction
                      const match = stockTransactions.find((s) => s.srNo === e.target.value);
                      if (match) {
                        if (match.varietyId) setVarietyId(match.varietyId);
                        if (match.classId) setClassId(match.classId);
                        if (match.gradeId) setGradeId(match.gradeId);
                        if (match.potatoTypeId) setPotatoTypeId(match.potatoTypeId);
                        if (match.coldStorageId) setColdStorageId(match.coldStorageId);
                      }
                    }
                  }}
                  className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                >
                  <option value="">Quick Select SR</option>
                  {availableSrNumbers.map((sr) => (
                    <option key={sr} value={sr}>
                      {sr}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Row 3: Variety, Seed Class & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                VARIETY
              </label>
              <select
                value={varietyId}
                onChange={(e) => setVarietyId(e.target.value)}
                className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select Variety</option>
                {varieties.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                CLASS
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select Class</option>
                {seedClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                GRADE
              </label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Potato Type & Customer Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                POTATO TYPE
              </label>
              <select
                value={potatoTypeId}
                onChange={(e) => setPotatoTypeId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select Potato Type</option>
                {potatoTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                CUSTOMER / RECEIVER
              </label>
              <input
                type="text"
                value={customerReceiver}
                onChange={(e) => setCustomerReceiver(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Row 5: Bags Out & Kg Per Bag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                NO OF BAG OUT <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={bagsOut}
                onChange={(e) => setBagsOut(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                KG PER BAG
              </label>
              <select
                value={kgPerBag}
                onChange={(e) => setKgPerBag(Number(e.target.value) || 50)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold cursor-pointer"
              >
                <option value={50}>50 KG (Standard)</option>
                <option value={40}>40 KG</option>
                <option value={25}>25 KG</option>
                <option value={60}>60 KG</option>
                <option value={30}>30 KG</option>
                <option value={100}>100 KG</option>
              </select>
            </div>
          </div>

          {/* Live Calculation Indicator Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80">
            <div>
              <div className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                TOTAL KG OUT
              </div>
              <div className="text-base font-black font-mono text-amber-900 dark:text-amber-100 mt-0.5">
                {totalKg.toLocaleString()} KG
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                TOTAL MT OUT
              </div>
              <div className="text-base font-black font-mono text-amber-900 dark:text-amber-100 mt-0.5">
                {totalMt.toFixed(3)} MT
              </div>
            </div>
          </div>

          {/* Row 6: Remarks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              REMARKS
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editRecord ? 'SAVE CHANGES' : 'RECORD DELIVERY'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
