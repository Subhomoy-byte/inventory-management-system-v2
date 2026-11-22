import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OfflineSyncManager } from '../../storage/sync';
import { StatusChip } from '../common/StatusChip';
import {
  LogOut,
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Menu,
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
  const { user, logout } = useAuth();
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
    <header className="sticky top-0 z-20 w-full px-4 sm:px-6 py-2.5 bg-[#090D14]/90 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-base sm:text-lg text-white tracking-tight">
                {currentTabTitle}
              </h1>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                title="Receive Inbound Stock"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Receive</span>
              </button>
              <button
                onClick={() => onOpenMovementModal('OUT')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141B2D] hover:bg-[#1C253D] text-slate-200 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                title="Dispatch Outbound Stock"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline">Dispatch</span>
              </button>
              <button
                onClick={() => onOpenMovementModal('TRANSFER')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141B2D] hover:bg-[#1C253D] text-slate-200 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                title="Transfer Bin to Bin"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">Transfer</span>
              </button>
            </div>
          )}

          {/* Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111726] hover:bg-[#161E30] border border-white/10 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Search products and bins (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Search SKUs, Bins...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-slate-300 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Sync Status & Shift Clock */}
        <div className="flex items-center gap-2.5">
          {/* LAN & Sync status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${
              !isOnline
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : isSyncing
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : pendingCount > 0
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>{pendingCount} queued</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">LAN Sync</span>
              </>
            )}
          </div>

          {/* Shift Clock */}
          <span className="text-xs font-mono text-slate-400 tabular-nums hidden sm:inline">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
