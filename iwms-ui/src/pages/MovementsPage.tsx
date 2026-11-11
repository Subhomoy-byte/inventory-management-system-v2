import React, { useState, useEffect } from 'react';
import type { StockMovement, Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { GlassCard } from '../components/common/GlassCard';
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <History className="w-7 h-7 text-[#7C6CFF]" />
              <span>Transaction Ledger & Time-Travel</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40 font-bold">
              TREEMAP.HEADMAP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Immutable transaction record with 1-click LIFO undo and scrubbable historical state replay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleUndo}
            disabled={undoLoading || movements.length === 0}
            className="glass-button-secondary text-xs sm:text-sm py-2 px-3.5 hover:text-[#FBBF24] disabled:opacity-40"
            title="Reverses the most recent inventory transaction"
          >
            <RotateCcw className={`w-4 h-4 ${undoLoading ? 'animate-spin' : ''}`} />
            <span>Undo Last Action</span>
          </button>
        </div>
      </div>

      {/* Undo Alert Notification */}
      {undoResult && (
        <div className="p-3.5 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24] text-xs font-mono font-semibold flex items-center justify-between">
          <span>{undoResult}</span>
          <button onClick={() => setUndoResult(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Time-Travel Interactive Slider Card */}
      <GlassCard className="p-5 sm:p-6 border-[#7C6CFF]/30 bg-gradient-to-r from-[#7C6CFF]/10 via-[#22D3EE]/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[#7C6CFF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <span>Time-Travel Historical Replay</span>
                {isTimeTraveling && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 animate-pulse font-bold">
                    HISTORICAL REPLAY ACTIVE
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Scrub the immutable timeline to reconstruct inventory quantities at any historical instant.
              </p>
            </div>
          </div>

          {isTimeTraveling && (
            <button
              onClick={() => handleQueryAsOf(0)}
              className="glass-button-secondary text-xs py-1.5 px-3 self-start md:self-auto font-mono"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Reset to Present</span>
            </button>
          )}
        </div>

        {/* Slider Controls */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-white/60 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7C6CFF]" />
              {timeTravelMinutesAgo === 0 ? 'Present (Live Floor Stock)' : timeTravelDate.toLocaleString()}
            </span>
            <span className="font-bold text-[#22D3EE]">
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
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7C6CFF]"
          />

          <div className="flex justify-between text-[10px] text-white/40 font-mono">
            <span>Live (0m)</span>
            <span>-1 Hour</span>
            <span>-6 Hours</span>
            <span>-12 Hours</span>
            <span>-24 Hours (1 Day)</span>
          </div>
        </div>

        {/* Historical Stock Results Preview */}
        {isTimeTraveling && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Reconstructed Snapshot at {timeTravelDate.toLocaleTimeString()}</span>
            </h4>

            {historyLoading ? (
              <div className="py-6 text-center text-xs text-white/40 font-mono">
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
                      className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono"
                    >
                      <div className="text-[10px] font-bold text-[#7C6CFF] truncate">{p.sku}</div>
                      <div className="font-bold text-white truncate font-sans text-xs mt-0.5">{p.name}</div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-white">{historicQty}u</span>
                        {delta !== 0 && (
                          <span className={delta > 0 ? 'text-[#34D399] font-bold' : 'text-[#F87171] font-bold'}>
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
      </GlassCard>

      {/* Movement Ledger Table */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#7C6CFF]" />
              <span>Verified Ledger Log</span>
            </h3>
            <p className="text-xs text-white/50 font-mono mt-0.5">
              Total {movements.length} recorded inventory mutations in append-only WAL
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-mono">
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
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedType === t.id
                    ? 'bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] text-[#070912] font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
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
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider bg-white/[0.02] text-[10px]">
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
            <tbody className="divide-y divide-white/5">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-white/40">
                    <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <span className="text-xs font-mono">No inventory transactions match the filter criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.movementId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-white/40">
                      {m.movementId.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusChip status={m.movementType} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {m.productId}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#22D3EE] text-sm">
                      {m.quantity} units
                    </td>
                    <td className="py-3.5 px-4 text-white/70">
                      {m.sourceBin || 'Receiving Dock'} &rarr; {m.targetBin || 'Shipping Dock'}
                    </td>
                    <td className="py-3.5 px-4 text-white/60 max-w-xs truncate text-[11px]">
                      {m.reason || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-white/90 font-bold">
                      {m.operatorId}
                    </td>
                    <td className="py-3.5 px-4 text-white/40 text-[11px]">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
