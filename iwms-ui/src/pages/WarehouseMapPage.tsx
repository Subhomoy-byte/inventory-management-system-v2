import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Warehouse, Bin, Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { StatusChip } from '../components/common/StatusChip';
import { InteractiveShelf3D } from '../components/warehouse/InteractiveShelf3D';
import { useTheme } from '../context/ThemeContext';
import {
  MapPin,
  Box,
  X,
  ArrowRight,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Sparkles,
  Grid3X3,
  Columns,
} from 'lucide-react';

interface WarehouseMapPageProps {
  onOpenMovementModal: (type: 'IN' | 'OUT' | 'TRANSFER', product?: Product) => void;
}

export const WarehouseMapPage: React.FC<WarehouseMapPageProps> = ({ onOpenMovementModal }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'split'>('3d');

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

  const allWarehouseBins = React.useMemo(() => {
    if (!currentWarehouse) return [];
    return currentWarehouse.zones.flatMap((z) => z.bins);
  }, [currentWarehouse]);

  const getProductsInBin = (binCode: string) => {
    return products.filter((p) => p.binLocation === binCode);
  };

  const handleSelectBinCode = (binCode: string) => {
    const foundBin = allWarehouseBins.find((b) => b.code === binCode);
    if (foundBin) {
      setSelectedBin(foundBin);
    } else {
      // Create ad-hoc bin representation for inspection
      setSelectedBin({
        id: binCode.toLowerCase(),
        zoneId: 'Zone B',
        code: binCode,
        capacityQuantity: 100,
        maxWeightKg: 500,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                Facility Digital Twin &amp; Floor Topology
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Physical rack coordinates with live 3D gliding inspection and volumetric density telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Facility Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 3D / 2D / Split View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#111726] border border-slate-200 dark:border-white/10 shadow-xs">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Smart Shelf</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dual Spatial</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>2D Matrix</span>
            </button>
          </div>

          {/* Facility Selector */}
          {warehouses.length > 1 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="surface-input text-xs py-1.5 px-3 font-medium cursor-pointer"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id} className="bg-white dark:bg-[#111726] text-slate-900 dark:text-white">
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3D Smart Shelf Section (When 3D or Split is active) */}
      {(viewMode === '3d' || viewMode === 'split') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Interactive Smart Rack Glider &bull; Move mouse cursor to tilt &amp; pan in real-time</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Pointer Light &bull; Hover Glow Active
            </div>
          </div>

          <InteractiveShelf3D
            bins={allWarehouseBins}
            products={products}
            onSelectBin={handleSelectBinCode}
            className={viewMode === 'split' ? 'h-[440px]' : 'h-[540px] sm:h-[600px]'}
          />
        </div>
      )}

      {/* 2D Floor Zones Grid (When 2D or Split is active) */}
      {(viewMode === '2d' || viewMode === 'split') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-indigo-500" />
              2D Facility Matrix &amp; Capacity Utilization
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {allWarehouseBins.length} Storage Bins Mapped
            </span>
          </div>

          {currentWarehouse ? (
            <div className="space-y-6">
              {currentWarehouse.zones.map((zone) => (
                <div key={zone.id} className="surface-card p-5">
                  {/* Zone Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {zone.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {zone.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Primary Category: <span className="text-cyan-600 dark:text-cyan-400 font-medium">{zone.categoryPreference}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                      let statusText = 'text-indigo-600 dark:text-indigo-400';
                      if (fillPercent > 85) {
                        fillBg = 'bg-rose-500';
                        statusText = 'text-rose-600 dark:text-rose-400';
                      } else if (fillPercent > 50) {
                        fillBg = 'bg-amber-500';
                        statusText = 'text-amber-600 dark:text-amber-400';
                      }

                      const isSelected = selectedBin?.id === bin.id;

                      return (
                        <button
                          key={bin.id}
                          onClick={() => setSelectedBin(bin)}
                          className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-500 ring-1 ring-indigo-500/40 shadow-sm'
                              : 'bg-slate-50 dark:bg-[#111726] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-[#141B2D]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {bin.code}
                            </span>
                            <span className={`text-[10px] font-mono font-bold tabular-nums ${statusText}`}>
                              {fillPercent}%
                            </span>
                          </div>

                          {/* Capacity progress bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${fillBg}`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span className="tabular-nums">{currentUnits}/{bin.capacityQuantity}u</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-medium">{binProducts.length} items</span>
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
        </div>
      )}

      {/* Bin Detail Inspection Modal */}
      <AnimatePresence>
        {selectedBin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full max-w-lg surface-panel p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBin(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Shelf Inspection: {selectedBin.code}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Max Capacity: <span className="font-mono text-slate-700 dark:text-slate-200">{selectedBin.capacityQuantity} units</span> &bull; Max Weight: <span className="font-mono text-slate-700 dark:text-slate-200">{selectedBin.maxWeightKg} kg</span>
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Stored Inventory On Shelf ({getProductsInBin(selectedBin.code).length})
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {getProductsInBin(selectedBin.code).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl">
                      This shelf bin has no items assigned. You can receive inbound stock directly into this slot.
                    </div>
                  ) : (
                    getProductsInBin(selectedBin.code).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#141B2D] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                            SKU: {p.sku} &bull; {p.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white text-sm font-mono tabular-nums">
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

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const firstProd = getProductsInBin(selectedBin.code)[0];
                      setSelectedBin(null);
                      onOpenMovementModal('OUT', firstProd);
                    }}
                    disabled={getProductsInBin(selectedBin.code).length === 0}
                    className="btn-secondary text-xs py-2 px-3 disabled:opacity-40"
                    title="Dispatch from this bin"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                    <span>Dispatch</span>
                  </button>
                  <button
                    onClick={() => {
                      const firstProd = getProductsInBin(selectedBin.code)[0];
                      setSelectedBin(null);
                      onOpenMovementModal('TRANSFER', firstProd);
                    }}
                    disabled={getProductsInBin(selectedBin.code).length === 0}
                    className="btn-secondary text-xs py-2 px-3 disabled:opacity-40"
                    title="Transfer to another bin"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Transfer</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBin(null)}
                    className="btn-secondary text-xs py-2 px-3.5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const firstProd = getProductsInBin(selectedBin.code)[0];
                      setSelectedBin(null);
                      onOpenMovementModal('IN', firstProd);
                    }}
                    className="btn-primary text-xs py-2 px-3.5"
                  >
                    <span>Receive Here</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
