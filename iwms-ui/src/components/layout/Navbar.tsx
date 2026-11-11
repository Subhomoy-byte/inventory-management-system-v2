import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { OfflineSyncManager } from '../../storage/sync';
import { StatusChip } from '../common/StatusChip';
import {
  Sun,
  Moon,
  LogOut,
  Wifi,
  WifiOff,
  Boxes,
  Search,
  RefreshCw,
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
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

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
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
    <header className="sticky top-0 z-30 w-full px-6 py-3.5 backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 border-b border-white/20 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/20 dark:ring-white/10">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                IWMS Pro
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Inventory & Warehouse Management System
            </p>
          </div>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 text-sm transition-all shadow-inner font-medium"
        >
          <Search className="w-4 h-4 text-indigo-500" />
          <span>Quick search items, screens, or commands...</span>
          <kbd className="px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80 font-mono text-xs shadow-sm border border-slate-300/50 dark:border-slate-700/50 font-bold">
            Ctrl + K
          </kbd>
        </button>

        {/* Right Actions: Connection, Clock, Theme, User Role & Logout */}
        <div className="flex items-center gap-3">
          {/* LAN Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all ${
              !isOnline
                ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/40 animate-pulse'
                : isSyncing
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40'
                : pendingCount > 0
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}
            title={
              !isOnline
                ? `Offline Mode (${pendingCount} queued action${pendingCount === 1 ? '' : 's'})`
                : isSyncing
                ? `Synchronizing ${pendingCount} offline action${pendingCount === 1 ? '' : 's'} with server...`
                : pendingCount > 0
                ? `${pendingCount} action${pendingCount === 1 ? '' : 's'} queued in outbox`
                : 'Network Online (Connected)'
            }
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing{pendingCount > 0 ? ` (${pendingCount})` : ''}...</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                <span>Online ({pendingCount} queued)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Network Online</span>
              </>
            )}
          </div>

          {/* Clock */}
          <span className="text-sm font-mono font-semibold text-slate-500 dark:text-slate-400 hidden lg:inline">
            {time}
          </span>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 transition-all shadow-sm active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Current User & Role */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60 dark:border-slate-800">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user.username}
                </span>
                <StatusChip status={user.role} />
              </div>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all shadow-sm active:scale-95"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
