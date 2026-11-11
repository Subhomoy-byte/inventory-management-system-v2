import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Warehouse, Bin, Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { GlassCard } from '../components/common/GlassCard';
import { StatusChip } from '../components/common/StatusChip';
import { VectorGraphic } from '../components/common/VectorGraphic';
import {
  MapPin,
  Box,
  X,
  ArrowRight,
  Layers,
  Radio,
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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <MapPin className="w-7 h-7 text-[#7C6CFF]" />
              <span>2D Warehouse Floor Topology</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40 font-bold">
              6x4 MATRIX
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Coordinate layout (Facility &rarr; Zones A/B/C &rarr; Storage Shelves) with real-time occupancy.
          </p>
        </div>

        {/* Facility Selector */}
        {warehouses.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 font-mono">Facility:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="glass-input text-xs sm:text-sm py-2 font-mono"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-[#070912] text-white">
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Floor Grid */}
      {currentWarehouse ? (
        <div className="space-y-6">
          {currentWarehouse.zones.map((zone) => (
            <GlassCard key={zone.id} className="p-5 sm:p-6">
              {/* Zone Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C6CFF]/30 to-[#22D3EE]/30 border border-white/15 text-white flex items-center justify-center font-heading font-extrabold text-base">
                    {zone.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      {zone.name}
                    </h3>
                    <p className="text-xs text-white/50 font-mono mt-0.5">
                      Preference: <span className="font-bold text-[#22D3EE]">{zone.categoryPreference}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span>{zone.bins.length} Shelves Online</span>
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

                  // Colors: Violet (normal), Amber (low), Red (critical)
                  let fillBg = 'bg-[#7C6CFF]';
                  let ringColor = 'hover:ring-[#7C6CFF]/50';
                  let badgeColor = 'text-[#7C6CFF]';
                  if (fillPercent > 85) {
                    fillBg = 'bg-[#F87171]';
                    ringColor = 'hover:ring-[#F87171]/50';
                    badgeColor = 'text-[#F87171]';
                  } else if (fillPercent > 50) {
                    fillBg = 'bg-[#FBBF24]';
                    ringColor = 'hover:ring-[#FBBF24]/50';
                    badgeColor = 'text-[#FBBF24]';
                  }

                  const isSelected = selectedBin?.id === bin.id;

                  return (
                    <button
                      key={bin.id}
                      onClick={() => setSelectedBin(bin)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:ring-2 ${ringColor} ${
                        isSelected
                          ? 'bg-[#7C6CFF]/20 border-[#7C6CFF] ring-2 ring-[#7C6CFF]/50 shadow-lg shadow-[#7C6CFF]/20'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {bin.code}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${badgeColor}`}>
                          {fillPercent}%
                        </span>
                      </div>

                      {/* Fill Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${fillBg}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                        <span>{currentUnits}/{bin.capacityQuantity}u</span>
                        <span className="font-bold text-[#22D3EE]">{binProducts.length} items</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="py-12 text-center text-white/40 font-mono text-xs">
          Loading floor coordinates...
        </GlassCard>
      )}

      {/* Bin Detail Inspection Modal / Drawer */}
      <AnimatePresence>
        {selectedBin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-lg glass-panel p-6 sm:p-7 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedBin(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#7C6CFF]/20 border border-[#7C6CFF]/40 text-[#7C6CFF]">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    Shelf Inspection: {selectedBin.code}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    Max Capacity: {selectedBin.capacityQuantity} units &bull; Weight Cap: {selectedBin.maxWeightKg} kg
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 mb-3">
                  Products Stored On This Shelf:
                </h4>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {getProductsInBin(selectedBin.code).length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-white/40 bg-white/[0.02] border border-white/5 rounded-2xl">
                      This storage shelf is currently empty.
                    </div>
                  ) : (
                    getProductsInBin(selectedBin.code).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <div className="font-bold text-white font-sans text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#7C6CFF] mt-0.5">
                            SKU: {p.sku} &bull; {p.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-white text-sm">
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

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedBin(null)}
                  className="glass-button-secondary text-xs py-2 px-3.5"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedBin(null);
                    onOpenMovementModal('IN');
                  }}
                  className="glass-button-primary text-xs py-2 px-3.5"
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
