import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { StatusChip } from '../components/common/StatusChip';
import {
  Search,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Lock,
} from 'lucide-react';

interface InventoryPageProps {
  onOpenMovementModal: (type: 'IN' | 'OUT' | 'TRANSFER', product?: Product) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onOpenMovementModal }) => {
  const { isAdmin, isManager } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const loadProducts = async () => {
    try {
      if (navigator.onLine) {
        const data = await api.getProducts().catch(() => OfflineSyncManager.getCachedProducts());
        setProducts(data);
        await OfflineSyncManager.cacheProducts(data);
      } else {
        const cached = await OfflineSyncManager.getCachedProducts();
        setProducts(cached);
      }
    } catch {
      const cached = await OfflineSyncManager.getCachedProducts();
      setProducts(cached);
    }
  };

  useEffect(() => {
    loadProducts();
    const handleUpdate = () => loadProducts();
    window.addEventListener('iwms:outbox-updated', handleUpdate);
    window.addEventListener('iwms:sync-complete', handleUpdate);
    return () => {
      window.removeEventListener('iwms:outbox-updated', handleUpdate);
      window.removeEventListener('iwms:sync-complete', handleUpdate);
    };
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || p.productType === typeFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCsv = async () => {
    try {
      const csvData = await api.getCsvCatalog();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `iwms_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('CSV Export Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white">
              Inventory & Product Catalog
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 font-bold">
              {filteredProducts.length} ITEMS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Real-time stock counts, storage shelf bins, and role-based price transparency.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="glass-button-secondary text-xs sm:text-sm py-2 px-3.5"
            title="Download Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#34D399]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('IN')}
            className="glass-button-primary text-xs sm:text-sm py-2 px-3.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>New Movement</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search code, name, shelf..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input pl-10 text-xs sm:text-sm font-mono"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs sm:text-sm font-mono"
            >
              <option value="ALL" className="bg-[#070912] text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#070912] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs sm:text-sm font-mono"
            >
              <option value="ALL" className="bg-[#070912] text-white">All Stock Statuses</option>
              <option value="OPTIMAL" className="bg-[#070912] text-white">Optimal Level</option>
              <option value="LOW_STOCK" className="bg-[#070912] text-white">Low Stock Warning</option>
              <option value="CRITICAL" className="bg-[#070912] text-white">Critical Shortage</option>
              <option value="OVERSTOCKED" className="bg-[#070912] text-white">Overstocked</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs sm:text-sm font-mono"
            >
              <option value="ALL" className="bg-[#070912] text-white">All Product Types</option>
              <option value="PERISHABLE" className="bg-[#070912] text-white">Perishable Goods</option>
              <option value="ELECTRONIC" className="bg-[#070912] text-white">Electronic Items</option>
              <option value="FRAGILE" className="bg-[#070912] text-white">Fragile Items</option>
              <option value="BULK" className="bg-[#070912] text-white">Bulk Material</option>
              <option value="STANDARD" className="bg-[#070912] text-white">Standard Items</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Products Glass Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider bg-white/[0.02] text-[10px]">
                <th className="py-4 px-5">Product SKU & Name</th>
                <th className="py-4 px-5">Classification</th>
                <th className="py-4 px-5">Stock Level</th>
                <th className="py-4 px-5">Shelf Bin</th>
                <th className="py-4 px-5">
                  {isAdmin || isManager ? 'Unit Cost / Price' : 'Selling Price'}
                </th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-white/40">
                    <Boxes className="w-10 h-10 mx-auto mb-3 opacity-30 text-white" />
                    <span className="text-sm font-mono">No products found matching the active filters.</span>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const percent = Math.min(100, Math.round((p.quantity / (p.reorderPoint * 2 || 50)) * 100));

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Item Code & Name */}
                      <td className="py-4 px-5">
                        <div className="font-heading font-bold text-sm text-white">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-[#7C6CFF] mt-0.5">
                          SKU: {p.sku}
                        </div>
                      </td>

                      {/* Category & Classification */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-white/90">
                          {p.category}
                        </div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-white/60 font-mono mt-1">
                          {p.productType}
                        </span>
                      </td>

                      {/* Quantity & Level Bar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono font-extrabold text-sm text-white">
                            {p.quantity} units
                          </span>
                          <span className="text-white/40 text-[11px]">/ min {p.reorderPoint}</span>
                        </div>
                        <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.quantity <= p.reorderPoint
                                ? 'bg-[#F87171]'
                                : p.quantity <= p.reorderPoint * 1.3
                                ? 'bg-[#FBBF24]'
                                : 'bg-[#34D399]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Shelf Location */}
                      <td className="py-4 px-5 font-mono font-bold text-[#22D3EE] text-xs">
                        {p.binLocation}
                      </td>

                      {/* Price / Role-Based Masking */}
                      <td className="py-4 px-5 font-mono">
                        <div>
                          <span className="font-extrabold text-sm text-white">
                            ${p.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                        {isAdmin || isManager ? (
                          <div className="text-[10px] text-white/50 mt-0.5">
                            Cost: ${p.costPrice !== undefined ? p.costPrice.toFixed(2) : 'N/A'}
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#FBBF24] flex items-center gap-1 mt-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Cost Masked</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusChip status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenMovementModal('IN', p)}
                            className="p-1.5 rounded-xl bg-[#34D399]/15 hover:bg-[#34D399]/25 text-[#34D399] transition-all"
                            title="Receive Stock"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenMovementModal('OUT', p)}
                            className="p-1.5 rounded-xl bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] transition-all"
                            title="Dispatch Stock"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenMovementModal('TRANSFER', p)}
                            className="p-1.5 rounded-xl bg-[#7C6CFF]/15 hover:bg-[#7C6CFF]/25 text-[#7C6CFF] transition-all"
                            title="Transfer Shelf"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
          <div>
            Showing <span className="font-bold text-white">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to <span className="font-bold text-white">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span> of <span className="font-bold text-white">
              {filteredProducts.length}
            </span> products
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
