import React, { useState } from 'react';
import { Sliders, Search, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { matchesUniversalSearch } from '../../utils/searchUtils';

export const MasterDataView: React.FC = () => {
  const { varieties, seedClasses, grades, productionBlocks, addToast } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'varieties' | 'classes' | 'grades' | 'blocks'>('varieties');
  const [searchTerm, setSearchTerm] = useState('');

  const resetFilters = () => {
    setSearchTerm('');
    addToast('Master data search reset', 'info');
  };

  const getFilteredItems = () => {
    switch (activeSubTab) {
      case 'varieties':
        return varieties.filter((v) =>
          matchesUniversalSearch(v, searchTerm, [v.name, v.code, v.description])
        );
      case 'classes':
        return seedClasses.filter((c) =>
          matchesUniversalSearch(c, searchTerm, [c.name, c.code, c.description])
        );
      case 'grades':
        return grades.filter((g) =>
          matchesUniversalSearch(g, searchTerm, [g.name, g.code, g.sizeSpec])
        );
      case 'blocks':
        return productionBlocks.filter((b) =>
          matchesUniversalSearch(b, searchTerm, [b.name, b.district, b.location])
        );
    }
  };

  const currentItems = getFilteredItems();

  return (
    <div className="space-y-4">
      {/* Header strictly following Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              MASTER DATA
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Varieties, certification classes, grading scales and production blocks
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('varieties')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
              activeSubTab === 'varieties'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            VARIETIES ({varieties.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
              activeSubTab === 'classes'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            CLASSES ({seedClasses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('grades')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
              activeSubTab === 'grades'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            GRADES ({grades.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('blocks')}
            className={`px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase ${
              activeSubTab === 'blocks'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            BLOCKS ({productionBlocks.length})
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
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 uppercase"
          title="Reset search"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentItems.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No matching master data items found.
          </div>
        ) : (
          currentItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-sky-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">{item.name}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 uppercase">
                  {item.code || 'ID'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(item as any).description || (item as any).sizeSpec || (item as any).location || 'Configured master record'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
