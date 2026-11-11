import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  History,
  ShoppingCart,
  ClipboardCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'warehouse'
  | 'movements'
  | 'orders'
  | 'cyclecount'
  | 'reports'
  | 'conflicts';

interface DockProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingSyncCount?: number;
}

export const Dock: React.FC<DockProps> = ({ currentTab, onSelectTab, pendingSyncCount = 0 }) => {
  const items: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'inventory', label: 'Products', icon: <Boxes className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'warehouse', label: 'Floor Map', icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'movements', label: 'Ledger', icon: <History className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'orders', label: 'Inbound POs', icon: <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'cyclecount', label: 'Cycle Count', icon: <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'reports', label: 'PDF Reports', icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      id: 'conflicts',
      label: 'Sync Outbox',
      icon: <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
    },
  ];

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none px-3">
      <nav className="glass-dock pointer-events-auto p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group relative px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl flex flex-col items-center justify-center transition-colors duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
              title={item.label}
            >
              {/* Luminous Active Spring Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeDockPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] rounded-2xl shadow-lg shadow-[#7C6CFF]/30 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}

              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.2 bg-[#F87171] text-white font-mono text-[10px] font-extrabold rounded-full animate-pulse shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-mono font-bold tracking-tight hidden lg:block mt-1">
                {item.label}
              </span>

              {/* Tooltip on smaller screens */}
              <div className="absolute -top-10 px-2.5 py-1 bg-[#070912]/95 border border-white/10 text-white text-[10px] font-mono font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap lg:hidden shadow-xl backdrop-blur-md">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
