import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { parseCsv, autoDetectFieldMapping, mapRowToProduct, type FieldMapping } from '../../utils/datasetMapper';
import { PRELOADED_KAGGLE_DATASET } from '../../utils/kaggleDataset';
import { OfflineSyncManager } from '../../storage/sync';
import { api } from '../../services/api';
import type { Product } from '../../types';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

type Step = 'DROP' | 'PREVIEW' | 'IMPORTING' | 'SUCCESS';

export const DatasetUploadModal: React.FC<DatasetUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>('DROP');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({
    sku: '',
    name: '',
    category: '',
    quantity: '',
    reorderPoint: '',
    sellingPrice: '',
    costPrice: '',
    binLocation: '',
    productType: '',
  });
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileContent = (content: string, name: string) => {
    try {
      setImportError(null);
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(content);
        const products: Product[] = Array.isArray(parsed) ? parsed : [parsed];
        executeDirectImport(products, name);
        return;
      }

      const { headers, rows } = parseCsv(content);
      if (headers.length === 0 || rows.length === 0) {
        setImportError('The provided CSV file appears to be empty or improperly formatted.');
        return;
      }

      const detected = autoDetectFieldMapping(headers);
      setFileName(name);
      setRawHeaders(headers);
      setRawRows(rows);
      setMapping(detected);
      setStep('PREVIEW');
    } catch (err: any) {
      setImportError(`Failed to parse file: ${err.message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const executeDirectImport = async (products: Product[], sourceName: string) => {
    setStep('IMPORTING');
    setFileName(sourceName);
    try {
      // 1. Persist to IndexedDB
      await OfflineSyncManager.cacheProducts(products);

      // 2. Synchronize Warehouse Topology with any newly introduced bins
      const warehouses = await OfflineSyncManager.getCachedWarehouses();
      if (warehouses.length > 0) {
        const mainWh = warehouses[0];
        const existingBinCodes = new Set(
          mainWh.zones.flatMap((z) => z.bins.map((b) => b.code))
        );

        const newBinsToCreate = new Set<string>();
        products.forEach((p) => {
          if (p.binLocation && !existingBinCodes.has(p.binLocation)) {
            newBinsToCreate.add(p.binLocation);
          }
        });

        if (newBinsToCreate.size > 0 && mainWh.zones.length > 0) {
          const targetZone = mainWh.zones[0];
          newBinsToCreate.forEach((binCode) => {
            targetZone.bins.push({
              id: binCode,
              code: binCode,
              capacityQuantity: 500,
              maxWeightKg: 1000,
              currentQuantity: 20,
              currentWeightKg: 50,
              productIds: [],
            });
          });
          await OfflineSyncManager.cacheWarehouses([mainWh]);
        }
      }

      // 3. Sync with backend API if online
      if (navigator.onLine) {
        try {
          await api.importProducts(products);
        } catch (apiErr) {
          console.warn('Backend sync deferred or offline:', apiErr);
        }
      }

      // 4. Dispatch update events for global reactive re-render
      window.dispatchEvent(new CustomEvent('iwms:outbox-updated'));
      window.dispatchEvent(new CustomEvent('iwms:sync-complete'));

      setImportCount(products.length);
      setStep('SUCCESS');
      onSuccess?.(products.length);
    } catch (err: any) {
      setImportError(`Import failed: ${err.message}`);
      setStep('DROP');
    }
  };

  const handleConfirmMapping = () => {
    const products = rawRows.map((row, idx) => mapRowToProduct(row, mapping, idx));
    executeDirectImport(products, fileName);
  };

  const handleLoadKaggleDataset = () => {
    executeDirectImport(PRELOADED_KAGGLE_DATASET, 'Kaggle Warehouse Supply Chain Dataset (520 Items)');
  };

  const handleReset = () => {
    setStep('DROP');
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    setImportError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl overflow-hidden"
      >
        <GlassCard className="p-6 sm:p-8 border border-white/20 shadow-2xl relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C6CFF] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#7C6CFF]/20">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <span>Upload Warehouse Dataset</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40">
                  CSV / JSON
                </span>
              </h2>
              <p className="text-xs text-white/60 font-mono">
                Import Kaggle or enterprise supply chain datasets with zero code changes.
              </p>
            </div>
          </div>

          {importError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* STEP 1: DROPZONE & 1-CLICK KAGGLE ACTION */}
          {step === 'DROP' && (
            <div className="space-y-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-[#22D3EE] bg-[#22D3EE]/10 scale-[1.01] shadow-lg shadow-[#22D3EE]/20'
                    : 'border-white/20 hover:border-[#7C6CFF]/80 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#7C6CFF]">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-1">
                    Drag and drop your Kaggle CSV / JSON dataset here
                  </h3>
                  <p className="text-xs text-white/50 font-mono mb-4">
                    Supports Kaggle inventory, supply chain logistics, and ERP catalog files
                  </p>
                  <span className="glass-button-secondary text-xs py-1.5 px-4 pointer-events-none">
                    Browse File from Computer
                  </span>
                </motion.div>
              </div>

              {/* 1-Click Kaggle Quick Action */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C6CFF]/15 to-[#22D3EE]/15 border border-[#7C6CFF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#22D3EE] shrink-0" />
                  <div>
                    <div className="font-heading font-bold text-sm text-white">
                      Don't have a dataset file ready?
                    </div>
                    <div className="text-xs text-white/60 font-mono">
                      Load our curated Kaggle Warehouse Dataset (520 enterprise items) in 1 click.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadKaggleDataset}
                  className="w-full sm:w-auto glass-button-primary text-xs py-2 px-4 whitespace-nowrap shadow-lg shadow-[#7C6CFF]/30"
                >
                  <Database className="w-4 h-4" />
                  <span>Load 520 Kaggle Items</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN AUTO-MAPPER & PREVIEW */}
          {step === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50 font-mono">File: {fileName}</span>
                  <h3 className="font-heading text-sm font-bold text-white">
                    Confirm Column Mappings ({rawRows.length} rows detected)
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-white/40 hover:text-white font-mono flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Pick another file</span>
                </button>
              </div>

              {/* Column selection grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-mono">
                {(
                  [
                    ['sku', 'SKU / ID'],
                    ['name', 'Product Name'],
                    ['category', 'Category'],
                    ['quantity', 'Quantity'],
                    ['reorderPoint', 'Safety Stock'],
                    ['sellingPrice', 'Selling Price'],
                    ['costPrice', 'Unit Cost'],
                    ['binLocation', 'Bin Location'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase">{label}</label>
                    <select
                      value={mapping[key]}
                      onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                      className="glass-input text-[11px] py-1 px-2 font-mono"
                    >
                      <option value="" className="bg-[#070912] text-white/50">Auto / Default</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h} className="bg-[#070912] text-white">
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview table (First 4 rows) */}
              <div className="border border-white/10 rounded-xl overflow-x-auto max-h-40">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-white/50 text-[10px]">
                    <tr>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Stock</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Shelf Bin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rawRows.slice(0, 4).map((row, i) => {
                      const p = mapRowToProduct(row, mapping, i);
                      return (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-1.5 px-3 text-[#7C6CFF]">{p.sku}</td>
                          <td className="py-1.5 px-3 text-white truncate max-w-[140px]">{p.name}</td>
                          <td className="py-1.5 px-3 text-white/70">{p.category}</td>
                          <td className="py-1.5 px-3 text-white">{p.quantity}</td>
                          <td className="py-1.5 px-3 text-[#34D399]">${p.sellingPrice.toFixed(2)}</td>
                          <td className="py-1.5 px-3 text-white/60">{p.binLocation}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Confirm CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={handleReset} className="glass-button-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMapping}
                  className="glass-button-primary text-xs py-2 px-5 flex items-center gap-2"
                >
                  <span>Ingest {rawRows.length} Items</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORTING PROGRESS */}
          {step === 'IMPORTING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#7C6CFF]/20 border-t-[#7C6CFF] animate-spin" />
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Ingesting Warehouse Dataset...
                </h3>
                <p className="text-xs text-white/50 font-mono mt-1">
                  Persisting items, provisioning warehouse bins, and synchronizing state.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS FEEDBACK */}
          {step === 'SUCCESS' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shadow-lg shadow-[#34D399]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">
                  Dataset Successfully Ingested!
                </h3>
                <p className="text-xs text-white/70 font-mono mt-1">
                  <span className="font-bold text-[#22D3EE]">{importCount} items</span> are now live across your Dashboard, Catalog, 2D Floor Map, and Reports.
                </p>
              </div>
              <button
                onClick={onClose}
                className="glass-button-primary text-xs py-2.5 px-6 mt-2"
              >
                Open Warehouse Catalog
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
