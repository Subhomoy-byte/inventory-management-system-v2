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
    { id: 'warehouse', label: 'Floor Map', icon: MapPin },
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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0E17]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-1.5 safe-area-pb">
      {/* Secondary Menu Dropup */}
      {showMoreMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-1 p-2 bg-[#101624] border border-white/10 rounded-t-xl shadow-2xl space-y-1">
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
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 font-bold">
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
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
            showMoreMenu || ['orders', 'cyclecount', 'reports', 'conflicts'].includes(currentTab)
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
          {pendingSyncCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
      </div>
    </div>
  );
};
