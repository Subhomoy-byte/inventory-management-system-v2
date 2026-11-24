import React, { useState, useEffect } from 'react';
import type { StockMovement, Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { StatusChip } from '../components/common/StatusChip';
import {
  History,
  RotateCcw,
  Clock,
  RotateCw,
  Sliders,
  Calendar,
  Boxes,
} from 'lucide-react';

export const MovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [undoLoading, setUndoLoading] = useState<boolean>(false);
  const [undoResult, setUndoResult] = useState<string | null>(null);

  // Time-Travel state
  const [isTimeTraveling, setIsTimeTraveling] = useState<boolean>(false);
  const [timeTravelMinutesAgo, setTimeTravelMinutesAgo] = useState<number>(0);
  const [historicalStock, setHistoricalStock] = useState<Record<string, number> | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const loadMovements = async () => {
    try {
      const [mList, pList] = await Promise.all([
        api.getStockMovements().catch(() => []),
        api.getProducts().catch(() => OfflineSyncManager.getCachedProducts()),
      ]);
      setMovements(mList.reverse());
      setProducts(pList);
    } catch (err) {
      console.warn('Failed to load movements:', err);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleUndo = async () => {
    setUndoLoading(true);
    setUndoResult(null);
    try {
      const undone = await api.undoLastMovement();
      setUndoResult(`Undone movement: [${undone.movementType}] ${undone.quantity} units of ${undone.productId}`);
      await loadMovements();
    } catch (err: any) {
      setUndoResult(`Undo Error: ${err.message}`);
    } finally {
      setUndoLoading(false);
    }
  };

  // Execute time-travel query
  const handleQueryAsOf = async (minutesAgo: number) => {
    setTimeTravelMinutesAgo(minutesAgo);
    if (minutesAgo === 0) {
      setIsTimeTraveling(false);
      setHistoricalStock(null);
      return;
    }

    setIsTimeTraveling(true);
    setHistoryLoading(true);
    try {
      const targetTime = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
      const stockMap = await api.getStockAsOf(targetTime);
      setHistoricalStock(stockMap);
    } catch (err: any) {
      console.warn('Time-travel query error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredMovements = movements.filter((m) => {
    if (selectedType === 'ALL') return true;
    return m.movementType === selectedType;
  });

  const timeTravelDate = new Date(Date.now() - timeTravelMinutesAgo * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <History className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <span>Transaction Ledger &amp; Time-Travel</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold">
              TREEMAP.HEADMAP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Immutable transaction record with 1-click LIFO undo and scrubbable historical state replay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleUndo}
            disabled={undoLoading || movements.length === 0}
            className="btn-secondary text-xs py-2 px-3.5 hover:text-amber-500 disabled:opacity-40"
            title="Reverses the most recent inventory transaction"
          >
            <RotateCcw className={`w-4 h-4 ${undoLoading ? 'animate-spin' : ''}`} />
            <span>Undo Last Action</span>
          </button>
        </div>
      </div>

      {/* Undo Alert Notification */}
      {undoResult && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold flex items-center justify-between">
          <span>{undoResult}</span>
          <button onClick={() => setUndoResult(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Time-Travel Interactive Slider Card */}
      <div className="surface-card p-5 sm:p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Time-Travel Historical Replay</span>
                {isTimeTraveling && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 animate-pulse font-bold">
                    HISTORICAL REPLAY ACTIVE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Scrub the immutable timeline to reconstruct inventory quantities at any historical instant.
              </p>
            </div>
          </div>

          {isTimeTraveling && (
            <button
              onClick={() => handleQueryAsOf(0)}
              className="btn-secondary text-xs py-1.5 px-3 self-start md:self-auto font-mono"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-500" />
              <span>Reset to Present</span>
            </button>
          )}
        </div>

        {/* Slider Controls */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              {timeTravelMinutesAgo === 0 ? 'Present (Live Floor Stock)' : timeTravelDate.toLocaleString()}
            </span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {timeTravelMinutesAgo === 0 ? 'Live 0m' : `-${timeTravelMinutesAgo} mins ago`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1440"
            step="15"
            value={timeTravelMinutesAgo}
            onChange={(e) => handleQueryAsOf(parseInt(e.target.value) || 0)}
            className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>Live (0m)</span>
            <span>-1 Hour</span>
            <span>-6 Hours</span>
            <span>-12 Hours</span>
            <span>-24 Hours (1 Day)</span>
          </div>
        </div>

        {/* Historical Stock Results Preview */}
        {isTimeTraveling && (
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Reconstructed Snapshot at {timeTravelDate.toLocaleTimeString()}</span>
            </h4>

            {historyLoading ? (
              <div className="py-6 text-center text-xs text-slate-400 font-mono">
                Reconstructing state via TreeMap.headMap()...
              </div>
            ) : historicalStock ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {products.slice(0, 18).map((p) => {
                  const historicQty = historicalStock[p.id] ?? 0;
                  const delta = p.quantity - historicQty;

                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono shadow-xs"
                    >
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate">{p.sku}</div>
                      <div className="font-bold text-slate-900 dark:text-white truncate font-sans text-xs mt-0.5">{p.name}</div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-slate-800 dark:text-white">{historicQty}u</span>
                        {delta !== 0 && (
                          <span className={delta > 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Movement Ledger Table */}
      <div className="surface-card p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Verified Ledger Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Total {movements.length} recorded inventory mutations in append-only WAL
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'IN', label: 'Stock In' },
              { id: 'OUT', label: 'Stock Out' },
              { id: 'TRANSFER', label: 'Transfer' },
              { id: 'ADJUST', label: 'Audit' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === t.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/75 dark:bg-white/[0.02] text-[10px]">
                <th className="py-3 px-4">TX ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Product Code / ID</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <span className="text-xs font-mono">No inventory transactions match the filter criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.movementId} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {m.movementId.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusChip status={m.movementType} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {m.productId}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-cyan-400 text-sm">
                      {m.quantity} units
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {m.sourceBin || 'Receiving Dock'} &rarr; {m.targetBin || 'Shipping Dock'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                      {m.reason || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-bold">
                      {m.operatorId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
