import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generateWarehousePdfBlob, triggerBlobDownload } from '../services/pdfGenerator';
import { Folder } from '../components/common/Folder';
import {
  FileText,
  FileSpreadsheet,
  Database,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface ReportsPageProps {
  products: Product[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ products }) => {
  const { user, isEmployee } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(true);

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Filter products count for current selection
  const filteredCount = selectedCategory
    ? products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()).length
    : products.length;

  // Generate live PDF Blob for in-browser preview whenever data or filters change
  useEffect(() => {
    let isCancelled = false;
    setIsGeneratingPreview(true);

    try {
      const blob = generateWarehousePdfBlob({
        products,
        user,
        category: selectedCategory || undefined,
      });
      const url = URL.createObjectURL(blob);
      if (!isCancelled) {
        setPreviewBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setIsGeneratingPreview(false);
      }
    } catch (err) {
      console.error('Failed to generate preview PDF blob:', err);
      if (!isCancelled) setIsGeneratingPreview(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [products, selectedCategory, user]);

  // Clean up Blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  // 1-Click Direct Download of Structured PDF Report
  const handleDownloadPdf = () => {
    setPdfLoading(true);
    try {
      const blob = generateWarehousePdfBlob({
        products,
        user,
        category: selectedCategory || undefined,
      });
      const catSuffix = selectedCategory
        ? `_${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        : '_all_categories';
      const filename = `warehouse_audit_report${catSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;
      triggerBlobDownload(blob, filename);
    } catch (err: any) {
      alert('Failed to generate PDF report: ' + (err?.message || err));
    } finally {
      setPdfLoading(false);
    }
  };

  // Open PDF in a new window/tab for full-screen printing or native viewer
  const handleOpenPdfNewTab = () => {
    if (previewBlobUrl) {
      window.open(previewBlobUrl, '_blank');
    } else {
      const blob = generateWarehousePdfBlob({
        products,
        user,
        category: selectedCategory || undefined,
      });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

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
              PDF GENERATOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Physical stock cycle count sheets with signature verification, spreadsheet exports, and atomic database backups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="btn-secondary text-xs py-2 px-3.5"
            title="Download complete catalog in CSV format"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Catalog CSV</span>
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={backupLoading}
            className="btn-secondary text-xs py-2 px-3.5 hover:text-indigo-600 dark:hover:text-indigo-400"
            title="Create an atomic snapshot backup of WAL ledger"
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

      {/* PDF Controls & Direct Download Bar */}
      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-slate-600 dark:text-white/60">
              Filter Scope:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="surface-input text-xs sm:text-sm py-2 w-56 font-mono"
            >
              <option value="" className="bg-white dark:bg-[#070912] text-slate-900 dark:text-white">
                All Categories ({products.length} SKUs)
              </option>
              {categories.map((c) => {
                const count = products.filter((p) => p.category?.toLowerCase() === c.toLowerCase()).length;
                return (
                  <option key={c} value={c} className="bg-white dark:bg-[#070912] text-slate-900 dark:text-white">
                    {c} ({count} SKUs)
                  </option>
                );
              })}
            </select>

            <span className="text-[11px] font-mono text-slate-400">
              Showing {filteredCount} present items
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-[#22D3EE]" />
              <span>
                {isEmployee ? 'Staff View (Costs Masked)' : 'Admin View (Full Valuation)'}
              </span>
            </div>

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading || isGeneratingPreview}
              className="btn-primary text-xs py-2 px-4 font-mono flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              title="Directly download structured warehouse PDF report"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            {/* Fullscreen / Print In New Tab */}
            <button
              onClick={handleOpenPdfNewTab}
              disabled={isGeneratingPreview || !previewBlobUrl}
              className="btn-secondary text-xs py-2 px-3.5 font-mono flex items-center gap-1.5 cursor-pointer"
              title="Open print sheet in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Print / Tab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 3D Audit Folio from React Bits */}
      <div className="surface-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="max-w-md space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <span>REACT BITS 3D INTERACTIVE FOLIO</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Physical Warehouse Audit Folio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Click, drag, or hover this 3D glass dossier folder to peek and inspect count sheets, financial registers, and supervisory sign-offs. Click any page inside the folder to zoom or directly download the count sheet.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">Variant: Glass 3D</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">Draggable Pages</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">Interactive Tilt</span>
          </div>
        </div>

        <div className="flex items-center justify-center py-2 px-4 scale-95 sm:scale-100">
          <Folder
            label="WH-MAIN Audit"
            variant="glass"
            color="#4f46e5"
            paperColor="#ffffff"
            items={[
              {
                title: 'Cycle Count Sheet',
                description: `${filteredCount} SKUs prepared for A4 audit verification. Click to download.`,
              },
              {
                title: 'Valuation & Cost Ledger',
                description: isEmployee
                  ? 'Restricted: Unit costs masked for floor operators.'
                  : 'Total inventory valuation and cost margins ledger.',
              },
              {
                title: 'Discrepancy Sheet',
                description: 'Physical audit variance fields and supervisory sign-off block.',
              },
              {
                title: 'Facility Audit Dossier',
                description: 'WH-MAIN Central Logistics Hub official tracking manifest.',
              },
            ]}
            mode="flap"
            layout="spread"
            size={1.05}
            theme="dark"
            openOn="click"
            draggable={true}
            zoomOnClick={true}
            peek={true}
            onItemClick={(_item, index) => {
              if (index === 0) handleDownloadPdf();
            }}
          />
        </div>
      </div>

      {/* In-Browser PDF Preview Frame */}
      <div className="surface-card p-2 overflow-hidden shadow-2xl">
        <div className="w-full bg-slate-100 dark:bg-[#070912]/80 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative">
          {isGeneratingPreview ? (
            <div className="h-[650px] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
              <span>Formatting structured A4 count sheet with present warehouse inventory...</span>
            </div>
          ) : previewBlobUrl ? (
            <iframe
              src={previewBlobUrl}
              title="OpenPDF Floor Count Sheet"
              className="w-full h-[680px] border-0 rounded-2xl"
            />
          ) : (
            <div className="h-[650px] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <span>No preview available. Click &quot;Download PDF Report&quot; to export.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
