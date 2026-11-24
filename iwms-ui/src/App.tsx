import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import type { NavTab } from './components/layout/Dock';
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

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Warehouse Command Center',
  inventory: 'Stock Catalog & Inventory',
  warehouse: '3D Smart Shelf & Facility Floor',
  movements: 'Audit Transaction Ledger',
  orders: 'Inbound Purchase Orders',
  cyclecount: 'Cycle Count & Reconciliation',
  reports: 'Manifests & PDF Reports',
  conflicts: 'Sync Outbox & Queue',
};

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [hash, setHash] = useState<string>(() => window.location.hash);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('iwms_sidebar_collapsed') === 'true';
  });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Movement modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<MovementType>('IN');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('iwms_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar, Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    <div className="h-screen w-screen bg-slate-50 dark:bg-[#090D14] text-slate-900 dark:text-white flex overflow-hidden selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Tactical Left Sidebar for Desktop and Tablet */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        pendingSyncCount={pendingSyncCount}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Tactical Header */}
        <Navbar
          currentTabTitle={TAB_TITLES[currentTab]}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMovementModal={handleOpenMovementModal}
          onToggleSidebar={toggleSidebar}
        />

        {/* Scrollable Main Workspace Stage */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Shared Modals */}
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
