import React, { useState, useEffect } from 'react';
import type { SyncQueueItem, SyncConflict } from '../../types';
import { OfflineSyncManager } from '../../storage/sync';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { VectorGraphic } from '../common/VectorGraphic';
import {
  RefreshCw,
  AlertOctagon,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const ConflictReviewPanel: React.FC = () => {
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadQueue = async () => {
    const items = await OfflineSyncManager.getPendingItems();
    const confs = await OfflineSyncManager.getConflicts();
    setPendingItems(items);
    setConflicts(confs);
  };

  useEffect(() => {
    loadQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdate = () => loadQueue();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('iwms:outbox-updated', handleUpdate);
    window.addEventListener('iwms:sync-complete', handleUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('iwms:outbox-updated', handleUpdate);
      window.removeEventListener('iwms:sync-complete', handleUpdate);
    };
  }, []);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await OfflineSyncManager.drainQueue();
      await loadQueue();
    } finally {
      setSyncing(false);
    }
  };

  const handleDismissConflict = async (syncId: string) => {
    await OfflineSyncManager.clearConflict(syncId);
    await loadQueue();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <span>Offline Outbox &amp; LAN Auto-Sync Queue</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold">
              IDB REPLAY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Client-side IndexedDB mutations queue, duplicate-safe transaction synchronization, and variance resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Network Online' : 'Network Offline'}</span>
          </div>

          <button
            onClick={handleForceSync}
            disabled={syncing || !isOnline || pendingItems.length === 0}
            className="btn-primary text-xs py-2 px-3.5 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Force Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Card */}
      {conflicts.length > 0 && (
        <div className="border border-rose-500/40 bg-rose-500/10 p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-2 text-rose-600 dark:text-rose-400 font-heading font-extrabold text-base">
            <AlertOctagon className="w-5 h-5" />
            <span>Unresolved Inventory Deficit Conflicts ({conflicts.length})</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-white/70 font-mono mb-4">
            The following offline transactions resulted in stock deficits when synced against the master ledger:
          </p>

          <div className="space-y-2.5">
            {conflicts.map((c) => (
              <div
                key={c.syncId}
                className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-rose-500/30 flex items-center justify-between text-xs font-mono shadow-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {c.message}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-white/50 mt-1">
                    Product: <span className="text-cyan-600 dark:text-cyan-400">{c.productId}</span> &bull; Deficit: {c.deficitQuantity ?? 'N/A'} units &bull; Ref: {c.syncId}
                  </div>
                </div>

                <button
                  onClick={() => handleDismissConflict(c.syncId)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outbox Items List */}
      <div className="surface-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-500 dark:text-[#7C6CFF]" />
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              Queued Offline Transactions ({pendingItems.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-white/40">Stored in Local Browser Database (IndexedDB)</span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-white/50 space-y-4">
            <div className="flex justify-center">
              <VectorGraphic size={88} variant="radar" colorScheme="cyber" />
            </div>
            <div className="font-mono text-xs text-[#34D399] font-bold">
              Offline outbox is clean. All movements are synchronized with server!
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 uppercase tracking-wider bg-slate-50/75 dark:bg-white/[0.02] text-[10px]">
                  <th className="py-3 px-3">Sync ID</th>
                  <th className="py-3 px-3">Operation</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Shelf Locations</th>
                  <th className="py-3 px-3">Operator</th>
                  <th className="py-3 px-3">Queued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {pendingItems.map((item) => (
                  <tr key={item.syncId} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-indigo-600 dark:text-[#7C6CFF]">
                      {item.syncId.slice(0, 16)}...
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip status={item.movementType} />
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {item.productId}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-cyan-600 dark:text-[#22D3EE]">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-white/60">
                      {item.sourceBin || '-'} &rarr; {item.targetBin || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-white/80">
                      {item.operatorId}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-white/40 text-[11px]">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
