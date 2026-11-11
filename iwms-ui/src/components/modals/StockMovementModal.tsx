import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, MovementType } from '../../types';
import { api } from '../../services/api';
import { OfflineSyncManager } from '../../storage/sync';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, AlertTriangle } from 'lucide-react';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  allProducts: Product[];
  initialType?: MovementType;
  onSuccess: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts,
  initialType = 'IN',
  onSuccess,
}) => {
  const { user } = useAuth();
  const [movementType, setMovementType] = useState<MovementType>(initialType);
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || allProducts[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(product?.costPrice || 25);
  const [sourceBin, setSourceBin] = useState<string>(product?.binLocation || 'BIN-A1-01');
  const [targetBin, setTargetBin] = useState<string>('BIN-B1-02');
  const [reason, setReason] = useState<string>('Routine operation');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSelectedProduct = allProducts.find(p => p.id === selectedProductId) || product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }

      const operatorId = user?.username || 'operator';

      if (!navigator.onLine) {
        // Queue to IndexedDB Outbox
        await OfflineSyncManager.queueMovement({
          productId: selectedProductId,
          movementType,
          quantity,
          sourceBin: movementType === 'IN' ? undefined : sourceBin,
          targetBin: movementType === 'OUT' ? undefined : targetBin,
          reason,
          operatorId,
          timestamp: new Date().toISOString(),
        });
      } else {
        try {
          if (movementType === 'IN') {
            await api.stockIn({
              productId: selectedProductId,
              quantity,
              unitCost: unitPrice,
              targetBin,
              reason,
            });
          } else if (movementType === 'OUT') {
            await api.stockOut({
              productId: selectedProductId,
              quantity,
              sourceBin,
              reason,
            });
          } else if (movementType === 'TRANSFER') {
            await api.stockTransfer({
              productId: selectedProductId,
              sourceBin,
              targetBin,
              quantity,
            });
          }
        } catch (apiErr) {
          console.warn('Backend unavailable, queueing movement to local Outbox:', apiErr);
          await OfflineSyncManager.queueMovement({
            productId: selectedProductId,
            movementType,
            quantity,
            sourceBin: movementType === 'IN' ? undefined : sourceBin,
            targetBin: movementType === 'OUT' ? undefined : targetBin,
            reason,
            operatorId,
            timestamp: new Date().toISOString(),
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="w-full max-w-lg glass-panel p-6 sm:p-7 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Record Stock Movement
          </h3>
          <p className="text-xs text-white/50 font-mono mt-0.5">
            Append-only WAL transaction with thread safety and offline outbox sync.
          </p>
        </div>

        {/* Movement Type Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setMovementType('IN')}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              movementType === 'IN'
                ? 'bg-[#34D399] text-[#070912] shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
          <button
            type="button"
            onClick={() => setMovementType('OUT')}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              movementType === 'OUT'
                ? 'bg-[#F87171] text-[#070912] shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock Out</span>
          </button>
          <button
            type="button"
            onClick={() => setMovementType('TRANSFER')}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              movementType === 'TRANSFER'
                ? 'bg-[#7C6CFF] text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-xs font-mono font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {/* Product Select */}
          <div>
            <label className="block uppercase text-white/60 mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="glass-input text-xs"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#070912] text-white">
                  [{p.sku}] {p.name} (Stock: {p.quantity} units)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase text-white/60 mb-1">
                Quantity Units
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="glass-input font-bold text-xs"
              />
            </div>

            {movementType === 'IN' && (
              <div>
                <label className="block uppercase text-white/60 mb-1">
                  Destination Shelf
                </label>
                <input
                  type="text"
                  required
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="BIN-A1-01"
                />
              </div>
            )}

            {movementType === 'OUT' && (
              <div>
                <label className="block uppercase text-white/60 mb-1">
                  Origin Shelf
                </label>
                <input
                  type="text"
                  required
                  value={sourceBin}
                  onChange={(e) => setSourceBin(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="BIN-A1-01"
                />
              </div>
            )}
          </div>

          {movementType === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block uppercase text-white/60 mb-1">
                  Origin Shelf
                </label>
                <input
                  type="text"
                  required
                  value={sourceBin}
                  onChange={(e) => setSourceBin(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="BIN-A1-01"
                />
              </div>
              <div>
                <label className="block uppercase text-white/60 mb-1">
                  Destination Shelf
                </label>
                <input
                  type="text"
                  required
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  className="glass-input text-xs"
                  placeholder="BIN-A2-04"
                />
              </div>
            </div>
          )}

          {movementType === 'IN' && (
            <div>
              <label className="block uppercase text-white/60 mb-1">
                Unit Purchase Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="glass-input text-xs"
              />
            </div>
          )}

          <div>
            <label className="block uppercase text-white/60 mb-1">
              Reason / Reference
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="glass-input text-xs"
              placeholder="e.g. Supplier delivery, floor dispatch, audit"
            />
          </div>

          {currentSelectedProduct && (
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/70 flex justify-between items-center text-xs">
              <span>On-Hand: <strong className="text-white font-mono">{currentSelectedProduct.quantity}u</strong></span>
              <span>Projected: <strong className="text-[#22D3EE] font-mono">
                {movementType === 'IN'
                  ? currentSelectedProduct.quantity + quantity
                  : movementType === 'OUT'
                  ? Math.max(0, currentSelectedProduct.quantity - quantity)
                  : currentSelectedProduct.quantity}u
              </strong></span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary text-xs py-2 px-3.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary text-xs py-2 px-3.5"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#070912] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Execute Action</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
