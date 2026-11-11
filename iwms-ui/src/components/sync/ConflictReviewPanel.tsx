import React, { useState, useEffect } from 'react';
import type { SyncQueueItem, SyncConflict } from '../../types';
import { OfflineSyncManager } from '../../storage/sync';
import { GlassCard } from '../common/GlassCard';
import { StatusChip } from '../common/StatusChip';
import { VectorGraphic } from '../common/VectorGraphic';
import {
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#7C6CFF]" />
              <span>Offline Outbox & LAN Auto-Sync Queue</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-bold">
              IDB REPLAY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Client-side IndexedDB mutations queue, duplicate-safe transaction synchronization, and variance resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
              isOnline
                ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
                : 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Network Online' : 'Network Offline'}</span>
          </div>

          <button
            onClick={handleForceSync}
            disabled={syncing || !isOnline || pendingItems.length === 0}
            className="glass-button-primary text-xs sm:text-sm py-2 px-3.5 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Force Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Card */}
      {conflicts.length > 0 && (
        <GlassCard className="border-[#F87171]/40 bg-[#F87171]/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-2 text-[#F87171] font-heading font-extrabold text-base">
            <AlertOctagon className="w-5 h-5" />
            <span>Unresolved Inventory Deficit Conflicts ({conflicts.length})</span>
          </div>

          <p className="text-xs text-white/70 font-mono mb-4">
            The following offline transactions resulted in stock deficits when synced against the master ledger:
          </p>

          <div className="space-y-2.5">
            {conflicts.map((c) => (
              <div
                key={c.syncId}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-[#F87171]/30 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white">
                    {c.message}
                  </div>
                  <div className="text-[11px] text-white/50 mt-1">
                    Product: <span className="text-[#22D3EE]">{c.productId}</span> &bull; Deficit: {c.deficitQuantity ?? 'N/A'} units &bull; Ref: {c.syncId}
                  </div>
                </div>

                <button
                  onClick={() => handleDismissConflict(c.syncId)}
                  className="px-3 py-1.5 rounded-xl bg-[#F87171]/20 hover:bg-[#F87171]/30 text-[#F87171] text-xs font-bold transition-all"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Outbox Items List */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#7C6CFF]" />
            <h3 className="font-heading text-base font-bold text-white">
              Queued Offline Transactions ({pendingItems.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-white/40">Stored in Local Browser Database (IndexedDB)</span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-12 text-center text-white/50 space-y-4">
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
                <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider bg-white/[0.02] text-[10px]">
                  <th className="py-3 px-3">Sync ID</th>
                  <th className="py-3 px-3">Operation</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Shelf Locations</th>
                  <th className="py-3 px-3">Operator</th>
                  <th className="py-3 px-3">Queued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingItems.map((item) => (
                  <tr key={item.syncId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-[#7C6CFF]">
                      {item.syncId.slice(0, 16)}...
                    </td>
                    <td className="py-3 px-3">
                      <StatusChip status={item.movementType} />
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {item.productId}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-[#22D3EE]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-white/60">
                      {item.sourceBin || '-'} &rarr; {item.targetBin || '-'}
                    </td>
                    <td className="py-3 px-3 text-white/80">
                      {item.operatorId}
                    </td>
                    <td className="py-3 px-3 text-white/40 text-[11px]">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
