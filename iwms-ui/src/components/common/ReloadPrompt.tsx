import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('[PWA] Service Worker registered with scope:', r.scope);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <aside
      aria-label="Application update notification"
      className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-auto"
    >
      <div className="story-glass-card px-4 py-3 rounded-2xl flex items-center gap-3.5 shadow-2xl border border-white/20 bg-[#070912]/95 backdrop-blur-xl text-white text-sm">
        <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-ping" />
        <span className="font-sans font-medium text-slate-200">New version available.</span>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] text-[#070912] font-heading font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};
