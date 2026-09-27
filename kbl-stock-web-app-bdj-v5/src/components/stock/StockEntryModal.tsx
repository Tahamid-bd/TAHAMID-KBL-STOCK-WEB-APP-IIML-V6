import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockTransaction } from '../../types';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecord?: StockTransaction | null;
}

export const StockEntryModal: React.FC<StockEntryModalProps> = ({
  isOpen,
  onClose,
  editRecord,
}) => {
  const {
    coldStorages,
    varieties,
    seedClasses,
    grades,
    productionBlocks,
    potatoTypes,
    addStockTransaction,
    updateStockTransaction,
    addToast,
    currentUser,
  } = useApp();

  const getToday = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(getToday());
  const [coldStorageId, setColdStorageId] = useState<string>('');
  const [kblChallanNo, setKblChallanNo] = useState<string>('');
  const [srNo, setSrNo] = useState<string>('');
  const [varietyId, setVarietyId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>('');
  const [productionBlockId, setProductionBlockId] = useState<string>('');
  const [potatoTypeId, setPotatoTypeId] = useState<string>('');
  const [kblBags, setKblBags] = useState<string>('');
  const [srCopyBags, setSrCopyBags] = useState<string>('');
  const [kgPerBag, setKgPerBag] = useState<number>(50);
  const [remarks, setRemarks] = useState<string>('');

  // Synchronize state when editRecord changes or modal opens
  useEffect(() => {
    if (editRecord) {
      setDate(editRecord.date || getToday());
      setColdStorageId(editRecord.coldStorageId || '');
      setKblChallanNo(editRecord.kblChallanNo || '');
      setSrNo(editRecord.srNo || '');
      setVarietyId(editRecord.varietyId || '');
      setClassId(editRecord.classId || '');
      setGradeId(editRecord.gradeId || '');
      setProductionBlockId(editRecord.productionBlockId || '');
      setPotatoTypeId(editRecord.potatoTypeId || '');
      setKblBags(editRecord.sackQuantity ? String(editRecord.sackQuantity) : '');
      setSrCopyBags(
        (editRecord as any).srCopyBags
          ? String((editRecord as any).srCopyBags)
          : editRecord.sackQuantity
          ? String(editRecord.sackQuantity)
          : ''
      );
      setKgPerBag(editRecord.kgPerBag || 50);
      setRemarks(editRecord.remarks || '');
    } else {
      // By default no value set except date
      setDate(getToday());
      setColdStorageId('');
      setKblChallanNo('');
      setSrNo('');
      setVarietyId('');
      setClassId('');
      setGradeId('');
      setProductionBlockId('');
      setPotatoTypeId('');
      setKblBags('');
      setSrCopyBags('');
      setKgPerBag(50);
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

  const parsedKblBags = Number(kblBags) || 0;
  const parsedSrBags = srCopyBags ? Number(srCopyBags) : parsedKblBags;
  const totalKg = parsedKblBags * (Number(kgPerBag) || 50);
  const totalMt = Number((totalKg / 1000).toFixed(3));

  const resetForm = () => {
    setDate(getToday());
    setColdStorageId('');
    setKblChallanNo('');
    setSrNo('');
    setVarietyId('');
    setClassId('');
    setGradeId('');
    setProductionBlockId('');
    setPotatoTypeId('');
    setKblBags('');
    setSrCopyBags('');
    setKgPerBag(50);
    setRemarks('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      addToast?.('Date is required', 'warning');
      return;
    }
    if (!kblChallanNo.trim()) {
      addToast?.('KBL Challan No is required', 'warning');
      return;
    }
    if (!srNo.trim()) {
      addToast?.('SR No is required', 'warning');
      return;
    }
    if (!coldStorageId) {
      addToast?.('Please select a Cold Storage facility', 'warning');
      return;
    }
    if (parsedKblBags <= 0) {
      addToast?.('Please enter a valid bag quantity greater than 0', 'warning');
      return;
    }

    const payload = {
      date,
      kblChallanNo: kblChallanNo.trim().toUpperCase(),
      srNo: srNo.trim().toUpperCase(),
      coldStorageId,
      varietyId: varietyId || varieties[0]?.id || 'v-asterix',
      classId: classId || seedClasses[0]?.id || 'sc-foundation',
      gradeId: gradeId || grades[0]?.id || 'gr-a',
      productionBlockId: productionBlockId || productionBlocks[0]?.id || 'pb-1',
      potatoTypeId: potatoTypeId || potatoTypes[0]?.id || 'pt-seed',
      sackQuantity: parsedKblBags,
      srCopyBags: parsedSrBags,
      kgPerBag: Number(kgPerBag) || 50,
      totalKg,
      totalMt,
      remarks: remarks.trim(),
      status: 'approved' as const,
    };

    if (editRecord) {
      updateStockTransaction(editRecord.id, payload as any);
      addToast?.(`Stock Entry ${payload.kblChallanNo} updated successfully!`, 'success');
    } else {
      addStockTransaction(payload as any);
      addToast?.(`New Stock Entry ${payload.kblChallanNo} recorded successfully!`, 'success');
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
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editRecord ? 'EDIT STOCK IN ENTRY' : 'NEW STOCK IN ENTRY'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {editRecord
                  ? `Updating transaction ${editRecord.kblChallanNo}`
                  : 'Inbound potato seed sacks received at cold storage'}
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

          {/* Row 2: KBL Challan No & SR No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                KBL CHALLAN NO <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={kblChallanNo}
                onChange={(e) => setKblChallanNo(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                SR NO. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={srNo}
                onChange={(e) => setSrNo(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold uppercase tracking-wider"
              />
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

          {/* Row 4: Production Block & Potato Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                PRODUCTION BLOCK NAME
              </label>
              <select
                value={productionBlockId}
                onChange={(e) => setProductionBlockId(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select Block</option>
                {productionBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Row 5: Bag Quantities & Kg per Bag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                NO OF BAG IN (KBL CHALLAN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={kblBags}
                onChange={(e) => setKblBags(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                NO OF BAG IN (SR COPY)
              </label>
              <input
                type="number"
                min="0"
                value={srCopyBags}
                onChange={(e) => setSrCopyBags(e.target.value)}
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

          {/* Automatic Calculation Indicator Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80">
            <div>
              <div className="text-[10px] font-bold uppercase text-sky-800 dark:text-sky-300 tracking-wider">
                TOTAL KG IN
              </div>
              <div className="text-base font-black font-mono text-sky-900 dark:text-sky-100 mt-0.5">
                {totalKg.toLocaleString()} KG
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-sky-800 dark:text-sky-300 tracking-wider">
                TOTAL MT IN
              </div>
              <div className="text-base font-black font-mono text-sky-900 dark:text-sky-100 mt-0.5">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editRecord ? 'SAVE CHANGES' : 'RECORD STOCK IN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
