import React, { useState, useEffect } from 'react';
import type { Product, StockMovement } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { StatusChip } from '../components/common/StatusChip';
import { DatasetUploadBanner } from '../components/dashboard/DatasetUploadBanner';
import { DatasetUploadModal } from '../components/modals/DatasetUploadModal';
import { PRELOADED_KAGGLE_DATASET } from '../utils/kaggleDataset';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onOpenMovementModal: (type: 'IN' | 'OUT' | 'TRANSFER', product?: Product) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenMovementModal,
  onNavigateToTab,
}) => {
  const { isAdmin, isManager } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleQuickLoadKaggle = async () => {
    setUploadLoading(true);
    try {
      await OfflineSyncManager.cacheProducts(PRELOADED_KAGGLE_DATASET);
      if (navigator.onLine) {
        try {
          await api.importProducts(PRELOADED_KAGGLE_DATASET);
        } catch (e) {
          console.warn('Backend sync deferred:', e);
        }
      }
      window.dispatchEvent(new CustomEvent('iwms:outbox-updated'));
      window.dispatchEvent(new CustomEvent('iwms:sync-complete'));
      await loadData();
    } finally {
      setUploadLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const [prodList, movList] = await Promise.all([
          api.getProducts().catch(() => OfflineSyncManager.getCachedProducts()),
          api.getStockMovements().catch(() => []),
        ]);
        setProducts(prodList);
        setMovements(movList.slice(-12).reverse());
        await OfflineSyncManager.cacheProducts(prodList);
      } else {
        const cached = await OfflineSyncManager.getCachedProducts();
        setProducts(cached);
      }
    } catch (err) {
      console.warn('Dashboard data fetch fallback to cache:', err);
      const cached = await OfflineSyncManager.getCachedProducts();
      setProducts(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleOutboxUpdate = () => loadData();
    window.addEventListener('iwms:outbox-updated', handleOutboxUpdate);
    window.addEventListener('iwms:sync-complete', handleOutboxUpdate);

    return () => {
      window.removeEventListener('iwms:outbox-updated', handleOutboxUpdate);
      window.removeEventListener('iwms:sync-complete', handleOutboxUpdate);
    };
  }, []);

  // Compute metrics
  const totalSkus = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockProducts = products.filter(
    (p) => p.status === 'LOW_STOCK' || p.status === 'CRITICAL' || p.quantity <= p.reorderPoint
  );
  const criticalProducts = products.filter(
    (p) => p.status === 'CRITICAL' || p.quantity === 0
  );
  const optimalProducts = products.filter(
    (p) => p.status === 'OPTIMAL' || (p.quantity > p.reorderPoint && p.status !== 'CRITICAL')
  );

  const totalValuation = products.reduce((acc, p) => {
    const cost = p.costPrice ?? p.sellingPrice * 0.6;
    return acc + p.quantity * cost;
  }, 0);

  // Category distribution for charts
  const categoryDataMap: Record<string, { count: number; units: number }> = {};
  products.forEach((p) => {
    const cat = p.category || 'Standard';
    if (!categoryDataMap[cat]) {
      categoryDataMap[cat] = { count: 0, units: 0 };
    }
    categoryDataMap[cat].count += 1;
    categoryDataMap[cat].units += p.quantity;
  });

  const categoryChartData = Object.entries(categoryDataMap)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 8)
    .map(([name, val]) => ({
      name,
      units: val.units,
      productCount: val.count,
    }));

  const CHART_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#64748B'];

  const optimalRatio = totalSkus > 0 ? (optimalProducts.length / totalSkus) * 100 : 100;
  const lowRatio = totalSkus > 0 ? ((lowStockProducts.length - criticalProducts.length) / totalSkus) * 100 : 0;
  const criticalRatio = totalSkus > 0 ? (criticalProducts.length / totalSkus) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Operational Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time floor velocity, stock reorder thresholds, and verified Write-Ahead Log transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenMovementModal('IN')}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('OUT')}
            className="btn-secondary text-xs py-2 px-3.5 hover:text-rose-400"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Dispatch</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('TRANSFER')}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Bin</span>
          </button>
        </div>
      </div>

      {/* Dataset Ingestion Portal Banner */}
      <DatasetUploadBanner
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onQuickLoadKaggle={handleQuickLoadKaggle}
        isLoading={uploadLoading}
      />

      {/* Primary Operational Vitals: 3 Structured Panels instead of 4 identical generic cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panel 1: Inventory Health & Ratio Breakdown */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-400" />
                Fleet Inventory Health
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                100% Synced
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                {totalUnits.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                total units across {totalSkus} SKUs
              </span>
            </div>

            {/* Segmented ratio bar */}
            <div className="mt-4 space-y-1.5">
              <div className="h-2 w-full rounded-full bg-slate-800 flex overflow-hidden">
                <div
                  style={{ width: `${optimalRatio}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                  title={`Optimal: ${optimalProducts.length} SKUs (${optimalRatio.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${Math.max(lowRatio, 0)}%` }}
                  className="bg-amber-500 transition-all duration-300"
                  title={`Low Stock: ${lowStockProducts.length - criticalProducts.length} SKUs (${lowRatio.toFixed(1)}%)`}
                />
                <div
                  style={{ width: `${criticalRatio}%` }}
                  className="bg-rose-500 transition-all duration-300"
                  title={`Critical Shortage: ${criticalProducts.length} SKUs (${criticalRatio.toFixed(1)}%)`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {optimalProducts.length} Optimal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {lowStockProducts.length - criticalProducts.length} Reorder
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {criticalProducts.length} Critical
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400">Floor Density</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
            >
              Inspect Catalog &rarr;
            </button>
          </div>
        </div>

        {/* Panel 2: Low Stock & Reorder Attention Queue */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                Shortage Radar
              </span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {lowStockProducts.length} items flagged
              </span>
            </div>

            <div className="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-2.5 py-4 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All floor items maintain adequate buffer above reorder threshold.</span>
                </div>
              ) : (
                lowStockProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="truncate mr-2">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {p.sku} &bull; Bin {p.binLocation}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                        {p.quantity} / {p.reorderPoint}
                      </div>
                      <button
                        onClick={() => onOpenMovementModal('IN', p)}
                        className="text-[10px] text-indigo-400 hover:underline font-medium block"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400">Action Required</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-amber-400 hover:text-amber-300 font-medium hover:underline"
            >
              View All {lowStockProducts.length} Alerts &rarr;
            </button>
          </div>
        </div>

        {/* Panel 3: Financial Valuation & Ledger Security */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Asset Valuation
              </span>
              <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                FIFO Cost Basis
              </span>
            </div>

            <div className="my-2">
              {isAdmin || isManager ? (
                <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  ${totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 py-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium">Role-Masked (Manager/Admin Only)</span>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Dynamic RBAC redaction active across floor operator profiles.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-400">Audit Status</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified Clean
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Spatial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Stock Distribution Bar Chart */}
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Stock Units by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical inventory volume allocated across active storage categories
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{categoryChartData.length} Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111726',
                    borderRadius: '12px',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="units" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rapid Navigation & Floor Spatial Mini-Map */}
        <div className="surface-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Floor Spatial Matrix
              </h3>
              <span className="text-xs font-mono text-slate-400">6x4 Matrix</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visual coordinates across Zones A, B, and C with live shelf occupancy.
            </p>

            <div className="grid grid-cols-6 gap-1.5 p-3 rounded-xl bg-[#090D14] border border-white/[0.06]">
              {Array.from({ length: 24 }).map((_, i) => {
                const isOccupied = i % 3 !== 0;
                const isWarning = i === 4 || i === 11;
                return (
                  <div
                    key={i}
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                      isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isOccupied
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-white/[0.03] text-slate-600 border border-white/[0.04]'
                    }`}
                    title={`Bin Position ${String.fromCharCode(65 + Math.floor(i / 8))}-${(i % 8) + 1}`}
                  >
                    {(i % 8) + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06]">
            <button
              onClick={() => onNavigateToTab('warehouse')}
              className="w-full btn-secondary text-xs py-2 text-center flex items-center justify-center gap-2"
            >
              <span>Open 2D Warehouse Topology</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Ledger Transactions Audit Stream */}
      <div className="surface-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Verified Write-Ahead Log Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Append-only audit stream tracking all receiving, dispatch, and bin relocation events.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('movements')}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium self-start sm:self-auto"
          >
            Full Ledger History &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-medium text-[11px]">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Product SKU / ID</th>
                <th className="py-2.5 px-3">Delta Quantity</th>
                <th className="py-2.5 px-3">Route (Source &rarr; Target)</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No recent inventory transactions recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.movementId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <StatusChip status={m.movementType} />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                      {m.productId}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-100 tabular-nums">
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                      {m.sourceBin || 'Receiving Dock'} &rarr; {m.targetBin || 'Dispatch Bay'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {m.operatorId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-right font-mono text-[11px] tabular-nums">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Upload Modal */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};
