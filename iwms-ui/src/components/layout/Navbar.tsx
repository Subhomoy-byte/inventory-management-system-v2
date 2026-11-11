import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { OfflineSyncManager } from '../../storage/sync';
import { StatusChip } from '../common/StatusChip';
import { VectorGraphic } from '../common/VectorGraphic';
import {
  Sun,
  Moon,
  LogOut,
  Wifi,
  WifiOff,
  Boxes,
  Search,
  RefreshCw,
  Radio,
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3.5 backdrop-blur-2xl bg-[#060810]/85 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="icon-slot w-10 h-10 rounded-2xl bg-[#060810] flex items-center justify-center shadow-lg shadow-[#7C6CFF]/25 ring-1 ring-white/20 border-t border-white/30 p-1.5">
            <img src="/favicon.svg" alt="IWMS Pro Warehouse Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                IWMS Pro
              </span>

              {/* Pulsing live status badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-[#22D3EE] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                <span>Offline-first &bull; Live</span>
              </div>
            </div>
            <p className="text-[11px] text-white/50 hidden sm:block font-mono">
              Industrial Warehouse Terminal
            </p>
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-xs transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] font-mono"
        >
          <Search className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Quick command search or jump to screen...</span>
          <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.08] text-white font-mono text-[10px] shadow-sm border border-white/10 font-bold">
            Ctrl + K
          </kbd>
        </button>

        {/* Right Actions: Connection, Clock, Role & Logout */}
        <div className="flex items-center gap-3">
          {/* Micro Vector Graphic status indicator */}
          <div className="hidden lg:block opacity-75">
            <VectorGraphic size={28} variant="badge" colorScheme="cyber" />
          </div>

          {/* LAN Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border backdrop-blur-md transition-all ${
              !isOnline
                ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40 animate-pulse'
                : isSyncing
                ? 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/40'
                : pendingCount > 0
                ? 'bg-[#7C6CFF]/15 text-[#7C6CFF] border-[#7C6CFF]/40'
                : 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
            }`}
            title={
              !isOnline
                ? `Offline Mode (${pendingCount} queued action${pendingCount === 1 ? '' : 's'})`
                : isSyncing
                ? `Synchronizing ${pendingCount} offline action${pendingCount === 1 ? '' : 's'} with server...`
                : pendingCount > 0
                ? `${pendingCount} action${pendingCount === 1 ? '' : 's'} queued in local outbox`
                : 'Network Online (Connected)'
            }
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing{pendingCount > 0 ? ` (${pendingCount})` : ''}...</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#7C6CFF]" />
                <span>Online ({pendingCount} queued)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="hidden sm:inline">LAN Connected</span>
              </>
            )}
          </div>

          {/* Telemetry Clock */}
          <span className="text-xs font-mono text-white/50 hidden xl:inline">
            {time}
          </span>

          {/* User & Role Badge */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white font-mono">
                  {user.username}
                </span>
                <StatusChip status={user.role} />
              </div>

              <button
                onClick={logout}
                className="p-2.5 rounded-2xl bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/20 transition-all shadow-sm active:scale-95"
                title="Log Out of Warehouse Terminal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
