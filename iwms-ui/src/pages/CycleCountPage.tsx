import React, { useState } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { GlassCard } from '../components/common/GlassCard';
import { VectorGraphic } from '../components/common/VectorGraphic';
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Save,
  Check,
} from 'lucide-react';

interface CycleCountPageProps {
  products: Product[];
  onRefreshCatalog: () => void;
}

export const CycleCountPage: React.FC<CycleCountPageProps> = ({
  products,
  onRefreshCatalog,
}) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [celebrationId, setCelebrationId] = useState<string | null>(null);

  const handleCountChange = (productId: string, val: number) => {
    setCounts((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleReconcile = async (p: Product) => {
    const countedVal = counts[p.id];
    if (countedVal === undefined) return;

    const diff = countedVal - p.quantity;
    if (diff === 0) return;

    setReconcilingId(p.id);
    setSuccessNote(null);
    try {
      if (diff > 0) {
        await api.stockIn({
          productId: p.id,
          quantity: diff,
          reason: `Cycle count surplus adjustment (+${diff})`,
        }).catch(async () => {
          await OfflineSyncManager.queueMovement({
            productId: p.id,
            movementType: 'IN',
            quantity: diff,
            reason: `Cycle count surplus adjustment (+${diff})`,
            operatorId: 'auditor',
            timestamp: new Date().toISOString(),
          });
        });
      } else {
        await api.stockOut({
          productId: p.id,
          quantity: Math.abs(diff),
          reason: `Cycle count deficit adjustment (${diff})`,
        }).catch(async () => {
          await OfflineSyncManager.queueMovement({
            productId: p.id,
            movementType: 'OUT',
            quantity: Math.abs(diff),
            reason: `Cycle count deficit adjustment (${diff})`,
            operatorId: 'auditor',
            timestamp: new Date().toISOString(),
          });
        });
      }

      setCelebrationId(p.id);
      setTimeout(() => setCelebrationId(null), 3000);
      setSuccessNote(`Reconciled ${p.sku} to ${countedVal} units in append-only WAL`);
      onRefreshCatalog();
    } catch (err: any) {
      alert('Adjustment failed: ' + err.message);
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-[#7C6CFF]" />
              <span>Floor Stock Verification & Cycle Count</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 font-bold">
              VARIANCE AUDIT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Physical stock count audits, discrepancy calculations, and 1-click inventory balance reconciliation.
          </p>
        </div>

        <button
          onClick={() => {
            setCounts({});
            setSuccessNote(null);
          }}
          className="glass-button-secondary text-xs sm:text-sm py-2 px-3.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Reset Counts</span>
        </button>
      </div>

      {/* Success Notification with optional Celebration Burst */}
      {successNote && (
        <div className="relative p-4 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-xs font-mono font-semibold flex items-center justify-between overflow-hidden">
          {celebrationId && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <VectorGraphic size={80} variant="burst" colorScheme="emerald" />
            </div>
          )}
          <div className="flex items-center gap-2 relative z-10">
            <CheckCircle className="w-4 h-4 text-[#34D399]" />
            <span>{successNote}</span>
          </div>
          <button onClick={() => setSuccessNote(null)} className="text-xs font-bold hover:underline relative z-10">
            Dismiss
          </button>
        </div>
      )}

      {/* Cycle Count Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider bg-white/[0.02] text-[10px]">
                <th className="py-3.5 px-5">Shelf Bin</th>
                <th className="py-3.5 px-5">Product SKU & Name</th>
                <th className="py-3.5 px-5">Recorded Stock</th>
                <th className="py-3.5 px-5 w-44">Physical Count</th>
                <th className="py-3.5 px-5">Discrepancy</th>
                <th className="py-3.5 px-5 text-right">Adjustment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.slice(0, 20).map((p) => {
                const physicalCount = counts[p.id] !== undefined ? counts[p.id] : p.quantity;
                const variance = physicalCount - p.quantity;

                return (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#22D3EE] text-xs">
                      {p.binLocation}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-heading font-bold text-sm text-white">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#7C6CFF] mt-0.5">
                        SKU: {p.sku} &bull; {p.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-extrabold text-white text-sm">
                      {p.quantity} units
                    </td>
                    <td className="py-3.5 px-5">
                      <input
                        type="number"
                        min="0"
                        value={physicalCount}
                        onChange={(e) => handleCountChange(p.id, parseInt(e.target.value) || 0)}
                        className="glass-input py-1.5 px-3 font-mono text-xs font-bold w-28"
                      />
                    </td>
                    <td className="py-3.5 px-5">
                      {variance === 0 ? (
                        <span className="text-[#34D399] font-bold font-mono text-xs flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Balanced (0)</span>
                        </span>
                      ) : variance > 0 ? (
                        <span className="text-[#22D3EE] font-bold font-mono text-xs">
                          +{variance} (Surplus)
                        </span>
                      ) : (
                        <span className="text-[#F87171] font-bold font-mono text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{variance} (Deficit)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {variance !== 0 ? (
                        <button
                          onClick={() => handleReconcile(p)}
                          disabled={reconcilingId === p.id}
                          className="glass-button-primary text-xs py-1.5 px-3"
                        >
                          {reconcilingId === p.id ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-[#070912] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              <span>Reconcile</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[#34D399] font-bold text-xs px-2.5 py-1 rounded-lg bg-[#34D399]/10 border border-[#34D399]/20">
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
