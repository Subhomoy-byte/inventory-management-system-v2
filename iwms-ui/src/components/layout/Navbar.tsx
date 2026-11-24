import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { OfflineSyncManager } from '../../storage/sync';
import {
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import type { MovementType } from '../../types';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
  onOpenMovementModal?: (type: MovementType) => void;
  onToggleSidebar?: () => void;
  currentTabTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenMovementModal,
  onToggleSidebar,
  currentTabTitle = 'Command Center',
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const updatePending = async () => {
      try {
        const count = await OfflineSyncManager.getPendingCount();
        setPendingCount(count);
      } catch {
        // fallback
      }
    };

    updatePending();

    const handleOnline = () => {
      setIsOnline(true);
      updatePending();
    };
    const handleOffline = () => {
      setIsOnline(false);
      updatePending();
    };
    const handleOutboxUpdate = () => {
      updatePending();
    };
    const handleSyncStart = () => {
      setIsSyncing(true);
      updatePending();
    };
    const handleSyncEnd = () => {
      setIsSyncing(false);
      updatePending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('iwms:outbox-updated', handleOutboxUpdate);
    window.addEventListener('iwms:sync-start', handleSyncStart);
    window.addEventListener('iwms:sync-end', handleSyncEnd);
    window.addEventListener('iwms:sync-complete', handleOutboxUpdate);

    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('iwms:outbox-updated', handleOutboxUpdate);
      window.removeEventListener('iwms:sync-start', handleSyncStart);
      window.removeEventListener('iwms:sync-end', handleSyncEnd);
      window.removeEventListener('iwms:sync-complete', handleOutboxUpdate);
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full px-4 sm:px-6 py-2.5 bg-white/90 dark:bg-[#090D14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                {currentTabTitle}
              </h1>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>Live WAL Ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search & Quick Movements */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMovementModal && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenMovementModal('IN')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Receive Inbound Stock (Press to log incoming units)"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Receive</span>
              </button>
              <button
                onClick={() => onOpenMovementModal('OUT')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141B2D] dark:hover:bg-[#1C253D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                title="Dispatch Outbound Stock (Pick and ship)"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span className="hidden xs:inline">Dispatch</span>
              </button>
              <button
                onClick={() => onOpenMovementModal('TRANSFER')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141B2D] dark:hover:bg-[#1C253D] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                title="Transfer Bin to Bin"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden xs:inline">Transfer</span>
              </button>
            </div>
          )}

          {/* Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#111726] dark:hover:bg-[#161E30] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs transition-colors"
            title="Search products and bins (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-500 dark:text-slate-400">Search SKUs, Bins...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-transparent text-[10px] text-slate-600 dark:text-slate-300 font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Theme Toggle, Sync Status & Shift Clock */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#111726] hover:bg-slate-200 dark:hover:bg-[#182035] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* LAN & Sync status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
              !isOnline
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : isSyncing
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                : pendingCount > 0
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
            }`}
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>{pendingCount} queued</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="hidden sm:inline">LAN Sync</span>
              </>
            )}
          </div>

          {/* Shift Clock */}
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums hidden sm:inline">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
