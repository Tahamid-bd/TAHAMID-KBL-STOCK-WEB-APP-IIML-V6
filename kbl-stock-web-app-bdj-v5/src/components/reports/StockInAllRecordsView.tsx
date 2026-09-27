import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TableDensity } from '../../types';
import {
  Boxes,
  Search,
  Filter,
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

export const StockInAllRecordsView: React.FC = () => {
  const {
    stockTransactions,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    productionBlocks,
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
  const [selectedBlock, setSelectedBlock] = useState('');
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
    setSelectedBlock('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    addToast?.('All filters reset successfully', 'info');
  };

  const activeFilterCount = [
    Boolean(searchQuery),
    Boolean(selectedStorage),
    Boolean(selectedVariety),
    Boolean(selectedClass),
    Boolean(selectedGrade),
    Boolean(selectedBlock),
    Boolean(selectedType),
    Boolean(startDate || endDate),
  ].filter(Boolean).length;

  // Filtered dataset
  const filteredList = useMemo(() => {
    return stockTransactions.filter((s) => {
      if (startDate && s.date < startDate) return false;
      if (endDate && s.date > endDate) return false;
      if (selectedStorage && s.coldStorageId !== selectedStorage) return false;
      if (selectedVariety && s.varietyId !== selectedVariety) return false;
      if (selectedClass && s.classId !== selectedClass) return false;
      if (selectedGrade && s.gradeId !== selectedGrade) return false;
      if (selectedBlock && s.productionBlockId !== selectedBlock) return false;
      if (selectedType && s.potatoTypeId !== selectedType) return false;

      const csName = coldStorages.find((c) => c.id === s.coldStorageId)?.name || '';
      const vName = varieties.find((v) => v.id === s.varietyId)?.name || '';
      const cName = seedClasses.find((c) => c.id === s.classId)?.name || '';
      const gName = grades.find((g) => g.id === s.gradeId)?.name || '';
      const bName = productionBlocks.find((b) => b.id === s.productionBlockId)?.name || '';
      const tName = potatoTypes.find((t) => t.id === s.potatoTypeId)?.name || '';

      if (
        !matchesUniversalSearch(s, searchQuery, [
          csName,
          vName,
          cName,
          gName,
          bName,
          tName,
        ])
      ) {
        return false;
      }

      return true;
    });
  }, [
    stockTransactions,
    startDate,
    endDate,
    selectedStorage,
    selectedVariety,
    selectedClass,
    selectedGrade,
    selectedBlock,
    selectedType,
    searchQuery,
    coldStorages,
    varieties,
    seedClasses,
    grades,
    productionBlocks,
    potatoTypes,
  ]);

  // Sort and calculate running cumulative total in KG
  const sortedAndCumulativeList = useMemo(() => {
    // Sort base data
    const sorted = sortData(filteredList, sortKey, sortDir);

    let runningCumulativeKg = 0;
    return sorted.map((s, index) => {
      const kgPerBag = s.kgPerBag || 50;
      const totalKgIn = s.totalKg || s.sackQuantity * kgPerBag;
      const totalMtIn = s.totalMt || Number((totalKgIn / 1000).toFixed(3));
      const kblBags = s.sackQuantity;
      const srCopyBags = (s as any).srCopyBags ? Number((s as any).srCopyBags) : s.sackQuantity;

      runningCumulativeKg += totalKgIn;

      const csName = coldStorages.find((c) => c.id === s.coldStorageId)?.name || '-';
      const varietyName = varieties.find((v) => v.id === s.varietyId)?.name || '-';
      const blockName =
        productionBlocks.find((b) => b.id === s.productionBlockId)?.name || s.farmBlock || '-';
      const typeName =
        potatoTypes.find((t) => t.id === s.potatoTypeId)?.name || 'Seed Potato';

      return {
        ...s,
        sl: index + 1,
        date: s.date,
        kblChallanNo: s.kblChallanNo || '-',
        srNo: s.srNo || '-',
        storageName: csName,
        varietyName,
        kblBags,
        srCopyBags,
        kgPerBag,
        totalKgIn,
        totalMtIn,
        cumulativeTotalKg: runningCumulativeKg,
        blockName,
        typeName,
      };
    });
  }, [
    filteredList,
    sortKey,
    sortDir,
    coldStorages,
    varieties,
    productionBlocks,
    potatoTypes,
  ]);

  // Overall totals
  const overallTotals = useMemo(() => {
    const totalKblBags = sortedAndCumulativeList.reduce((acc, row) => acc + row.kblBags, 0);
    const totalSrBags = sortedAndCumulativeList.reduce((acc, row) => acc + row.srCopyBags, 0);
    const totalKg = sortedAndCumulativeList.reduce((acc, row) => acc + row.totalKgIn, 0);
    const totalMt = Number((totalKg / 1000).toFixed(3));
    return {
      totalKblBags,
      totalSrBags,
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

  // Excel Export according to Table 1 sequence
  const handleExportExcel = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: row.sl,
      date: row.date,
      kblChallanNo: row.kblChallanNo,
      srNo: row.srNo,
      storageName: row.storageName,
      kblBags: row.kblBags,
      srCopyBags: row.srCopyBags,
      kgPerBag: row.kgPerBag,
      totalKgIn: row.totalKgIn,
      totalMtIn: row.totalMtIn,
      cumulativeTotalKg: row.cumulativeTotalKg,
      blockName: row.blockName,
      typeName: row.typeName,
    }));

    const columns = [
      { header: '#', key: 'sl', width: 6 },
      { header: 'DATE', key: 'date', width: 14 },
      { header: 'KBL CHALLAN NO', key: 'kblChallanNo', width: 18 },
      { header: 'SR NO.', key: 'srNo', width: 16 },
      { header: 'COLD STORAGE NAME', key: 'storageName', width: 28 },
      { header: 'NO OF BAG IN (KBL CHALLAN)', key: 'kblBags', width: 26 },
      { header: 'NO OF BAG IN (SR COPY)', key: 'srCopyBags', width: 24 },
      { header: 'KG PER BAG', key: 'kgPerBag', width: 14 },
      { header: 'TOTAL KG IN', key: 'totalKgIn', width: 18 },
      { header: 'TOTAL MT IN', key: 'totalMtIn', width: 16 },
      { header: 'CUMULATIVE TOTAL IN (KG)', key: 'cumulativeTotalKg', width: 26 },
      { header: 'PRODUCTION BLOCK NAME', key: 'blockName', width: 24 },
      { header: 'POTATO TYPE', key: 'typeName', width: 18 },
    ];

    exportToExcel(
      exportData,
      columns,
      `STOCK_IN_REPORT_${companySettings?.fiscalYear || '2024'}`,
      'STOCK IN REPORT',
      companySettings,
      `Generated on ${new Date().toLocaleDateString('en-GB')}`
    );
    addToast?.('Stock In report exported to Excel successfully!', 'success');
  };

  // PDF Export according to Table 1 sequence
  const handleExportPdf = () => {
    const exportData = sortedAndCumulativeList.map((row) => ({
      sl: String(row.sl),
      date: row.date,
      kblChallanNo: row.kblChallanNo,
      srNo: row.srNo,
      storageName: row.storageName,
      kblBags: row.kblBags.toLocaleString(),
      srCopyBags: row.srCopyBags.toLocaleString(),
      kgPerBag: String(row.kgPerBag),
      totalKgIn: row.totalKgIn.toLocaleString(),
      totalMtIn: row.totalMtIn.toFixed(3),
      cumulativeTotalKg: row.cumulativeTotalKg.toLocaleString(),
      blockName: row.blockName,
      typeName: row.typeName,
    }));

    const columns = [
      { header: '#', key: 'sl' },
      { header: 'DATE', key: 'date' },
      { header: 'KBL CHALLAN NO', key: 'kblChallanNo' },
      { header: 'SR NO.', key: 'srNo' },
      { header: 'COLD STORAGE NAME', key: 'storageName' },
      { header: 'NO OF BAG IN (KBL CHALLAN)', key: 'kblBags' },
      { header: 'NO OF BAG IN (SR COPY)', key: 'srCopyBags' },
      { header: 'KG PER BAG', key: 'kgPerBag' },
      { header: 'TOTAL KG IN', key: 'totalKgIn' },
      { header: 'TOTAL MT IN', key: 'totalMtIn' },
      { header: 'CUMULATIVE TOTAL IN (KG)', key: 'cumulativeTotalKg' },
      { header: 'PRODUCTION BLOCK NAME', key: 'blockName' },
      { header: 'POTATO TYPE', key: 'typeName' },
    ];

    exportToPdf(
      exportData,
      columns,
      `STOCK_IN_REPORT_${companySettings?.fiscalYear || '2024'}`,
      'STOCK IN REPORT',
      companySettings,
      `FY: ${companySettings?.fiscalYear || '2024-2025'}`
    );
    addToast?.('Stock In report exported as PDF!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card strictly following Dashboard layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              STOCK IN
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cold storage inbound potato seed receipts and verified lot inventory
            </p>
          </div>
        </div>

        {/* Action Controls: Density & Exports */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {/* Density Selector */}
          <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
                density === 'compact'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
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
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
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
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              COMFORTABLE
            </button>
          </div>

          {/* Export & Print */}
          <ReportButtonGroup
            onPrint={() => setIsPreviewOpen(true)}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      {/* Filter Toolbar Card with Universal Search & Reset Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
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
          {/* Cold Storage */}
          <div>
            <select
              value={selectedStorage}
              onChange={(e) => {
                setSelectedStorage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">All Storages</option>
              {coldStorages.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variety */}
          <div>
            <select
              value={selectedVariety}
              onChange={(e) => {
                setSelectedVariety(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">All Varieties</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seed Class */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">All Classes</option>
              {seedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Production Block */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => {
                setSelectedBlock(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="">All Blocks</option>
              {productionBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Potato Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
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
            Showing <strong className="text-slate-900 dark:text-white">{sortedAndCumulativeList.length}</strong> records
          </div>
        </div>
      </div>

      {/* Main Table strictly following Table 1 Sequence in image.png */}
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
                  onClick={() => handleSort('kblChallanNo')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center gap-1">
                    KBL CHALLAN NO
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="kblChallanNo" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('srNo')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center gap-1">
                    SR NO.
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="srNo" />
                  </span>
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
                  onClick={() => handleSort('kblBags')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    NO OF BAG IN (KBL CHALLAN)
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="kblBags" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('srCopyBags')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    NO OF BAG IN (SR COPY)
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="srCopyBags" />
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
                  onClick={() => handleSort('totalKgIn')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    TOTAL KG IN
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalKgIn" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('totalMtIn')}
                  className={`${thPadding} text-right font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <span className="flex items-center justify-end gap-1">
                    TOTAL MT IN
                    <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="totalMtIn" />
                  </span>
                </th>
                <th className={`${thPadding} text-right font-bold uppercase tracking-wider text-amber-300 whitespace-nowrap`}>
                  CUMULATIVE TOTAL IN (KG)
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
                  onClick={() => handleSort('blockName')}
                  className={`${thPadding} font-bold uppercase tracking-wider text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">
                      PRODUCTION BLOCK NAME
                      <SortIcon sortKey={sortKey} sortDir={sortDir} columnKey="blockName" />
                    </span>
                    <ColumnHeaderFilter
                      columnTitle="PRODUCTION BLOCK"
                      type="select"
                      options={productionBlocks.map((b) => ({ label: b.name, value: b.id }))}
                      value={selectedBlock}
                      onChangeValue={(val) => {
                        setSelectedBlock(val);
                        setCurrentPage(1);
                      }}
                      isFiltered={Boolean(selectedBlock)}
                      onClearFilter={() => setSelectedBlock('')}
                      onClearAllFilters={resetFilters}
                    />
                  </div>
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
                  <td colSpan={14} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No matching Stock In records found.
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
                      {row.kblBags.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-slate-700 dark:text-slate-300`}>
                      {row.srCopyBags.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-slate-600 dark:text-slate-400`}>
                      {row.kgPerBag}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 dark:text-white`}>
                      {row.totalKgIn.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-emerald-600 dark:text-emerald-400`}>
                      {row.totalMtIn.toFixed(3)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20`}>
                      {row.cumulativeTotalKg.toLocaleString()}
                    </td>
                    <td className={`${cellPadding} font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap`}>
                      {row.varietyName}
                    </td>
                    <td className={`${cellPadding} text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                      {row.blockName}
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
                  <td colSpan={5} className={`${cellPadding} text-right uppercase tracking-wider font-bold`}>
                    TOTALS ({sortedAndCumulativeList.length} LOTS):
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-sky-700 dark:text-sky-400`}>
                    {overallTotals.totalKblBags.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-slate-800 dark:text-slate-200`}>
                    {overallTotals.totalSrBags.toLocaleString()}
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-mono font-black text-slate-900 dark:text-white`}>
                    {overallTotals.totalKg.toLocaleString()} KG
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-emerald-600 dark:text-emerald-400`}>
                    {overallTotals.totalMt.toFixed(3)} MT
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-black text-amber-700 dark:text-amber-400`}>
                    {overallTotals.totalKg.toLocaleString()} KG
                  </td>
                  <td colSpan={3} className={`${cellPadding} text-slate-400`}>-</td>
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
        title="STOCK IN REPORT"
        onConfirmPrint={() => validateAndTriggerPrint()}
      >
        <div className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-black uppercase text-slate-900">
              {companySettings?.companyName || 'KISAN BOTANIX LTD.'}
            </h2>
            <p className="text-xs font-bold text-slate-700 uppercase">
              STOCK IN REPORT • FISCAL YEAR {companySettings?.fiscalYear || '2024-2025'}
            </p>
          </div>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-200 font-bold">
              <tr>
                <th className="p-1 border border-slate-300">#</th>
                <th className="p-1 border border-slate-300">DATE</th>
                <th className="p-1 border border-slate-300">KBL CHALLAN NO</th>
                <th className="p-1 border border-slate-300">SR NO.</th>
                <th className="p-1 border border-slate-300">COLD STORAGE NAME</th>
                <th className="p-1 border border-slate-300 text-right">NO OF BAG IN (KBL CHALLAN)</th>
                <th className="p-1 border border-slate-300 text-right">NO OF BAG IN (SR COPY)</th>
                <th className="p-1 border border-slate-300 text-right">KG PER BAG</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL KG IN</th>
                <th className="p-1 border border-slate-300 text-right">TOTAL MT IN</th>
                <th className="p-1 border border-slate-300 text-right">CUMULATIVE TOTAL IN (KG)</th>
                <th className="p-1 border border-slate-300">PRODUCTION BLOCK NAME</th>
                <th className="p-1 border border-slate-300">POTATO TYPE</th>
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
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.kblBags.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.srCopyBags.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.kgPerBag}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.totalKgIn.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono">{row.totalMtIn.toFixed(3)}</td>
                  <td className="p-1 border border-slate-300 text-right font-mono font-bold">{row.cumulativeTotalKg.toLocaleString()}</td>
                  <td className="p-1 border border-slate-300">{row.blockName}</td>
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
