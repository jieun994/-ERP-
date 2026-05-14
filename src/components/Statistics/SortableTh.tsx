import React from 'react';
import type { SortKey, SortDir } from './types';

interface SortableThProps {
  label: string;
  col: SortKey;
  align: 'left' | 'right';
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}

export default function SortableTh({ label, col, align, sortKey, sortDir, onSort }: SortableThProps) {
  const active = sortKey === col;
  const arrow = active ? (sortDir === 'asc' ? '▲' : '▼') : '';
  return (
    <th className={'px-4 h-[44px] text-[12px] font-semibold ' + (align === 'right' ? 'text-right' : 'text-left')}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={
          'inline-flex items-center gap-1 select-none hover:text-[#008d75] transition-colors ' +
          (active ? 'text-[#008d75]' : 'text-[#4E5968]')
        }
      >
        <span>{label}</span>
        <span className="text-[10px] opacity-70 w-2 inline-block">{arrow}</span>
      </button>
    </th>
  );
}
