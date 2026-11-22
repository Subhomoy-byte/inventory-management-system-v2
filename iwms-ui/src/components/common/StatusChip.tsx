import React from 'react';
import { cn } from '../../utils/cn';
import type { ProductStatus, MovementType } from '../../types';

interface StatusChipProps {
  status?: ProductStatus | MovementType | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className, showDot = true }) => {
  const getReadableLabel = (s?: string) => {
    switch (s) {
      case 'OPTIMAL': return 'Optimal Stock';
      case 'LOW_STOCK': return 'Low Stock';
      case 'CRITICAL': return 'Critical Shortage';
      case 'OVERSTOCKED': return 'Overstocked';
      case 'IN': return 'Stock In';
      case 'OUT': return 'Stock Out';
      case 'TRANSFER': return 'Bin Transfer';
      case 'ADJUST': return 'Cycle Adjust';
      case 'ADMIN': return 'Administrator';
      case 'MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Floor Associate';
      default: return s || 'Unknown';
    }
  };

  const text = label || getReadableLabel(status);

  let colorClasses = 'bg-white/[0.04] text-slate-300 border-white/10';

  switch (status) {
    case 'OPTIMAL':
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      break;
    case 'LOW_STOCK':
      colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      break;
    case 'CRITICAL':
      colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      break;
    case 'OVERSTOCKED':
      colorClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      break;
    case 'IN':
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      break;
    case 'OUT':
      colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      break;
    case 'TRANSFER':
      colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25';
      break;
    case 'ADJUST':
      colorClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      break;
    case 'ADMIN':
      colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      break;
    case 'MANAGER':
      colorClasses = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      break;
    case 'EMPLOYEE':
      colorClasses = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight border select-none',
        colorClasses,
        className
      )}
    >
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
