import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NavTab } from './layout/Dock';
import type { Product } from '../types';
import {
  Search,
  LayoutDashboard,
  Boxes,
  MapPin,
  History,
  ShoppingCart,
  ClipboardCheck,
  FileText,
  RefreshCw,
  ArrowRight,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, desc: 'System overview, KPI cards & telemetry charts' },
    { id: 'inventory', label: 'Inventory Catalog', icon: <Boxes className="w-4 h-4" />, desc: 'Live catalog, filtering & movements' },
    { id: 'inventory', label: 'Upload / Import Dataset', icon: <Boxes className="w-4 h-4 text-cyan-500" />, desc: 'Ingest Kaggle supply chain CSV or load 520 items' },
    { id: 'warehouse', label: '3D Floor & Bins', icon: <MapPin className="w-4 h-4" />, desc: '3D Interactive shelf glide and 2D bin capacity' },
    { id: 'movements', label: 'Time-Travel Ledger', icon: <History className="w-4 h-4" />, desc: 'Transaction history and historical state' },
    { id: 'orders', label: 'Purchase Orders', icon: <ShoppingCart className="w-4 h-4" />, desc: 'Supplier orders and inbound receiving' },
    { id: 'cyclecount', label: 'Cycle Count', icon: <ClipboardCheck className="w-4 h-4" />, desc: 'Floor verification and discrepancy reconciliation' },
    { id: 'reports', label: 'PDF Reports', icon: <FileText className="w-4 h-4" />, desc: 'OpenPDF printable sheets and CSV catalog' },
    { id: 'conflicts', label: 'Offline Outbox', icon: <RefreshCw className="w-4 h-4" />, desc: 'IndexedDB queue and sync conflicts' },
  ];

  const filteredTabs = tabs.filter(
    (t) =>
      t.label.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProducts = query.trim().length > 1
    ? products
        .filter(
          (p) =>
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-xl surface-panel p-4 shadow-2xl relative"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-white/10 pb-3">
          <Search className="w-4 h-4 text-indigo-500 dark:text-cyan-400 ml-2 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search screens, product SKUs, or warehouse commands..."
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 font-mono"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3 font-mono">
          {/* Screens Navigation */}
          {filteredTabs.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 px-2.5 mb-2 font-bold">
                Operational Screens
              </div>
              <div className="space-y-1">
                {filteredTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTab(t.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-indigo-600 dark:text-[#7C6CFF] border border-slate-200 dark:border-white/5">
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-sans">
                          {t.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">{t.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 dark:text-[#22D3EE] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Products */}
          {matchedProducts.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 px-2.5 mb-2 font-bold">
                Matching SKUs
              </div>
              <div className="space-y-1">
                {matchedProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectTab('inventory');
                      if (onSelectProduct) onSelectProduct(p);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white font-sans">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-[#7C6CFF] mt-0.5">
                        SKU: {p.sku} &bull; Shelf: {p.binLocation}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#22D3EE]">
                      {p.quantity} units
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-white/40 font-mono">
          <span>&uarr; &darr; navigate &bull; Esc close</span>
          <kbd className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60">
            Ctrl + K
          </kbd>
        </div>
      </motion.div>
    </div>
  );
};
