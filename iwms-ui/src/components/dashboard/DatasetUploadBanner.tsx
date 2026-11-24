import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Database,
  Sparkles,
  ArrowRight,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

interface DatasetUploadBannerProps {
  onOpenUploadModal: () => void;
  onQuickLoadKaggle: () => void;
  isLoading?: boolean;
}

export const DatasetUploadBanner: React.FC<DatasetUploadBannerProps> = ({
  onOpenUploadModal,
  onQuickLoadKaggle,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl"
    >
      <GlassCard className="p-5 sm:p-6 border border-slate-200 dark:border-white/15 bg-gradient-to-r from-indigo-500/10 via-slate-500/[0.02] to-cyan-500/10 relative overflow-hidden shadow-xs">
        {/* Animated subtle glow */}
        <div
          className={`absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isHovered ? 'opacity-30 bg-cyan-500/25' : 'opacity-15 bg-indigo-500/20'
          }`}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          {/* Left info column */}
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-[#A78BFA] border border-indigo-500/30 shadow-xs">
                <Sparkles className="w-3 h-3 text-cyan-600 dark:text-[#22D3EE]" />
                Kaggle Dataset Ready
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 hidden sm:inline">
                Drag-and-Drop Ingestion Portal
              </span>
            </div>

            <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Replace Demo Mockups with Real Warehouse Datasets
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono leading-relaxed">
              Upload custom Kaggle CSV supply chain datasets or load our 520-item enterprise catalog. Columns auto-map directly to shelf bins, stock levels, and role-based prices without code changes.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500 dark:text-white/50">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> Fuzzy Header Auto-Match
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-cyan-600 dark:text-[#22D3EE]" /> 3D &amp; 2D Shelf Auto-Slot
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-indigo-500 dark:text-[#A78BFA]" /> IndexedDB Offline &amp; Backend
              </span>
            </div>
          </div>

          {/* Right action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={onQuickLoadKaggle}
              disabled={isLoading}
              className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2 border-slate-200 dark:border-cyan-500/30 hover:border-cyan-500"
            >
              <Database className="w-4 h-4 text-cyan-600 dark:text-[#22D3EE]" />
              <span>{isLoading ? 'Ingesting...' : '1-Click 520 Kaggle Data'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenUploadModal}
              className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV / Dataset</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
