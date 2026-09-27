import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  PackagePlus,
  Truck,
  Warehouse,
  TrendingDown,
  Scale,
  BarChart3,
  Files,
  FileCheck,
  Sliders,
  Users,
  History,
  ShieldCheck,
  FileSpreadsheet,
  Sprout,
  X,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  accentColor: 'sky' | 'emerald' | 'indigo' | 'amber';
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    hasPermission,
    companySettings,
    setIsImportModalOpen,
    recycledItems,
    setIsRecycleModalOpen,
  } = useApp();

  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      title: 'OVERVIEW',
      accentColor: 'sky',
      items: [
        {
          id: 'dashboard',
          label: 'DASHBOARD',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'user-input',
      title: 'OPERATIONS',
      accentColor: 'emerald',
      items: [
        {
          id: 'stock-entry-records',
          label: 'STOCK IN ALL RECORD',
          icon: PackagePlus,
          permission: 'view_stock',
        },
        {
          id: 'delivery-entry-records',
          label: 'DELIVERY ALL RECORD',
          icon: Truck,
          permission: 'view_delivery',
        },
      ],
    },
    {
      id: 'intelligence-reports',
      title: 'REPORTS',
      accentColor: 'indigo',
      items: [
        {
          id: 'report-cold-storage-in',
          label: 'STOCK IN',
          icon: Warehouse,
          permission: 'view_reports',
        },
        {
          id: 'report-delivery',
          label: 'DELIVERY REPORT',
          icon: TrendingDown,
          permission: 'view_reports',
        },
        {
          id: 'report-closing-stock',
          label: 'STOCK REGISTER',
          icon: Scale,
          permission: 'view_reports',
        },
      ],
    },
    {
      id: 'admin-governance',
      title: 'ADMIN',
      accentColor: 'amber',
      items: [
        {
          id: 'cold-storage',
          label: 'COLD STORAGES',
          icon: Warehouse,
          permission: 'view_cold_storage',
        },
        {
          id: 'rent-management',
          label: 'RENT LEDGER',
          icon: Scale,
          permission: 'view_rent',
        },
        {
          id: 'master-data',
          label: 'MASTER DATA',
          icon: Sliders,
          permission: 'view_settings',
        },
        {
          id: 'users-roles',
          label: 'USERS & ROLES',
          icon: Users,
          permission: 'view_users',
        },
        {
          id: 'audit-logs',
          label: 'AUDIT LOGS',
          icon: History,
          permission: 'view_audit_logs',
        },
        {
          id: 'settings',
          label: 'SETTINGS',
          icon: ShieldCheck,
          permission: 'manage_settings',
        },
      ],
    },
  ];

  const groupThemes = {
    sky: {
      header: 'bg-gradient-to-r from-sky-950/90 via-slate-900 to-slate-900/90 border-sky-500/50 text-sky-200',
      dot: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
      borderGuide: 'border-sky-500/40',
      badge: 'bg-sky-950/80 text-sky-300 border-sky-600/50',
      activeBtn: 'bg-sky-950/70 hover:bg-sky-950/90 text-sky-100 font-bold border-l-4 border-sky-400 shadow-sm shadow-sky-950/50 ring-1 ring-sky-500/30 pl-2.5',
      activeIcon: 'text-sky-300 scale-105 drop-shadow-xs',
      activeBadge: 'bg-sky-900/80 text-sky-200 border border-sky-600/40',
    },
    emerald: {
      header: 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900/90 border-emerald-500/50 text-emerald-200',
      dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
      borderGuide: 'border-emerald-500/40',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
      activeBtn: 'bg-emerald-950/70 hover:bg-emerald-950/90 text-emerald-100 font-bold border-l-4 border-emerald-400 shadow-sm shadow-emerald-950/50 ring-1 ring-emerald-500/30 pl-2.5',
      activeIcon: 'text-emerald-300 scale-105 drop-shadow-xs',
      activeBadge: 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/40',
    },
    indigo: {
      header: 'bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-900/90 border-indigo-500/50 text-indigo-200',
      dot: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]',
      borderGuide: 'border-indigo-500/40',
      badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-600/50',
      activeBtn: 'bg-indigo-950/70 hover:bg-indigo-950/90 text-indigo-100 font-bold border-l-4 border-indigo-400 shadow-sm shadow-indigo-950/50 ring-1 ring-indigo-500/30 pl-2.5',
      activeIcon: 'text-indigo-300 scale-105 drop-shadow-xs',
      activeBadge: 'bg-indigo-900/80 text-indigo-200 border border-indigo-600/40',
    },
    amber: {
      header: 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900/90 border-amber-500/50 text-amber-200',
      dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
      borderGuide: 'border-amber-500/40',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
      activeBtn: 'bg-amber-950/70 hover:bg-amber-950/90 text-amber-100 font-bold border-l-4 border-amber-400 shadow-sm shadow-amber-950/50 ring-1 ring-amber-500/30 pl-2.5',
      activeIcon: 'text-amber-300 scale-105 drop-shadow-xs',
      activeBadge: 'bg-amber-900/80 text-amber-200 border border-amber-600/40',
    },
  };

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090d16] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-2xl lg:shadow-none no-print`}
      >
        {/* Company Branding - Clickable link to Dashboard */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80 bg-slate-950/60">
          <button
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity group cursor-pointer focus:outline-none"
            title="Go to Dashboard"
          >
            {companySettings.logoUrl ? (
              <img
                src={companySettings.logoUrl}
                alt={companySettings.companyName}
                className="w-9 h-9 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-white/20">
                <Sprout className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight truncate group-hover:text-sky-400 transition-colors uppercase">
                {companySettings.companyName || companySettings.logoText || 'KISHAN BOTANIX LTD.'}
              </h1>
              <p className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase truncate">
                INVENTORY MANAGEMENT APP
              </p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation scrollable area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission as any)
            );

            if (visibleItems.length === 0) return null;

            const theme = groupThemes[group.accentColor];

            return (
              <div key={group.title} className="space-y-1">
                {/* Bold Button-Styled Section Header with Glowing Dot */}
                <div
                  className={`w-full flex items-center px-3 py-2 rounded-xl border shadow-xs select-none transition-all ${theme.header}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                    <span className="text-[11px] font-black tracking-wider uppercase drop-shadow-xs">
                      {group.title}
                    </span>
                  </div>
                </div>

                {/* Sub-tree Container for Child Menu Buttons with Colored Vertical Guideline */}
                <div className={`ml-2 pl-2.5 border-l-2 ${theme.borderGuide} space-y-1 pt-1 pb-1`}>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    // Check if current tab matches this item's id or its alias
                    const isActive =
                      activeTab === item.id ||
                      (item.id === 'dashboard' && activeTab === 'dashboard') ||
                      (item.id === 'stock-entry-records' && (activeTab === 'stock-entry-records' || activeTab === 'stock-register' || activeTab === 'stock-entry')) ||
                      (item.id === 'delivery-entry-records' && (activeTab === 'delivery-entry-records' || activeTab === 'delivery-register')) ||
                      (item.id === 'report-cold-storage-in' && (activeTab === 'report-cold-storage-in' || activeTab === 'reports-stock')) ||
                      (item.id === 'report-delivery' && (activeTab === 'report-delivery' || activeTab === 'reports-delivery')) ||
                      (item.id === 'report-closing-stock' && (activeTab === 'report-closing-stock' || activeTab === 'reports-closing' || activeTab === 'reports-in-out' || activeTab === 'reports-dimensions' || activeTab === 'report-combined' || activeTab === 'reports-storage' || activeTab === 'reports-sr' || activeTab === 'report-sr-status' || activeTab === 'reports-challan' || activeTab === 'report-challan-status'));

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full group flex items-center justify-between pr-3 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? theme.activeBtn
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-l-4 border-transparent pl-2.5 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isActive
                                ? theme.activeIcon
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className={`truncate text-left ${isActive ? 'font-bold tracking-tight text-white' : ''}`}>
                            {item.label}
                          </span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors shrink-0 ml-1.5 ${
                              isActive
                                ? theme.activeBadge
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Actions: Recycle Bin & Import Excel */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          {/* Recycle Bin Button */}
          <button
            onClick={() => {
              setIsRecycleModalOpen(true);
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Open Recycle Bin"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="uppercase text-[11px] tracking-wider">RECYCLE BIN</span>
            </div>
            {recycledItems.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {recycledItems.length}
              </span>
            )}
          </button>

          {/* Import Excel Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-700/60 hover:bg-emerald-900/60 transition-colors shadow-xs cursor-pointer tracking-wider"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="uppercase">IMPORT EXCEL</span>
          </button>
        </div>
      </aside>
    </>
  );
};
