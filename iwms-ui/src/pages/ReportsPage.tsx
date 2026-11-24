import React, { useState } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import {
  FileText,
  FileSpreadsheet,
  Database,
  Printer,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface ReportsPageProps {
  products: Product[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ products }) => {
  const { isEmployee } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const pdfUrl = api.getPdfReportUrl(selectedCategory || undefined);

  const handleDownloadCsv = async () => {
    try {
      const csv = await api.getCsvCatalog();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert('CSV Download failed: ' + err.message);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMessage(null);
    try {
      const res = await api.createBackup();
      setBackupMessage(`Backup generated: ${res.backupPath}`);
    } catch (err: any) {
      setBackupMessage(`Backup failed: ${err.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <span>Audit Reports &amp; Floor Count Sheets</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold">
              OPENPDF ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Physical stock audit sheets, spreadsheet exports, and secure atomic backup snapshots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Catalog CSV</span>
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="btn-secondary text-xs py-2 px-3.5 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Database className={`w-4 h-4 text-indigo-500 ${backupLoading ? 'animate-spin' : ''}`} />
            <span>Create Backup</span>
          </button>
        </div>
      </div>

      {/* Backup Notification */}
      {backupMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-mono font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span>{backupMessage}</span>
          </div>
          <button onClick={() => setBackupMessage(null)} className="text-xs font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* PDF Controls & Role Redaction Notice */}
      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-600 dark:text-white/60">
              Filter Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="surface-input text-xs sm:text-sm py-2 w-56 font-mono"
            >
              <option value="" className="bg-white dark:bg-[#070912] text-slate-900 dark:text-white">All Categories (Full Report)</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-[#070912] text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-[#22D3EE]" />
              <span>
                {isEmployee ? 'Staff View (Costs Masked)' : 'Admin View (Full Financials)'}
              </span>
            </div>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs py-2 px-3.5 font-mono"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Open PDF Print Sheet</span>
            </a>
          </div>
        </div>
      </div>

      {/* In-Browser PDF Preview Frame */}
      <div className="surface-card p-2 overflow-hidden shadow-2xl">
        <div className="w-full bg-slate-100 dark:bg-[#070912]/80 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5">
          <iframe
            src={pdfUrl}
            title="OpenPDF Floor Count Sheet"
            className="w-full h-[650px] border-0 rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};
