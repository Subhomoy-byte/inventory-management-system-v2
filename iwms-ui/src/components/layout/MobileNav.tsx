import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  History,
  ShoppingCart,
  ClipboardCheck,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import type { NavTab } from './Dock';

interface MobileNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingSyncCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  pendingSyncCount = 0,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const primaryTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'inventory', label: 'Catalog', icon: Boxes },
    { id: 'warehouse', label: '3D Floor', icon: MapPin },
    { id: 'movements', label: 'Ledger', icon: History },
  ];

  const secondaryTabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'cyclecount', label: 'Cycle Counting', icon: ClipboardCheck },
    {
      id: 'conflicts',
      label: 'Sync Outbox',
      icon: RefreshCw,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/[0.08] px-2 py-1.5 safe-area-pb transition-colors">
      {/* Secondary Menu Dropup */}
      {showMoreMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-1 p-2 bg-white dark:bg-[#101624] border border-slate-200 dark:border-white/10 rounded-t-xl shadow-2xl space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
            Additional Tools
          </div>
          {secondaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setShowMoreMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onSelectTab(tab.id);
                setShowMoreMenu(false);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMoreMenu((prev) => !prev)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            showMoreMenu
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
};
