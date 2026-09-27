import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TableDensity } from '../../types';
import {
  Truck,
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

export const StockOutAllRecordsView: React.FC = () => {
  const {
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
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast?.('All delivery report filters reset successfully', 'info');
  };

  const activeFilterCount = [
    Boolean(searchQuery),
    Boolean(selectedStorage),
    Boolean(selectedVariety),
    Boolean(selectedClass),
    Boolean(selectedGrade),
    Boolean(selectedType),
    Boolean(startDate || endDate),
  ].filter(Boolean).length;

  // Filtered dataset
  const filteredList = useMemo(() => {
    return deliveryTransactions.filter((d) => {
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      if (selectedStorage && d.coldStorageId !== selectedStorage) return false;
      if (selectedVariety && d.varietyId !== selectedVariety) return false;
      if (selectedClass && d.classId !== selectedClass) return false;
      if (selectedGrade && d.gradeId !== selectedGrade) return false;
      if (selectedType && d.potatoTypeId !== selectedType) return false;

      const csName = coldStorages.find((c) => c.id === d.coldStorageId)?.name || '';
      const vName = varieties.find((v) => v.id === d.varietyId)?.name || '';
      const cName = seedClasses.find((c) => c.id === d.classId)?.name || '';
      const gName = grades.find((g) => g.id === d.gradeId)?.name || '';
      const tName = potatoTypes.find((t) => t.id === d.potatoTypeId)?.name || '';
      const srRef = d.srNo || d.deliveryReference || '';

      if (
        !matchesUniversalSearch(d, searchQuery, [
          csName,
          vName,
          cName,
          gName,
          tName,
          srRef,
          d.customerReceiver,
        ])
      ) {
        return false;
      }

      return true;
    });
  }, [
    deliveryTransactions,
    startDate,
    endDate,
    selectedStorage,
    selectedVariety,
    selectedClass,
    selectedGrade,
    selectedType,
    searchQuery,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    potatoTypes,
  ]);

  // Sort and calculate running cumulative total OUT in KG
  const sortedAndCumulativeList = useMemo(() => {
    const sorted = sortData(filteredList, sortKey, sortDir);

    let runningCumulativeKg = 0;
    return sorted.map((d, index) => {
      const kgPerBag = d.kgPerBag || 50;
      const totalKgOut = d.totalKg || d.sackQuantity * kgPerBag;
      const totalMtOut = d.totalMt || Number((totalKgOut / 1000).toFixed(3));
      const bagsOut = d.sackQuantity;

      runningCumulativeKg += totalKgOut;

      const csName = coldStorages.find((c) => c.id === d.coldStorageId)?.name || '-';
      const vName = varieties.find((v) => v.id === d.varietyId)?.name || '-';
      const cName = seedClasses.find((c) => c.id === d.classId)?.name || '-';
      const gName = grades.find((g) => g.id === d.gradeId)?.name || '-';
      const tName =
        potatoTypes.find((t) => t.id === d.potatoTypeId)?.name || 'Seed Potato';
      const srNo = d.srNo || d.deliveryReference || '-';

      return {
        ...d,
        sl: index + 1,
        date: d.date,
        storageName: csName,
        srNo,
        varietyName: vName,
        className: cName,
        gradeName: gName,
        bagsOut,
        kgPerBag,
        totalKgOut,
        totalMtOut,
        cumulativeTotalKg: runningCumulativeKg,
        typeName: tName,
      };
    });
  }, [
    filteredList,
    sortKey,
    sortDir,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    potatoTypes,
  ]);

  // Overall totals
  const overallTotals = useMemo(() => {
    const totalBagsOut = sortedAndCumulativeList.reduce((acc, row) => acc + row.bagsOut, 0);
    const totalKg = sortedAndCumulativeList.reduce((acc, row) => acc + row.totalKgOut, 0);
    const totalMt = Number((totalKg / 1000).toFixed(3));
    return {
      totalBagsOut,
      totalKg,
      totalMt,
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
      ? 'px-3 py-2.5 text-xs sm:text-sm'
      : 'px-2.5 py-2 text-xs';

  const thPadding =
    density === 'compact'
      ? 'px-2 py-2 text-[11px]'
      : density === 'comfortable'
      ? 'px-3 py-3 text-xs'
      : 'px-2.5 py-2.5 text-[11px]';

  // Excel Export according to Table 2 sequence
  const handleExportExcel = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: row.sl,
      date: row.date,
      storageName: row.storageName,
      srNo: row.srNo,
      varietyName: row.varietyName,
      className: row.className,
      gradeName: row.gradeName,
      bagsOut: row.bagsOut,
      kgPerBag: row.kgPerBag,
      totalKgOut: row.totalKgOut,
      totalMtOut: row.totalMtOut,
      cumulativeTotalKg: row.cumulativeTotalKg,
      typeName: row.typeName,
    }));

    const columns = [
      { header: '#', key: 'sl', width: 6 },
      { header: 'DATE', key: 'date', width: 14 },
      { header: 'COLD STORAGE NAME', key: 'storageName', width: 28 },
      { header: 'DELIVERY AGAINST ISSUED SR NO', key: 'srNo', width: 30 },
      { header: 'VARIETY', key: 'varietyName', width: 18 },
      { header: 'CLASS', key: 'className', width: 18 },
      { header: 'GRADE', key: 'gradeName', width: 16 },
      { header: 'NO OF BAG OUT', key: 'bagsOut', width: 16 },
      { header: 'KG PER BAG', key: 'kgPerBag', width: 14 },
      { header: 'TOTAL KG OUT', key: 'totalKgOut', width: 18 },
      { header: 'TOTAL MT OUT', key: 'totalMtOut', width: 16 },
      { header: 'CUMULATIVE TOTAL OUT (KG)', key: 'cumulativeTotalKg', width: 28 },
      { header: 'POTATO TYPE', key: 'typeName', width: 18 },
    ];

    exportToExcel(
      exportData,
      columns,
      `DELIVERY_REPORT_${companySettings?.fiscalYear || '2024'}`,
      'DELIVERY REPORT',
      companySettings,
      `Generated on ${new Date().toLocaleDateString('en-GB')}`
    );
    addToast?.('Delivery report exported to Excel successfully!', 'success');
  };

  // PDF Export according to Table 2 sequence
  const handleExportPdf = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: String(row.sl),
      date: row.date,
      storageName: row.storageName,
      srNo: row.srNo,
      varietyName: row.varietyName,
      className: row.className,
      gradeName: row.gradeName,
      bagsOut: row.bagsOut.toLocaleString(),
      kgPerBag: String(row.kgPerBag),
      totalKgOut: row.totalKgOut.toLocaleString(),
      totalMtOut: row.totalMtOut.toFixed(3),
      cumulativeTotalKg: row.cumulativeTotalKg.toLocaleString(),
      typeName: row.typeName,
    }));

    const columns = [
      { header: '#', key: 'sl' },
      { header: 'DATE', key: 'date' },
      { header: 'COLD STORAGE NAME', key: 'storageName' },
      { header: 'DELIVERY AGAINST ISSUED SR NO', key: 'srNo' },
      { header: 'VARIETY', key: 'varietyName' },
      { header: 'CLASS', key: 'className' },
      { header: 'GRADE', key: 'gradeName' },
      { header: 'NO OF BAG OUT', key: 'bagsOut' },
      { header: 'KG PER BAG', key: 'kgPerBag' },
      { header: 'TOTAL KG OUT', key: 'totalKgOut' },
      { header: 'TOTAL MT OUT', key: 'totalMtOut' },
      { header: 'CUMULATIVE TOTAL OUT (KG)', key: 'cumulativeTotalKg' },
      { header: 'POTATO TYPE', key: 'typeName' },
    ];

    exportToPdf(
      exportData,
      columns,
      `DELIVERY_REPORT_${companySettings?.fiscalYear || '2024'}`,
      'DELIVERY REPORT',
      companySettings,
      `FY: ${companySettings?.fiscalYear || '2024-2025'}`
    );
    addToast?.('Delivery report exported as PDF!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card strictly following Dashboard layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              DELIVERY REPORT
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Outbound seed potato deliveries, client dispatches and cumulative distribution
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
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
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
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
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
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
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
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div>
            <select
              value={selectedStorage}
              onChange={(e) => {
                setSelectedStorage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
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
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">All Types</option>
              {potatoTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
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
            Showing <strong className="text-slate-900 dark:text-white">{sortedAndCumulativeList.length}</strong> dispatches
          </div>
        </div>
      </div>

      {/* Main Table strictly following Table 2 Sequence in image.png */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-850 text-white font-bold border-b border-slate-700 select-none">
              <tr>
                <th className={`${thPadding} text-center font-bold uppercase tracking-wider text-slate-200 w-12`}>
                  #
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
                      DATE
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
                  onClick={() => handleSort('storageName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
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
                  onClick={() => handleSort('srNo')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center gap-1">
                    DELIVERY AGAINST ISSUED SR NO
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="srNo" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('varietyName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
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
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
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
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
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
                  onClick={() => handleSort('bagsOut')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    NO OF BAG OUT
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="bagsOut" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('kgPerBag')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    KG PER BAG
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="kgPerBag" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalKgOut')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    TOTAL KG OUT
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalKgOut" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalMtOut')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    TOTAL MT OUT
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalMtOut" />
                  </span>
                </th>
                <th className={`${thPadding} text-right font-bold uppercase tracking-wider text-amber-300 whitespace-nowrap`}>
                  CUMULATIVE TOTAL OUT (KG)
                </th>
                <th
                  onClick={() => handleSort('typeName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
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
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No matching Delivery records found.
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
                    <td className={`${cellPadding} font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap`}>
                      {row.storageName}
                    </td>
                    <td className={`${cellPadding} font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap`}>
                      {row.srNo}
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
                    <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 dark:text-white`}>
                      {row.bagsOut.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-slate-600 dark:text-slate-400`}>
                      {row.kgPerBag}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 dark:text-white`}>
                      {row.totalKgOut.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-amber-600 dark:text-amber-400`}>
                      {row.totalMtOut.toFixed(3)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20`}>
                      {row.cumulativeTotalKg.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.typeName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Summary Row */}
            {sortedAndCumulativeList.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-850 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                <tr>
                  <td colSpan={7} className={`${cellPadding} text-right uppercase tracking-wider font-bold`}>
                    TOTAL DISPATCHES ({sortedAndCumulativeList.length} ORDERS):
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400`}>
                    {overallTotals.totalBagsOut.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-mono font-black text-slate-900 dark:text-white`}>
                    {overallTotals.totalKg.toLocaleString()} KG
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-amber-600 dark:text-amber-400`}>
                    {overallTotals.totalMt.toFixed(3)} MT
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400`}>
                    {overallTotals.totalKg.toLocaleString()} KG
                  </td>
                  <td className={`${cellPadding} text-slate-400`}>-</td>
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
        title="DELIVERY REPORT"
        onConfirmPrint={() => validateAndTriggerPrint()}
      >
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-black uppercase text-slate-900">
              {companySettings?.companyName || 'KISAN BOTANIX LTD.'}
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              DELIVERY REPORT • FISCAL YEAR {companySettings?.fiscalYear || '2024-2025'}
            </p>
          </div>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-200 font-bold">
              <tr>
                <th className="p-1 border border-slate-300">#</th>
                <th className="p-1 border border-slate-300">DATE</th>
                <th className="p-1 border border-slate-300">COLD STORAGE NAME</th>
                <th className="p-1 border border-slate-300">DELIVERY AGAINST ISSUED SR NO</th>
                <th className="p-1 border border-slate-300">VARIETY</th>
                <th className="p-1 border border-slate-300">CLASS</th>
                <th className="p-1 border border-slate-300">GRADE</th>
                <th className="p-1 border border-slate-300 text-right">NO OF BAG OUT</th>
                <th className="p-1 border border-slate-300 text-right">KG PER BAG</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL KG OUT</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL MT OUT</th>
                <th className="p-1 border border-slate-300 text-right">CUMULATIVE TOTAL OUT (KG)</th>
                <th className="p-1 border border-slate-300">POTATO TYPE</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndCumulativeList.map((row) => (
                <tr key={row.id}>
                  <td className="p-1 border border-slate-300 text-center font-mono">{row.sl}</td>
                  <td className="p-1 border border-slate-300 font-mono">{row.date}</td>
                  <td className="p-1 border border-slate-300">{row.storageName}</td>
                  <td className="p-1 border border-slate-300 font-mono font-bold">{row.srNo}</td>
                  <td className="p-1 border border-slate-300">{row.varietyName}</td>
                  <td className="p-1 border border-slate-300">{row.className}</td>
                  <td className="p-1 border border-slate-300">{row.gradeName}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.bagsOut.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.kgPerBag}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.totalKgOut.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.totalMtOut.toFixed(3)}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.cumulativeTotalKg.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300">{row.typeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintPreviewModal>
    </div>
  );
};
