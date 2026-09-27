import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TableDensity } from '../../types';
import {
  Scale,
  Search,
  RotateCcw,
} from 'lucide-react';
import { exportToExcel, exportToPdf, validateAndTriggerPrint } from '../../utils/exportUtils';
import { sortData } from '../../utils/sortUtils';
import { TablePagination } from '../common/TablePagination';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { ReportButtonGroup } from '../common/ReportButtonGroup';
import { DateRangePicker } from '../common/DateRangePicker';
import { SortIcon } from '../common/SortIcon';
import { ColumnHeaderFilter } from '../common/ColumnHeaderFilter';
import { matchesUniversalSearch } from '../../utils/searchUtils';

export const AllItemClosingStockView: React.FC = () => {
  const {
    stockTransactions,
    deliveryTransactions,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    potatoTypes,
    companySettings,
    addToast,
  } = useApp();

  const [density, setDensity] = useState<TableDensity>('comfortable');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in_stock' | 'partial' | 'dispatched'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting & Pagination
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStorage('');
    setSelectedVariety('');
    setSelectedClass('');
    setSelectedGrade('');
    setSelectedType('');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast?.('All Stock Register filters reset successfully', 'info');
  };

  const activeFilterCount = [
    Boolean(searchQuery),
    Boolean(selectedStorage),
    Boolean(selectedVariety),
    Boolean(selectedClass),
    Boolean(selectedGrade),
    Boolean(selectedType),
    selectedStatus !== 'all',
    Boolean(startDate || endDate),
  ].filter(Boolean).length;

  // Process rows joining stock transactions with matching deliveries
  const processedRegisterRows = useMemo(() => {
    // Map deliveries by SR number and challan for instant accurate matching
    const deliveriesBySr: Record<string, { bags: number; kg: number }> = {};
    for (const d of deliveryTransactions) {
      const srKey = (d.srNo || d.deliveryReference || '').trim().toUpperCase();
      if (srKey) {
        if (!deliveriesBySr[srKey]) deliveriesBySr[srKey] = { bags: 0, kg: 0 };
        deliveriesBySr[srKey].bags += d.sackQuantity;
        deliveriesBySr[srKey].kg += d.totalKg || d.sackQuantity * (d.kgPerBag || 50);
      }
    }

    return stockTransactions.map((s) => {
      const srKey = (s.srNo || '').trim().toUpperCase();
      const matchedDel = deliveriesBySr[srKey] || { bags: 0, kg: 0 };

      const bagIn = s.sackQuantity;
      const weightPerBag = s.kgPerBag || 50;
      const totalKgIn = s.totalKg || bagIn * weightPerBag;

      const bagOut = matchedDel.bags;
      const totalKgOut = matchedDel.kg;

      const closingBagQty = Math.max(0, bagIn - bagOut);
      const closingKg = closingBagQty * weightPerBag;
      const closingMt = Number((closingKg / 1000).toFixed(3));

      let status = 'IN STOCK';
      if (closingBagQty === 0) {
        status = 'DISPATCHED';
      } else if (bagOut > 0) {
        status = 'PARTIAL OUT';
      }

      const csName = coldStorages.find((c) => c.id === s.coldStorageId)?.name || '-';
      const vName = varieties.find((v) => v.id === s.varietyId)?.name || '-';
      const cName = seedClasses.find((c) => c.id === s.classId)?.name || '-';
      const gName = grades.find((g) => g.id === s.gradeId)?.name || '-';
      const tName = potatoTypes.find((t) => t.id === s.potatoTypeId)?.name || 'Seed Potato';

      return {
        id: s.id,
        date: s.date,
        kblChallanNo: s.kblChallanNo || '-',
        srNo: s.srNo || '-',
        storageName: csName,
        bagIn,
        totalKgIn,
        bagOut,
        totalKgOut,
        closingBagQty,
        weightPerBag,
        closingKg,
        closingMt,
        varietyName: vName,
        className: cName,
        gradeName: gName,
        typeName: tName,
        status,
        coldStorageId: s.coldStorageId,
        varietyId: s.varietyId,
        classId: s.classId,
        gradeId: s.gradeId,
        potatoTypeId: s.potatoTypeId,
      };
    });
  }, [stockTransactions, deliveryTransactions, coldStorages, varieties, seedClasses, grades, potatoTypes]);

  // Filter list
  const filteredList = useMemo(() => {
    return processedRegisterRows.filter((r) => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      if (selectedStorage && r.coldStorageId !== selectedStorage) return false;
      if (selectedVariety && r.varietyId !== selectedVariety) return false;
      if (selectedClass && r.classId !== selectedClass) return false;
      if (selectedGrade && r.gradeId !== selectedGrade) return false;
      if (selectedType && r.potatoTypeId !== selectedType) return false;

      if (selectedStatus === 'in_stock' && r.status !== 'IN STOCK') return false;
      if (selectedStatus === 'partial' && r.status !== 'PARTIAL OUT') return false;
      if (selectedStatus === 'dispatched' && r.status !== 'DISPATCHED') return false;

      if (
        !matchesUniversalSearch(r, searchQuery, [
          r.storageName,
          r.varietyName,
          r.className,
          r.gradeName,
          r.typeName,
          r.status,
          r.kblChallanNo,
          r.srNo,
        ])
      ) {
        return false;
      }

      return true;
    });
  }, [
    processedRegisterRows,
    startDate,
    endDate,
    selectedStorage,
    selectedVariety,
    selectedClass,
    selectedGrade,
    selectedType,
    selectedStatus,
    searchQuery,
  ]);

  // Sort and calculate progressive running totals for CUMULATIVE IN and CUMULATIVE OUT
  const sortedAndCumulativeList = useMemo(() => {
    const sorted = sortData(filteredList, sortKey, sortDir);

    let runningInKg = 0;
    let runningOutKg = 0;

    return sorted.map((row, index) => {
      runningInKg += row.totalKgIn;
      runningOutKg += row.totalKgOut;

      return {
        ...row,
        sl: index + 1,
        cumulativeTotalInKg: runningInKg,
        cumulativeTotalOutKg: runningOutKg,
      };
    });
  }, [filteredList, sortKey, sortDir]);

  // Totals
  const totals = useMemo(() => {
    const totalBagIn = sortedAndCumulativeList.reduce((acc, r) => acc + r.bagIn, 0);
    const totalKgIn = sortedAndCumulativeList.reduce((acc, r) => acc + r.totalKgIn, 0);
    const totalBagOut = sortedAndCumulativeList.reduce((acc, r) => acc + r.bagOut, 0);
    const totalKgOut = sortedAndCumulativeList.reduce((acc, r) => acc + r.totalKgOut, 0);
    const totalClosingBags = sortedAndCumulativeList.reduce((acc, r) => acc + r.closingBagQty, 0);
    const totalClosingKg = sortedAndCumulativeList.reduce((acc, r) => acc + r.closingKg, 0);
    const totalClosingMt = Number((totalClosingKg / 1000).toFixed(3));

    return {
      totalBagIn,
      totalKgIn,
      totalBagOut,
      totalKgOut,
      totalClosingBags,
      totalClosingKg,
      totalClosingMt,
    };
  }, [sortedAndCumulativeList]);

  // Paginated records
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAndCumulativeList.slice(start, start + pageSize);
  }, [sortedAndCumulativeList, currentPage, pageSize]);

  // Density paddings
  const cellPadding =
    density === 'compact'
      ? 'px-2 py-1.5 text-xs'
      : density === 'comfortable'
      ? 'px-2.5 py-2 text-xs sm:text-sm'
      : 'px-2 py-1.5 text-xs';

  const thPadding =
    density === 'compact'
      ? 'px-2 py-2 text-[10px]'
      : density === 'comfortable'
      ? 'px-2.5 py-2.5 text-[11px]'
      : 'px-2 py-2 text-[10px]';

  // Excel Export according to Table 3 sequence
  const handleExportExcel = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: row.sl,
      date: row.date,
      kblChallanNo: row.kblChallanNo,
      srNo: row.srNo,
      storageName: row.storageName,
      bagIn: row.bagIn,
      totalKgIn: row.totalKgIn,
      cumulativeTotalInKg: row.cumulativeTotalInKg,
      bagOut: row.bagOut,
      totalKgOut: row.totalKgOut,
      cumulativeTotalOutKg: row.cumulativeTotalOutKg,
      closingBagQty: row.closingBagQty,
      weightPerBag: row.weightPerBag,
      closingKg: row.closingKg,
      closingMt: row.closingMt,
      varietyName: row.varietyName,
      className: row.className,
      gradeName: row.gradeName,
      typeName: row.typeName,
      status: row.status,
    }));

    const columns = [
      { header: '#', key: 'sl', width: 6 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'KBL CHALLAN NO', key: 'kblChallanNo', width: 18 },
      { header: 'Cold Store SR No', key: 'srNo', width: 18 },
      { header: 'Storage Name', key: 'storageName', width: 26 },
      { header: 'NO OF BAG IN', key: 'bagIn', width: 16 },
      { header: 'TOTAL KG IN', key: 'totalKgIn', width: 16 },
      { header: 'CUMULATIVE TOTAL IN (KG)', key: 'cumulativeTotalInKg', width: 26 },
      { header: 'NO OF BAG OUT', key: 'bagOut', width: 16 },
      { header: 'TOTAL KG OUT', key: 'totalKgOut', width: 16 },
      { header: 'CUMULATIVE TOTAL OUT(KG)', key: 'cumulativeTotalOutKg', width: 26 },
      { header: 'CLOSING STOCK BAG QTY', key: 'closingBagQty', width: 24 },
      { header: 'WEIGHT PER BAG (KG)', key: 'weightPerBag', width: 20 },
      { header: 'CLOSING STOCK (KG)', key: 'closingKg', width: 20 },
      { header: 'CLOSING STOCK (MT)', key: 'closingMt', width: 18 },
      { header: 'VERITY', key: 'varietyName', width: 18 },
      { header: 'CLASS', key: 'className', width: 16 },
      { header: 'GRADE', key: 'gradeName', width: 16 },
      { header: 'POTATO TYPE', key: 'typeName', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    exportToExcel(
      exportData,
      columns,
      `STOCK_REGISTER_${companySettings?.fiscalYear || '2024'}`,
      'STOCK REGISTER REPORT',
      companySettings,
      `Audited balances as of ${new Date().toLocaleDateString('en-GB')}`
    );
    addToast?.('Stock Register exported to Excel successfully!', 'success');
  };

  // PDF Export according to Table 3 sequence
  const handleExportPdf = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: String(row.sl),
      date: row.date,
      kblChallanNo: row.kblChallanNo,
      srNo: row.srNo,
      storageName: row.storageName,
      bagIn: row.bagIn.toLocaleString(),
      totalKgIn: row.totalKgIn.toLocaleString(),
      cumulativeTotalInKg: row.cumulativeTotalInKg.toLocaleString(),
      bagOut: row.bagOut.toLocaleString(),
      totalKgOut: row.totalKgOut.toLocaleString(),
      cumulativeTotalOutKg: row.cumulativeTotalOutKg.toLocaleString(),
      closingBagQty: row.closingBagQty.toLocaleString(),
      weightPerBag: String(row.weightPerBag),
      closingKg: row.closingKg.toLocaleString(),
      closingMt: row.closingMt.toFixed(3),
      varietyName: row.varietyName,
      className: row.className,
      gradeName: row.gradeName,
      typeName: row.typeName,
      status: row.status,
    }));

    const columns = [
      { header: '#', key: 'sl' },
      { header: 'Date', key: 'date' },
      { header: 'KBL CHALLAN NO', key: 'kblChallanNo' },
      { header: 'Cold Store SR No', key: 'srNo' },
      { header: 'Storage Name', key: 'storageName' },
      { header: 'NO OF BAG IN', key: 'bagIn' },
      { header: 'TOTAL KG IN', key: 'totalKgIn' },
      { header: 'CUMULATIVE TOTAL IN (KG)', key: 'cumulativeTotalInKg' },
      { header: 'NO OF BAG OUT', key: 'bagOut' },
      { header: 'TOTAL KG OUT', key: 'totalKgOut' },
      { header: 'CUMULATIVE TOTAL OUT(KG)', key: 'cumulativeTotalOutKg' },
      { header: 'CLOSING STOCK BAG QTY', key: 'closingBagQty' },
      { header: 'WEIGHT PER BAG (KG)', key: 'weightPerBag' },
      { header: 'CLOSING STOCK (KG)', key: 'closingKg' },
      { header: 'CLOSING STOCK (MT)', key: 'closingMt' },
      { header: 'VERITY', key: 'varietyName' },
      { header: 'CLASS', key: 'className' },
      { header: 'GRADE', key: 'gradeName' },
      { header: 'POTATO TYPE', key: 'typeName' },
      { header: 'Status', key: 'status' },
    ];

    exportToPdf(
      exportData,
      columns,
      `STOCK_REGISTER_${companySettings?.fiscalYear || '2024'}`,
      'STOCK REGISTER REPORT',
      companySettings,
      `FY: ${companySettings?.fiscalYear || '2024-2025'}`
    );
    addToast?.('Stock Register exported as PDF!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card strictly following Dashboard layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              STOCK REGISTER
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audited double-entry lot ledger, inward/outward reconciliation & closing stock balance
            </p>
          </div>
        </div>

        {/* Action Controls: Density & Exports */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
                density === 'compact'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              COMPACT
            </button>
            <button
              type="button"
              onClick={() => setDensity('normal')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
                density === 'normal'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              NORMAL
            </button>
            <button
              type="button"
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
                density === 'comfortable'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              COMFORTABLE
            </button>
          </div>

          <ReportButtonGroup
            onPrint={() => setIsPreviewOpen(true)}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 uppercase"
            title="Clear all filters across the entire table"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CLEAR ALL FILTERS{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div>
            <select
              value={selectedStorage}
              onChange={(e) => {
                setSelectedStorage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Storages</option>
              {coldStorages.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedVariety}
              onChange={(e) => {
                setSelectedVariety(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Varieties</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Classes</option>
              {seedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Types</option>
              {potatoTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="partial">Partial Out</option>
              <option value="dispatched">Dispatched</option>
            </select>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setCurrentPage(1);
            }}
          />
          <div className="text-[11px] text-slate-500 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{sortedAndCumulativeList.length}</strong> audited register rows
          </div>
        </div>
      </div>

      {/* Main Table strictly following Table 3 Sequence in image.png */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-850 text-white font-bold border-b border-slate-700 select-none text-[11px]">
              <tr>
                <th className={`${thPadding} text-center font-bold uppercase tracking-wider text-slate-200 w-10`}>
                  #
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      Date
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="date" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="DATE"
                      type="date-range"
                      startDate={startDate}
                      endDate={endDate}
                      onDateRangeChange={(s, e) => {
                        setStartDate(s);
                        setEndDate(e);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(startDate || endDate)}
                      onClearFilter={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('kblChallanNo')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center gap-0.5">
                    KBL CHALLAN NO
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="kblChallanNo" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('srNo')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center gap-0.5">
                    COLD STORE SR NO
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="srNo" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('storageName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      COLD STORAGE NAME
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="storageName" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="COLD STORAGE"
                      type="select"
                      options={coldStorages.map((cs) => ({ label: cs.name, value: cs.id }))}
                      value={selectedStorage}
                      onChangeValue={(val) => {
                        setSelectedStorage(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedStorage)}
                      onClearFilter={() => setSelectedStorage('')}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bagIn')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    NO OF BAG IN
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="bagIn" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalKgIn')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    TOTAL KG IN
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalKgIn" />
                  </span>
                </th>
                <th className={`${thPadding} text-right font-bold uppercase tracking-wider text-sky-300 whitespace-nowrap`}>
                  CUMULATIVE TOTAL IN (KG)
                </th>
                <th
                  onClick={() => handleSort('bagOut')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    NO OF BAG OUT
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="bagOut" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalKgOut')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    TOTAL KG OUT
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalKgOut" />
                  </span>
                </th>
                <th className={`${thPadding} text-right font-bold uppercase tracking-wider text-amber-300 whitespace-nowrap`}>
                  CUMULATIVE TOTAL OUT(KG)
                </th>
                <th
                  onClick={() => handleSort('closingBagQty')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-emerald-300 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    CLOSING STOCK BAG QTY
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="closingBagQty" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('weightPerBag')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    WEIGHT PER BAG (KG)
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="weightPerBag" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('closingKg')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-emerald-300 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    CLOSING STOCK (KG)
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="closingKg" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('closingMt')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-emerald-300 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-0.5">
                    CLOSING STOCK (MT)
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="closingMt" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('varietyName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      VARIETY
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="varietyName" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="VARIETY"
                      type="select"
                      options={varieties.map((v) => ({ label: v.name, value: v.id }))}
                      value={selectedVariety}
                      onChangeValue={(val) => {
                        setSelectedVariety(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedVariety)}
                      onClearFilter={() => setSelectedVariety('')}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('className')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      CLASS
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="className" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="CLASS"
                      type="select"
                      options={seedClasses.map((c) => ({ label: c.name, value: c.id }))}
                      value={selectedClass}
                      onChangeValue={(val) => {
                        setSelectedClass(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedClass)}
                      onClearFilter={() => setSelectedClass('')}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gradeName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      GRADE
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="gradeName" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="GRADE"
                      type="select"
                      options={grades.map((g) => ({ label: g.name, value: g.id }))}
                      value={selectedGrade}
                      onChangeValue={(val) => {
                        setSelectedGrade(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedGrade)}
                      onClearFilter={() => setSelectedGrade('')}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('typeName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5">
                      POTATO TYPE
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="typeName" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="POTATO TYPE"
                      type="select"
                      options={potatoTypes.map((t) => ({ label: t.name, value: t.id }))}
                      value={selectedType}
                      onChangeValue={(val) => {
                        setSelectedType(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedType)}
                      onClearFilter={() => setSelectedType('')}
                      onClearAllFilters={resetFilters}
                      align="right"
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className={`${thPadding} text-center font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="flex items-center justify-center gap-0.5">
                      STATUS
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="status" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="STATUS"
                      type="select"
                      options={[
                        { label: 'All Statuses', value: 'all' },
                        { label: 'In Stock', value: 'in_stock' },
                        { label: 'Partial Out', value: 'partial' },
                        { label: 'Dispatched', value: 'dispatched' },
                      ]}
                      value={selectedStatus === 'all' ? '' : selectedStatus}
                      onChangeValue={(val) => {
                        setSelectedStatus((val as any) || 'all');
                        setCurrentPage(1);
                      }}
                      isFiltered={selectedStatus !== 'all'}
                      onClearFilter={() => setSelectedStatus('all')}
                      onClearAllFilters={resetFilters}
                      align="right"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching records found in Stock Register.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className={`${cellPadding} text-center font-mono text-slate-400 font-bold`}>
                      {row.sl}
                    </td>
                    <td className={`${cellPadding} font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.date}
                    </td>
                    <td className={`${cellPadding} font-mono font-bold text-sky-700 dark:text-sky-400 whitespace-nowrap`}>
                      {row.kblChallanNo}
                    </td>
                    <td className={`${cellPadding} font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap`}>
                      {row.srNo}
                    </td>
                    <td className={`${cellPadding} font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap`}>
                      {row.storageName}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 dark:text-white`}>
                      {row.bagIn.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-slate-900 dark:text-white`}>
                      {row.totalKgIn.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50/30 dark:bg-sky-950/20`}>
                      {row.cumulativeTotalInKg.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-amber-700 dark:text-amber-400`}>
                      {row.bagOut > 0 ? row.bagOut.toLocaleString() : '-'}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-amber-700 dark:text-amber-400`}>
                      {row.totalKgOut > 0 ? row.totalKgOut.toLocaleString() : '-'}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20`}>
                      {row.cumulativeTotalOutKg.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20`}>
                      {row.closingBagQty.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-slate-600 dark:text-slate-400`}>
                      {row.weightPerBag}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-emerald-700 dark:text-emerald-300`}>
                      {row.closingKg.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-black text-emerald-600 dark:text-emerald-400`}>
                      {row.closingMt.toFixed(3)}
                    </td>
                    <td className={`${cellPadding} text-slate-800 dark:text-slate-200 whitespace-nowrap`}>
                      {row.varietyName}
                    </td>
                    <td className={`${cellPadding} text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.className}
                    </td>
                    <td className={`${cellPadding} text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.gradeName}
                    </td>
                    <td className={`${cellPadding} text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.typeName}
                    </td>
                    <td className={`${cellPadding} text-center whitespace-nowrap`}>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          row.status === 'IN STOCK'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : row.status === 'PARTIAL OUT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Summary Row */}
            {sortedAndCumulativeList.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-850 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs">
                <tr>
                  <td colSpan={5} className={`${cellPadding} text-right uppercase tracking-wider font-bold`}>
                    TOTALS ({sortedAndCumulativeList.length} LOTS):
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-sky-700 dark:text-sky-400`}>
                    {totals.totalBagIn.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 dark:text-white`}>
                    {totals.totalKgIn.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400`}>
                    {totals.totalBagOut.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-amber-700 dark:text-amber-400`}>
                    {totals.totalKgOut.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40`}>
                    {totals.totalClosingBags.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-mono font-black text-emerald-700 dark:text-emerald-300`}>
                    {totals.totalClosingKg.toLocaleString()} KG
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-emerald-600 dark:text-emerald-400`}>
                    {totals.totalClosingMt.toFixed(3)} MT
                  </td>
                  <td colSpan={5} className={`${cellPadding} text-slate-400`}>-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedAndCumulativeList.length > pageSize && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <TablePagination
              currentPage={currentPage}
              totalPages={Math.ceil(sortedAndCumulativeList.length / pageSize)}
              pageSize={pageSize}
              totalRecords={sortedAndCumulativeList.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="STOCK REGISTER"
        onConfirmPrint={() => validateAndTriggerPrint()}
      >
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-black uppercase text-slate-900">
              {companySettings?.companyName || 'KISAN BOTANIX LTD.'}
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              STOCK REGISTER REPORT • FISCAL YEAR {companySettings?.fiscalYear || '2024-2025'}
            </p>
          </div>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-200 font-bold">
              <tr>
                <th className="p-1 border border-slate-300">#</th>
                <th className="p-1 border border-slate-300">Date</th>
                <th className="p-1 border border-slate-300">KBL CHALLAN NO</th>
                <th className="p-1 border border-slate-300">Cold Store SR No</th>
                <th className="p-1 border border-slate-300">Storage Name</th>
                <th className="p-1 border border-slate-300 text-right">NO OF BAG IN</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL KG IN</th>
                <th className="p-1 border border-slate-300 text-right">CUMULATIVE TOTAL IN (KG)</th>
                <th className="p-1 border border-slate-300 text-right">NO OF BAG OUT</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL KG OUT</th>
                <th className="p-1 border border-slate-300 text-right">CUMULATIVE TOTAL OUT(KG)</th>
                <th className="p-1 border border-slate-300 text-right">CLOSING STOCK BAG QTY</th>
                <th className="p-1 border border-slate-300 text-right">WEIGHT PER BAG (KG)</th>
                <th className="p-1 border border-slate-300 text-right">CLOSING STOCK (KG)</th>
                <th className="p-1 border border-slate-300 text-right">CLOSING STOCK (MT)</th>
                <th className="p-1 border border-slate-300">VERITY</th>
                <th className="p-1 border border-slate-300">CLASS</th>
                <th className="p-1 border border-slate-300">GRADE</th>
                <th className="p-1 border border-slate-300">POTATO TYPE</th>
                <th className="p-1 border border-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndCumulativeList.map((row) => (
                <tr key={row.id}>
                  <td className="p-1 border border-slate-300 text-center font-mono">{row.sl}</td>
                  <td className="p-1 border border-slate-300 font-mono">{row.date}</td>
                  <td className="p-1 border border-slate-300 font-mono font-bold">{row.kblChallanNo}</td>
                  <td className="p-1 border border-slate-300 font-mono font-bold">{row.srNo}</td>
                  <td className="p-1 border border-slate-300">{row.storageName}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.bagIn.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.totalKgIn.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.cumulativeTotalInKg.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.bagOut.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.totalKgOut.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.cumulativeTotalOutKg.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.closingBagQty.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.weightPerBag}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.closingKg.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.closingMt.toFixed(3)}</td>
                  <td className="p-1 border border-slate-300">{row.varietyName}</td>
                  <td className="p-1 border border-slate-300">{row.className}</td>
                  <td className="p-1 border border-slate-300">{row.gradeName}</td>
                  <td className="p-1 border border-slate-300">{row.typeName}</td>
                  <td className="p-1 border border-slate-300 text-center">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
