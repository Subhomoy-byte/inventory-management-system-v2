import React, { useState, useEffect } from 'react';
import type { Product, StockMovement } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { StatusChip } from '../components/common/StatusChip';
import { VectorGraphic } from '../components/common/VectorGraphic';
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
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface DashboardPageProps {
  onOpenMovementModal: (type: 'IN' | 'OUT' | 'TRANSFER') => void;
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

  const loadData = async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const [prodList, movList] = await Promise.all([
          api.getProducts().catch(() => OfflineSyncManager.getCachedProducts()),
          api.getStockMovements().catch(() => []),
        ]);
        setProducts(prodList);
        setMovements(movList.slice(-10).reverse());
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

  const categoryChartData = Object.entries(categoryDataMap).map(([name, val]) => ({
    name,
    units: val.units,
    productCount: val.count,
  }));

  const COLORS = ['#7C6CFF', '#22D3EE', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <VectorGraphic size={52} variant="badge" colorScheme="cyber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white">
                Warehouse Command Center
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40 font-bold">
                REALTIME
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
              Live inventory valuation, telemetry analytics, and operational movement triggers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenMovementModal('IN')}
            className="glass-button-primary text-xs sm:text-sm py-2 px-3.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('OUT')}
            className="glass-button-secondary text-xs sm:text-sm py-2 px-3.5 hover:text-[#F87171]"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Dispatch</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('TRANSFER')}
            className="glass-button-secondary text-xs sm:text-sm py-2 px-3.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Bin</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <GlassCard hoverEffect>
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Total Products</span>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <Boxes className="w-4 h-4 text-[#7C6CFF]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {totalSkus}
          </div>
          <div className="text-xs text-white/50 mt-2 flex items-center justify-between font-mono">
            <span>Distinct Catalog SKUs</span>
            <span className="text-[#34D399] font-bold">100% Synced</span>
          </div>
        </GlassCard>

        {/* Total Units On Hand */}
        <GlassCard hoverEffect>
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Total Items in Stock</span>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <Layers className="w-4 h-4 text-[#22D3EE]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#22D3EE] font-mono tracking-tight">
            {totalUnits.toLocaleString()}
          </div>
          <div className="text-xs text-white/50 mt-2 flex items-center justify-between font-mono">
            <span>Physical Floor Units</span>
            <span className="text-[#7C6CFF] font-bold">All Shelves</span>
          </div>
        </GlassCard>

        {/* Low Stock Alerts */}
        <GlassCard hoverEffect>
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Low Stock Radar</span>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-[#FBBF24] animate-pulse' : 'text-white/40'}`} />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#FBBF24] font-mono tracking-tight">
            {lowStockProducts.length}
          </div>
          <div className="text-xs text-white/50 mt-2 flex items-center justify-between font-mono">
            <span>Below Reorder Point</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-[#FBBF24] hover:underline font-bold"
            >
              Review Items &rarr;
            </button>
          </div>
        </GlassCard>

        {/* Inventory Valuation */}
        <GlassCard hoverEffect>
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Total Valuation</span>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <DollarSign className="w-4 h-4 text-[#34D399]" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#34D399] font-mono tracking-tight">
            {isAdmin || isManager ? (
              `$${totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            ) : (
              <span className="text-white/40 text-lg">Confidential (Masked)</span>
            )}
          </div>
          <div className="text-xs text-white/50 mt-2 flex items-center justify-between font-mono">
            <span>Asset Valuation</span>
            <span className="text-[#34D399] font-bold">FIFO Cost Basis</span>
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Stock Distribution */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#22D3EE]" />
                <span>Stock Units by Category</span>
              </h3>
              <p className="text-xs text-white/50 font-mono">
                Real-time quantity allocation across warehouse categories
              </p>
            </div>
            <span className="text-xs font-mono text-white/40">{categoryChartData.length} Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontFamily: 'monospace' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(7, 9, 18, 0.95)',
                    borderRadius: '16px',
                    borderColor: 'rgba(255, 255, 255, 0.14)',
                    backdropFilter: 'blur(16px)',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                  }}
                />
                <Bar dataKey="units" fill="#7C6CFF" radius={[8, 8, 0, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Low Stock Radar Table */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
              <span>Low Stock Radar</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30 font-bold font-mono">
              {lowStockProducts.length} items
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/50 font-mono">
                All inventory stock levels are optimal!
              </div>
            ) : (
              lowStockProducts.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                >
                  <div className="truncate mr-3">
                    <div className="text-sm font-bold text-white truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-white/50 font-mono mt-0.5">
                      SKU: <span className="font-bold text-[#7C6CFF]">{p.sku}</span> &bull; {p.binLocation}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#F87171]">
                      {p.quantity} / {p.reorderPoint}
                    </span>
                    <div className="text-[10px] text-white/40 font-mono">Reorder Now</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Movements Stream */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#7C6CFF]" />
              <span>Recent Inventory Transactions (Audit Ledger)</span>
            </h3>
            <p className="text-xs text-white/50 font-mono mt-0.5">
              Verified append-only WAL transactions (Stock-In, Outbound Dispatch, Shelf Transfers)
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('movements')}
            className="text-xs font-mono text-[#22D3EE] hover:underline font-bold"
          >
            Full Ledger Timeline &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Item SKU / ID</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Origin &rarr; Destination</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-white/40">
                    No recent inventory transactions recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.movementId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4">
                      <StatusChip status={m.movementType} />
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {m.productId}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#22D3EE]">
                      {m.quantity} units
                    </td>
                    <td className="py-3 px-4 text-white/70">
                      {m.sourceBin || 'Dock In'} &rarr; {m.targetBin || 'Dock Out'}
                    </td>
                    <td className="py-3 px-4 text-white/80">
                      {m.operatorId}
                    </td>
                    <td className="py-3 px-4 text-white/40 text-[11px]">
                      {new Date(m.timestamp).toLocaleTimeString()}
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
