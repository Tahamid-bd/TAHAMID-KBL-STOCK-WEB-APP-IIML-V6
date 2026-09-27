import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortIconProps {
  field?: string;
  currentField?: string;
  direction?: 'asc' | 'desc';
  columnKey?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
}

export const SortIcon: React.FC<SortIconProps> = ({
  field,
  currentField,
  direction,
  columnKey,
  sortKey,
  sortDir,
}) => {
  const activeCol = field || columnKey;
  const current = currentField || sortKey;
  const dir = direction || sortDir || 'asc';

  if (!activeCol || activeCol !== current) {
    return <ArrowUpDown className="w-3 h-3 text-slate-400/60 inline ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />;
  }

  return dir === 'asc' ? (
    <ArrowUp className="w-3.5 h-3.5 text-sky-400 bg-sky-950/60 p-0.5 rounded inline ml-1" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-sky-400 bg-sky-950/60 p-0.5 rounded inline ml-1" />
  );
};
