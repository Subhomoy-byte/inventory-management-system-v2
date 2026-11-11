import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PurchaseOrder, Product } from '../types';
import { api } from '../services/api';
import { GlassCard } from '../components/common/GlassCard';
import { VectorGraphic } from '../components/common/VectorGraphic';
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';

interface OrdersPageProps {
  products: Product[];
  onRefreshCatalog: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ products, onRefreshCatalog }) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      orderId: 'PO-2026-001',
      supplierId: 'Global Tech Distribution LLC',
      orderDate: '2026-11-01',
      expectedDeliveryDate: '2026-11-10',
      status: 'ORDERED',
      items: {
        'prod-001': 50,
        'prod-002': 30,
      },
    },
    {
      orderId: 'PO-2026-002',
      supplierId: 'Fresh Harvest Farms Co.',
      orderDate: '2026-11-05',
      expectedDeliveryDate: '2026-11-08',
      status: 'RECEIVED',
      items: {
        'prod-003': 100,
      },
    },
    {
      orderId: 'PO-2026-003',
      supplierId: 'Apex Industrial Supply',
      orderDate: '2026-11-07',
      expectedDeliveryDate: '2026-11-14',
      status: 'ORDERED',
      items: {
        'prod-004': 75,
        'prod-005': 25,
      },
    },
  ]);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('Apex Industrial Supply');
  const [deliveryDate, setDeliveryDate] = useState('2026-11-20');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState(50);
  const [receivingId, setReceivingId] = useState<string | null>(null);
  const [celebrationPO, setCelebrationPO] = useState<string | null>(null);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newPO: PurchaseOrder = {
      orderId: `PO-2026-${String(orders.length + 1).padStart(3, '0')}`,
      supplierId: supplierName,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: deliveryDate,
      status: 'ORDERED',
      items: {
        [selectedProductId]: orderQuantity,
      },
    };

    setOrders([newPO, ...orders]);
    setIsNewOrderModalOpen(false);
  };

  const handleReceiveOrder = async (po: PurchaseOrder) => {
    setReceivingId(po.orderId);
    try {
      for (const [prodId, qty] of Object.entries(po.items)) {
        await api.stockIn({
          productId: prodId,
          quantity: qty,
          reason: `Received Purchase Order ${po.orderId}`,
        }).catch(() => null);
      }

      setOrders(orders.map((o) => (o.orderId === po.orderId ? { ...o, status: 'RECEIVED' } : o)));
      setCelebrationPO(po.orderId);
      setTimeout(() => setCelebrationPO(null), 3000);
      onRefreshCatalog();
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-[#7C6CFF]" />
              <span>Purchase Order Management</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40 font-bold">
              INBOUND
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-0.5">
            Supplier procurement, order dispatch tracking, and 1-click receiving with auto-stock updates.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="glass-button-primary text-xs sm:text-sm py-2 px-3.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((po) => {
          const totalItemsCount = Object.values(po.items).reduce((a, b) => a + b, 0);
          const isReceived = po.status === 'RECEIVED';

          return (
            <GlassCard key={po.orderId} hoverEffect className="p-5 sm:p-6 relative overflow-hidden">
              {/* Optional Celebration Vector Burst */}
              {celebrationPO === po.orderId && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <VectorGraphic size={100} variant="burst" colorScheme="emerald" />
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-white">
                      Order #{po.orderId}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isReceived
                          ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
                          : 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30 animate-pulse'
                      }`}
                    >
                      {isReceived ? 'Received & Stored' : 'Inbound Transit'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-white/80">
                      <Truck className="w-3.5 h-3.5 text-[#7C6CFF]" />
                      Supplier: {po.supplierId}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      Created: {po.orderDate}
                    </span>
                    <span>&bull;</span>
                    <span>Expected: {po.expectedDeliveryDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                  <div className="text-right font-mono">
                    <div className="text-base font-extrabold text-[#22D3EE]">
                      {totalItemsCount} units
                    </div>
                    <div className="text-[10px] text-white/40">
                      {Object.keys(po.items).length} items in manifest
                    </div>
                  </div>

                  {po.status === 'ORDERED' && (
                    <button
                      onClick={() => handleReceiveOrder(po)}
                      disabled={receivingId === po.orderId}
                      className="glass-button-primary text-xs py-2 px-3.5 font-mono"
                    >
                      {receivingId === po.orderId ? (
                        <span className="inline-block w-4 h-4 border-2 border-[#070912] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Receive at Loading Dock</span>
                        </>
                      )}
                    </button>
                  )}

                  {po.status === 'RECEIVED' && (
                    <div className="flex items-center gap-1.5 text-xs text-[#34D399] font-mono font-bold px-3 py-1.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Stock In Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isNewOrderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-full max-w-lg glass-panel p-6 sm:p-7 shadow-2xl relative"
            >
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading font-extrabold text-xl text-white mb-5">
                Generate Inbound Purchase Order
              </h3>

              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block uppercase text-white/60 mb-1.5">
                    Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="glass-input text-xs"
                    placeholder="e.g. Apex Industrial Supply"
                  />
                </div>

                <div>
                  <label className="block uppercase text-white/60 mb-1.5">
                    Product Item
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="glass-input text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#070912] text-white">
                        [{p.sku}] {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase text-white/60 mb-1.5">
                      Order Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                      className="glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-white/60 mb-1.5">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNewOrderModalOpen(false)}
                    className="glass-button-secondary text-xs py-2 px-3.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="glass-button-primary text-xs py-2 px-3.5">
                    Dispatch Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
