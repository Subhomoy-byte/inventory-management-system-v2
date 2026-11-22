import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Warehouse, Bin, Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { StatusChip } from '../components/common/StatusChip';
import {
  MapPin,
  Box,
  X,
  ArrowRight,
  Layers,
  ArrowDownRight,
  ArrowLeftRight,
} from 'lucide-react';

interface WarehouseMapPageProps {
  onOpenMovementModal: (type: 'IN' | 'OUT' | 'TRANSFER', product?: Product) => void;
}

export const WarehouseMapPage: React.FC<WarehouseMapPageProps> = ({ onOpenMovementModal }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

  const loadData = async () => {
    try {
      if (navigator.onLine) {
        const [wList, pList] = await Promise.all([
          api.getWarehouses().catch(() => OfflineSyncManager.getCachedWarehouses()),
          api.getProducts().catch(() => OfflineSyncManager.getCachedProducts()),
        ]);
        setWarehouses(wList);
        setProducts(pList);
        if (wList.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(wList[0].id);
        }
        await OfflineSyncManager.cacheWarehouses(wList);
        await OfflineSyncManager.cacheProducts(pList);
      } else {
        const cachedW = await OfflineSyncManager.getCachedWarehouses();
        const cachedP = await OfflineSyncManager.getCachedProducts();
        setWarehouses(cachedW);
        setProducts(cachedP);
        if (cachedW.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(cachedW[0].id);
        }
      }
    } catch {
      const cachedW = await OfflineSyncManager.getCachedWarehouses();
      const cachedP = await OfflineSyncManager.getCachedProducts();
      setWarehouses(cachedW);
      setProducts(cachedP);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  const getProductsInBin = (binCode: string) => {
    return products.filter((p) => p.binLocation === binCode);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-indigo-400" />
            2D Facility Bin Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Physical layout coordinates (Zones A/B/C &rarr; Storage Shelves) with live volumetric capacity.
          </p>
        </div>

        {/* Facility Selector */}
        {warehouses.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Facility:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="surface-input text-xs py-1.5 px-3 font-medium bg-[#141B2D]"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-[#111726] text-white">
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Floor Zones Grid */}
      {currentWarehouse ? (
        <div className="space-y-6">
          {currentWarehouse.zones.map((zone) => (
            <div key={zone.id} className="surface-card p-5">
              {/* Zone Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {zone.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {zone.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Primary Category: <span className="text-cyan-400 font-medium">{zone.categoryPreference}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{zone.bins.length} Shelves Active</span>
                </div>
              </div>

              {/* Bins Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {zone.bins.map((bin) => {
                  const binProducts = getProductsInBin(bin.code);
                  const currentUnits = binProducts.reduce((acc, p) => acc + p.quantity, 0);
                  const fillPercent = Math.min(
                    100,
                    Math.round((currentUnits / (bin.capacityQuantity || 100)) * 100)
                  );

                  let fillBg = 'bg-indigo-500';
                  let statusText = 'text-indigo-400';
                  if (fillPercent > 85) {
                    fillBg = 'bg-rose-500';
                    statusText = 'text-rose-400';
                  } else if (fillPercent > 50) {
                    fillBg = 'bg-amber-500';
                    statusText = 'text-amber-400';
                  }

                  const isSelected = selectedBin?.id === bin.id;

                  return (
                    <button
                      key={bin.id}
                      onClick={() => setSelectedBin(bin)}
                      className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-[#111726] border-white/[0.08] hover:border-white/20 hover:bg-[#141B2D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {bin.code}
                        </span>
                        <span className={`text-[10px] font-mono font-bold tabular-nums ${statusText}`}>
                          {fillPercent}%
                        </span>
                      </div>

                      {/* Capacity progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${fillBg}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="tabular-nums">{currentUnits}/{bin.capacityQuantity}u</span>
                        <span className="text-cyan-400 font-medium">{binProducts.length} items</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-card p-12 text-center text-slate-400 text-xs">
          Loading warehouse facility layout...
        </div>
      )}

      {/* Bin Detail Inspection Modal */}
      <AnimatePresence>
        {selectedBin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full max-w-lg surface-panel p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBin(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Shelf Inspection: {selectedBin.code}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Max Capacity: <span className="font-mono text-slate-200">{selectedBin.capacityQuantity} units</span> &bull; Max Weight: <span className="font-mono text-slate-200">{selectedBin.maxWeightKg} kg</span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Stored Inventory On Shelf ({getProductsInBin(selectedBin.code).length})
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {getProductsInBin(selectedBin.code).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      This shelf bin has no items assigned.
                    </div>
                  ) : (
                    getProductsInBin(selectedBin.code).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-[#141B2D] border border-white/[0.08] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                            SKU: {p.sku} &bull; {p.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white text-sm font-mono tabular-nums">
                            {p.quantity} units
                          </span>
                          <div className="mt-1">
                            <StatusChip status={p.status} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => setSelectedBin(null)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedBin(null);
                    onOpenMovementModal('IN');
                  }}
                  className="btn-primary text-xs py-2 px-3.5"
                >
                  <span>Receive Stock Here</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
