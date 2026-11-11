import React from 'react';
import { cn } from '../../utils/cn';
import type { ProductStatus, MovementType } from '../../types';

interface StatusChipProps {
  status?: ProductStatus | MovementType | string;
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className }) => {
  const getReadableLabel = (s?: string) => {
    switch (s) {
      case 'OPTIMAL': return 'Optimal Stock';
      case 'LOW_STOCK': return 'Low Stock';
      case 'CRITICAL': return 'Critical Shortage';
      case 'OVERSTOCKED': return 'Overstocked';
      case 'IN': return 'Stock In';
      case 'OUT': return 'Stock Out';
      case 'TRANSFER': return 'Shelf Transfer';
      case 'ADJUST': return 'Audit Adjustment';
      case 'ADMIN': return 'Administrator';
      case 'MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Floor Staff';
      default: return s || 'Unknown';
    }
  };

  const text = label || getReadableLabel(status);

  let colorClasses = 'bg-white/[0.06] text-white/80 border-white/10';

  switch (status) {
    case 'OPTIMAL':
      colorClasses = 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30';
      break;
    case 'LOW_STOCK':
      colorClasses = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30';
      break;
    case 'CRITICAL':
      colorClasses = 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40 animate-pulse';
      break;
    case 'OVERSTOCKED':
      colorClasses = 'bg-[#7C6CFF]/15 text-[#7C6CFF] border-[#7C6CFF]/30';
      break;
    case 'IN':
      colorClasses = 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30';
      break;
    case 'OUT':
      colorClasses = 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30';
      break;
    case 'TRANSFER':
      colorClasses = 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30';
      break;
    case 'ADJUST':
      colorClasses = 'bg-[#7C6CFF]/15 text-[#7C6CFF] border-[#7C6CFF]/30';
      break;
    case 'ADMIN':
      colorClasses = 'bg-[#7C6CFF]/20 text-[#7C6CFF] border-[#7C6CFF]/40';
      break;
    case 'MANAGER':
      colorClasses = 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/40';
      break;
    case 'EMPLOYEE':
      colorClasses = 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40';
      break;
  }

  return (
    <span
      className={cn(
        'badge-glow font-mono font-bold text-[11px] tracking-tight',
        colorClasses,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5 inline-block" />
      {text}
    </span>
  );
};
