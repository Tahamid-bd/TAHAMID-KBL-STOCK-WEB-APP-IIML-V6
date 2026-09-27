import React, { useState } from 'react';
import { Warehouse, MapPin, User, Search, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { matchesUniversalSearch } from '../../utils/searchUtils';

export const ColdStorageListView: React.FC = () => {
  const { coldStorages, stockTransactions, deliveryTransactions, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const resetFilters = () => {
    setSearchTerm('');
    addToast('Cold storage search reset', 'info');
  };

  const filtered = coldStorages.filter((c) =>
    matchesUniversalSearch(c, searchTerm, [c.name, c.location, c.contactPerson, c.contactPhone, c.capacity])
  );

  return (
    <div className="space-y-4">
      {/* Header Card following Dashboard strictly */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900 shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              COLD STORAGES
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Storage facilities, chamber capacities and live occupancy
            </p>
          </div>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
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
      </div>

      {/* Grid of Storage Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cs) => {
          const inSacks = stockTransactions
            .filter((s) => s.coldStorageId === cs.id)
            .reduce((acc, s) => acc + s.sackQuantity, 0);
          const outSacks = deliveryTransactions
            .filter((d) => d.coldStorageId === cs.id)
            .reduce((acc, d) => acc + (d.sackQuantity || d.quantity || 0), 0);
          const currentBags = Math.max(0, inSacks - outSacks);
          const capacityBags = cs.capacity || 10000;
          const occupancyPct = Math.min(100, Math.round((currentBags / capacityBags) * 100));

          return (
            <div
              key={cs.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-sky-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {cs.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{cs.location || 'Location Not Specified'}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 uppercase text-[11px] font-bold">Occupancy</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {occupancyPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Current Stock</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {currentBags.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Bags</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Capacity</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {capacityBags.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Bags</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Manager footer */}
              {cs.contactPerson && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cs.contactPerson}</span>
                  </span>
                  {cs.contactPhone && (
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {cs.contactPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
