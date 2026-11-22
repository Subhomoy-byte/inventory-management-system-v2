import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { OfflineSyncManager } from '../storage/sync';
import { useAuth } from '../context/AuthContext';
import { StatusChip } from '../components/common/StatusChip';
import { DatasetUploadModal } from '../components/modals/DatasetUploadModal';
import {
  Search,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  FileSpreadsheet,
  UploadCloud,
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-indigo-400" />
            Stock Catalog & Master Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time item SKU balances, storage bin coordinates, and role-based FIFO cost tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3"
            title="Upload CSV / Kaggle Dataset"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import Dataset</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="btn-secondary text-xs py-2 px-3"
            title="Download Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onOpenMovementModal('IN')}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Receive Stock</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search SKU, item name, shelf..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="surface-input pl-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="surface-input text-xs bg-[#141B2D]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="surface-input text-xs bg-[#141B2D]"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="OPTIMAL">Optimal Level</option>
              <option value="LOW_STOCK">Low Stock Warning</option>
              <option value="CRITICAL">Critical Shortage</option>
              <option value="OVERSTOCKED">Overstocked</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="surface-input text-xs bg-[#141B2D]"
            >
              <option value="ALL">All Product Types</option>
              <option value="PERISHABLE">Perishable Goods</option>
              <option value="ELECTRONIC">Electronic Items</option>
              <option value="FRAGILE">Fragile Items</option>
              <option value="BULK">Bulk Material</option>
              <option value="STANDARD">Standard Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Density Products Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-medium text-[11px] bg-white/[0.02]">
                <th className="py-3 px-4">Product SKU & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Floor Quantity</th>
                <th className="py-3 px-4">Bin Shelf</th>
                <th className="py-3 px-4">
                  {isAdmin || isManager ? 'Unit Cost / Price' : 'Selling Price'}
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <span className="text-xs">No catalog items matching active filters.</span>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const percent = Math.min(100, Math.round((p.quantity / (p.reorderPoint * 2 || 50)) * 100));

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Item Code & Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white text-sm">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                          {p.sku}
                        </div>
                      </td>

                      {/* Category & Classification */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {p.category}
                        </div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 font-mono mt-0.5">
                          {p.productType}
                        </span>
                      </td>

                      {/* Quantity & Level Bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono font-bold text-sm text-white tabular-nums">
                            {p.quantity} units
                          </span>
                          <span className="text-slate-400 text-[10px]">/ min {p.reorderPoint}</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.quantity <= p.reorderPoint
                                ? 'bg-rose-500'
                                : p.quantity <= p.reorderPoint * 1.3
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Shelf Location */}
                      <td className="py-3 px-4 font-mono font-medium text-cyan-400 text-xs">
                        {p.binLocation}
                      </td>

                      {/* Price / Role-Based Masking */}
                      <td className="py-3 px-4 font-mono">
                        <div>
                          <span className="font-bold text-slate-100 tabular-nums">
                            ${p.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                        {isAdmin || isManager ? (
                          <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                            Cost: ${p.costPrice !== undefined ? p.costPrice.toFixed(2) : 'N/A'}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Masked</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusChip status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenMovementModal('IN', p)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                            title="Receive Stock (Inbound)"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenMovementModal('OUT', p)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Dispatch Stock (Outbound)"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenMovementModal('TRANSFER', p)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                            title="Transfer Bin Shelf"
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
        <div className="p-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200 tabular-nums">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to <span className="font-semibold text-slate-200 tabular-nums">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span> of <span className="font-semibold text-slate-200 tabular-nums">
              {filteredProducts.length}
            </span> items
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs tabular-nums text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Upload Modal */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => loadProducts()}
      />
    </div>
  );
};
