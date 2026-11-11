import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Dock, type NavTab } from './components/layout/Dock';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { WarehouseMapPage } from './pages/WarehouseMapPage';
import { MovementsPage } from './pages/MovementsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CycleCountPage } from './pages/CycleCountPage';
import { ReportsPage } from './pages/ReportsPage';
import { ConflictReviewPanel } from './components/sync/ConflictReviewPanel';
import { StockMovementModal } from './components/modals/StockMovementModal';
import { CommandPalette } from './components/CommandPalette';
import { ReloadPrompt } from './components/common/ReloadPrompt';
import { OfflineSyncManager } from './storage/sync';
import { api } from './services/api';
import type { Product, MovementType } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hash, setHash] = useState<string>(() => window.location.hash);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateToLogin = () => {
    window.location.hash = '#login';
    setHash('#login');
  };

  const navigateToStory = () => {
    window.location.hash = '';
    if (window.history.pushState) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    setHash('');
  };

  // Movement modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MovementType>('IN');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const refreshCatalog = async () => {
    try {
      const data = await api.getProducts().catch(() => OfflineSyncManager.getCachedProducts());
      setAllProducts(data);
    } catch {
      const cached = await OfflineSyncManager.getCachedProducts();
      setAllProducts(cached);
    }
  };

  const updatePendingCount = async () => {
    const count = await OfflineSyncManager.getPendingCount();
    setPendingSyncCount(count);
  };

  useEffect(() => {
    OfflineSyncManager.init();
    updatePendingCount();
    refreshCatalog();

    const handleOutboxUpdate = () => {
      updatePendingCount();
      refreshCatalog();
    };

    window.addEventListener('iwms:outbox-updated', handleOutboxUpdate);
    window.addEventListener('iwms:sync-complete', handleOutboxUpdate);

    return () => {
      window.removeEventListener('iwms:outbox-updated', handleOutboxUpdate);
      window.removeEventListener('iwms:sync-complete', handleOutboxUpdate);
    };
  }, []);

  const handleOpenMovementModal = (type: MovementType, product?: Product) => {
    setModalType(type);
    setModalProduct(product || null);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    if (hash === '#login') {
      return <LoginPage onBackToOverview={navigateToStory} />;
    }
    return <LandingPage onLaunchApp={navigateToLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#070912] text-white flex flex-col pb-28 relative overflow-x-hidden selection:bg-[#7C6CFF] selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-[#7C6CFF]/12 blur-[120px]"
          style={{ animation: 'float 12s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#22D3EE]/10 blur-[130px]"
          style={{ animation: 'float 16s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full bg-[#7C6CFF]/8 blur-[140px]"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        />
      </div>

      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {currentTab === 'dashboard' && (
              <DashboardPage
                onOpenMovementModal={handleOpenMovementModal}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'inventory' && (
              <InventoryPage onOpenMovementModal={handleOpenMovementModal} />
            )}

            {currentTab === 'warehouse' && (
              <WarehouseMapPage onOpenMovementModal={handleOpenMovementModal} />
            )}

            {currentTab === 'movements' && (
              <MovementsPage />
            )}

            {currentTab === 'orders' && (
              <OrdersPage products={allProducts} onRefreshCatalog={refreshCatalog} />
            )}

            {currentTab === 'cyclecount' && (
              <CycleCountPage products={allProducts} onRefreshCatalog={refreshCatalog} />
            )}

            {currentTab === 'reports' && (
              <ReportsPage products={allProducts} />
            )}

            {currentTab === 'conflicts' && (
              <ConflictReviewPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Dock
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingSyncCount={pendingSyncCount}
      />

      <StockMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={modalProduct}
        allProducts={allProducts}
        initialType={modalType}
        onSuccess={refreshCatalog}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        products={allProducts}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
        <ReloadPrompt />
      </AuthProvider>
    </ThemeProvider>
  );
}
