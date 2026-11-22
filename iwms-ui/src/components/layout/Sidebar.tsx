import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  History,
  ShoppingCart,
  ClipboardCheck,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
} from 'lucide-react';
import type { NavTab } from './Dock';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSyncCount?: number;
  onOpenCommandPalette?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  pendingSyncCount = 0,
  onOpenCommandPalette,
}) => {
  const { user, logout } = useAuth();
  const isOnline = navigator.onLine;

  const mainNavItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock Catalog', icon: Boxes },
    { id: 'warehouse', label: '2D Floor Topology', icon: MapPin },
    { id: 'movements', label: 'Audit Ledger', icon: History },
  ];

  const secondaryNavItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'cyclecount', label: 'Cycle Counting', icon: ClipboardCheck },
    { id: 'reports', label: 'Manifest & Reports', icon: FileText },
    {
      id: 'conflicts',
      label: 'Sync Outbox',
      icon: RefreshCw,
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-white/[0.08] bg-[#0A0E17] transition-all duration-300 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#121927] border border-white/10 flex items-center justify-center p-2 shrink-0 shadow-sm">
            <img src="/favicon.svg" alt="IWMS Pro Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-heading font-extrabold text-base tracking-tight text-white block">
                IWMS Pro
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                Warehouse Operating OS
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Search Shortcut */}
      <div className="p-3">
        <button
          onClick={onOpenCommandPalette}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111726] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-medium ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Search or jump to (Cmd+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            {!isCollapsed && <span>Quick Find...</span>}
          </div>
          {!isCollapsed && (
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-slate-300 font-mono">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Operations
            </span>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Audit & Management
            </span>
          )}
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Network Status & User Profile Footer */}
      <div className="p-3 border-t border-white/[0.08] space-y-2 bg-[#080B12]">
        {/* Offline / LAN status badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title={isOnline ? 'Connected to Warehouse LAN' : 'Offline Mode — Outbox Queued'}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5 shrink-0" /> : <WifiOff className="w-3.5 h-3.5 shrink-0" />}
          {!isCollapsed && (
            <span className="font-mono text-[11px] truncate">
              {isOnline ? 'LAN Host Active' : 'Offline Mode'}
            </span>
          )}
        </div>

        {/* User Card */}
        <div className={`flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.username || 'Operator'}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  <span>{user?.role || 'FLOOR_STAFF'}</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
