import React, { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  FileText,
  Clock,
  WifiOff,
  CheckCircle2,
  ChevronDown,
  Lock,
  GitBranch,
  FileSpreadsheet,
  Sparkles,
  Server,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

// Reusable responsive video component with IntersectionObserver and bottom-right corner preservation
interface ResponsiveVideoProps {
  baseName: string; // e.g. "hero-warehouse-build"
  poster: string;
  loop?: boolean;
  autoPlay?: boolean;
  playOnView?: boolean;
  pauseWhenOffscreen?: boolean;
  className?: string;
  overlayOpacity?: number; // 0 to 1
  ariaLabel: string;
}

const ResponsiveVideo: React.FC<ResponsiveVideoProps> = ({
  baseName,
  poster,
  loop = true,
  autoPlay = true,
  playOnView = false,
  pauseWhenOffscreen = true,
  className = '',
  overlayOpacity = 0,
  ariaLabel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setVideoError(false);
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const videoSrc = isMobile
    ? `/videos/${baseName}-720.mp4`
    : `/videos/${baseName}.mp4`;

  useEffect(() => {
    if (isOffline || videoError) return;

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Ensure video is muted so browser autoplay & looping policies succeed
    video.muted = true;

    if (autoPlay) {
      video.play().catch(() => {});
    }

    if (!playOnView && !pauseWhenOffscreen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (video.ended) {
              video.currentTime = 0;
            }
            video.play().catch(() => {});
          } else {
            if (pauseWhenOffscreen) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [playOnView, pauseWhenOffscreen, loop, autoPlay, isOffline, videoError]);

  const handleEnded = () => {
    if (loop && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-[28px] overflow-hidden border border-white/10 bg-white/[0.03] ${className}`}
    >
      {isOffline || videoError ? (
        <img
          src={`/videos/${poster}`}
          alt={ariaLabel}
          loading="lazy"
          className="w-full h-full object-contain mx-auto block"
        />
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={`/videos/${poster}`}
          muted
          playsInline
          autoPlay={autoPlay}
          loop={loop}
          aria-label={ariaLabel}
          preload="metadata"
          onEnded={handleEnded}
          onError={() => setVideoError(true)}
          className="w-full h-full object-contain mx-auto block"
        />
      )}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-[#070912] pointer-events-none transition-opacity"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070912] text-slate-100 font-sans relative selection:bg-[#7C6CFF] selection:text-white overflow-x-hidden">
      {/* Background ambient lighting - strictly transform-only animated blobs for 90+ Lighthouse mobile */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-[#7C6CFF]/15 blur-[120px] will-change-transform"
          style={{ animation: 'float 12s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#22D3EE]/12 blur-[120px] will-change-transform"
          style={{ animation: 'float 15s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full bg-[#7C6CFF]/10 blur-[130px] will-change-transform"
          style={{ animation: 'float 18s ease-in-out infinite' }}
        />
      </div>

      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 backdrop-blur-xl bg-[#070912]/80 border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C6CFF] to-[#22D3EE] flex items-center justify-center text-white shadow-lg shadow-[#7C6CFF]/25 ring-1 ring-white/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                  IWMS Pro
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#7C6CFF]/15 text-[#7C6CFF] border border-[#7C6CFF]/30">
                  Java Core
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
            <button
              onClick={() => scrollToSection('problem')}
              className="hover:text-white transition-colors"
            >
              The Problem
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="hover:text-white transition-colors"
            >
              One Command
            </button>
            <button
              onClick={() => scrollToSection('floormap')}
              className="hover:text-white transition-colors"
            >
              Floor Map
            </button>
            <button
              onClick={() => scrollToSection('offline')}
              className="hover:text-white transition-colors"
            >
              Offline PWA
            </button>
            <button
              onClick={() => scrollToSection('timetravel')}
              className="hover:text-white transition-colors"
            >
              Time Travel
            </button>
            <button
              onClick={() => scrollToSection('underthehood')}
              className="hover:text-white transition-colors"
            >
              Under The Hood
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] text-[#070912] font-heading font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#7C6CFF]/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Try the live demo
            </button>
          </div>
        </div>
      </header>

      {/* Main 11 Sections Content */}
      <main className="relative z-10">
        {/* ========================================================
            SECTION 1: HERO
            ======================================================== */}
        <section
          id="hero"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-medium text-[#22D3EE]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Logistics Platform</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-white">
                The warehouse that <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#7C6CFF] via-white to-[#22D3EE] bg-clip-text text-transparent">
                  never goes offline.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
                IWMS Pro: inventory and warehouse management, built in Java.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] text-[#070912] font-heading font-bold text-base shadow-xl hover:shadow-[#7C6CFF]/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5"
                >
                  <span>Try the live demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => scrollToSection('problem')}
                  className="px-8 py-4 rounded-2xl story-glass-card hover:bg-white/[0.09] text-white font-heading font-semibold text-base transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore the story</span>
                  <ChevronDown className="w-4 h-4 text-[#22D3EE]" />
                </button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                  <span>Real Java Core</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C6CFF]" />
                  <span>Offline PWA Shell</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full Demo Mode</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <ResponsiveVideo
                baseName="hero-warehouse-build"
                poster="hero-warehouse-build-poster.webp"
                autoPlay={true}
                loop={true}
                pauseWhenOffscreen={true}
                ariaLabel="Warehouse automated building process"
                className="aspect-video w-full shadow-2xl"
              />
              <div className="relative rounded-[28px] overflow-hidden border border-white/10 story-glass-card p-2">
                <img
                  src="/images/hero-warehouse-glass-01.jpg"
                  alt="Glass warehouse infrastructure view"
                  loading="lazy"
                  className="w-full h-auto rounded-[22px] object-contain block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: PROBLEM
            ======================================================== */}
        <section
          id="problem"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#7C6CFF]">
              02 / The Disconnected Reality
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Warehouse concrete stops signals dead.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Concrete tilt-up walls, high-density metal pallet racking, and insulated refrigeration create RF dead zones. Standard cloud ERPs fail the moment a forklift driver turns down aisle four.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <ResponsiveVideo
                baseName="problem-truck-drive"
                poster="problem-truck-drive-poster.webp"
                autoPlay={true}
                playOnView={true}
                loop={true}
                pauseWhenOffscreen={true}
                overlayOpacity={0.6}
                ariaLabel="Logistics transport entering distribution bay"
                className="aspect-video w-full shadow-2xl"
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="story-glass-card p-6 sm:p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <WifiOff className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white">
                  The Latency & Dropout Trap
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  When picking terminals require constant server round-trips, workers wait on spinners or fall back to paper clipboards. By the end of the shift, physical floor stock and digital ledgers drift apart.
                </p>
              </div>

              <div className="relative rounded-[28px] overflow-hidden border border-white/10 story-glass-card p-2">
                <img
                  src="/images/logistics-trucks-dock-top-01.jpg"
                  alt="Overhead logistics dock bays"
                  loading="lazy"
                  className="w-full h-auto rounded-[22px] object-contain block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: ONE COMMAND
            ======================================================== */}
        <section
          id="architecture"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#22D3EE]">
              03 / Deployment Simplicity
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              One command. Zero external database engines.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              No PostgreSQL setup, no Redis cluster to configure, and no separate schema migration scripts. The application runs entirely as an autonomous single-process Java runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-white/10 bg-[#0c101d] p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400">bash / powershell</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#22D3EE]">Spring Boot 3 + Java 17</span>
                </div>

                <div className="font-mono text-sm space-y-3 leading-relaxed">
                  <p className="text-slate-500"># 1. Run directly with embedded runtime</p>
                  <p className="text-[#22D3EE] font-semibold">
                    java -jar iwms.jar --server.port=8443
                  </p>
                  <p className="text-slate-500 pt-2"># Or deploy with multi-stage Docker container</p>
                  <p className="text-[#7C6CFF] font-semibold">
                    docker build -t iwms-pro . &amp;&amp; docker run -d -p 8443:8443 iwms-pro
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-white/[0.04] text-xs text-slate-400 space-y-1">
                    <p className="text-emerald-400">✓ In-memory HashMap &amp; TreeMap guarded by ReentrantReadWriteLock</p>
                    <p className="text-emerald-400">✓ File-backed catalog repository bound to data/products.json</p>
                    <p className="text-emerald-400">✓ Append-only disk ledger active on data/ledger.log</p>
                    <p className="text-slate-300">→ Ready on http://localhost:8443</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="story-glass-card p-6 sm:p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white">
                  Self-Contained Storage
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The backend uses an atomic file-backed repository (`FileBackedRepository`) and write-ahead log (`MovementLedger`). It runs smoothly on everything from cloud servers to a $35 Raspberry Pi on the factory floor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: LIVE DASHBOARD (PLACEHOLDER)
            ======================================================== */}
        <section
          id="dashboard-preview"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#7C6CFF]">
              04 / Operations Command
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              High-density glass dashboard.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Real-time warehouse occupancy, valuation totals, low-stock reorder triggers, and velocity trends grouped into a focused single pane.
            </p>
          </div>

          <div className="story-glass-card p-6 sm:p-10 border-dashed border-white/20 relative">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7C6CFF]/15 border border-[#7C6CFF]/30 text-[#7C6CFF] flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40">
                  DASHBOARD SCREENSHOT PLACEHOLDER
                </span>
                <p className="text-sm text-slate-400 max-w-md">
                  Active operations monitor: KPI Cards (Total Products, Stock Counts, Low Stock Warnings, Valuation), Recharts Category Distribution, and Recent Movement Activity.
                </p>
              </div>
              <button
                onClick={onLaunchApp}
                className="mt-2 text-xs font-heading font-bold text-[#22D3EE] hover:underline flex items-center gap-1.5"
              >
                <span>Preview live interface in demo mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 5: FLOOR MAP
            ======================================================== */}
        <section
          id="floormap"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#22D3EE]">
              05 / 2D Facility Topology
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Coordinate grid for zones and physical bins.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Warehouse topological hierarchy model: Warehouse &rarr; Zones &rarr; Bins. Each bin strictly monitors item capacity units and maximum structural weight limits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <ResponsiveVideo
                baseName="floor-conveyor-boxes"
                poster="floor-conveyor-boxes-poster.webp"
                autoPlay={true}
                playOnView={true}
                loop={true}
                pauseWhenOffscreen={true}
                ariaLabel="Automated floor conveyor moving storage bins"
                className="aspect-video w-full shadow-2xl"
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="story-glass-card p-6 space-y-3">
                <span className="text-xs font-mono text-[#22D3EE] font-bold">ZONE A: AMBIENT</span>
                <h4 className="font-heading font-semibold text-white">General &amp; Bulk Storage</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bins A-01 through A-06 for non-perishable goods, hardware, and bulk dry commodities.
                </p>
              </div>

              <div className="story-glass-card p-6 space-y-3">
                <span className="text-xs font-mono text-cyan-400 font-bold">ZONE B: COLD STORAGE</span>
                <h4 className="font-heading font-semibold text-white">Refrigeration &amp; Perishables</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bins B-01 through B-04 for temperature-controlled products with FEFO pick allocation.
                </p>
              </div>

              <div className="story-glass-card p-6 space-y-3">
                <span className="text-xs font-mono text-[#7C6CFF] font-bold">ZONE C: HIGH SECURITY</span>
                <h4 className="font-heading font-semibold text-white">Electronics Vault</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bins C-01 through C-04 with access tracking for computing and valuable components.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: OFFLINE-FIRST
            ======================================================== */}
        <section
          id="offline"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#7C6CFF]">
              06 / Client Edge Resilience
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              IndexedDB outbox with auto-drain replay.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              When the browser loses internet connection, the UI does not lock up. Workers continue recording inbound, outbound, and bin transfers locally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="story-glass-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7C6CFF]/15 border border-[#7C6CFF]/30 text-[#7C6CFF] flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">1. Local Caching</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The entire product catalog and warehouse topology are cached locally in browser IndexedDB via `idb`, enabling full offline browsing and searching.
              </p>
            </div>

            <div className="story-glass-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 text-[#22D3EE] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">2. Mutation Outbox</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Stock movements staged offline are stamped with a unique `syncId` and queued in an IndexedDB outbox store without blocking the operator.
              </p>
            </div>

            <div className="story-glass-card p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">3. Auto Replay &amp; Conflict Review</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upon reconnection, `window.addEventListener('online')` triggers `drainQueue()`, posting idempotent batches. Any deficit conflicts are flagged for review.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: TIME TRAVEL
            ======================================================== */}
        <section
          id="timetravel"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#22D3EE]">
              07 / Historical Ledger &amp; Undo
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Scrubbable history &amp; LIFO undo stack.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Auditing physical inventory shouldn't require guessing. Query exact stock levels at any past minute using chronological timeline indexing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="story-glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 text-[#22D3EE] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">TreeMap Time-Travel</h3>
                  <p className="text-xs font-mono text-slate-400">`java.util.TreeMap&lt;Instant, List&lt;StockMovement&gt;&gt;`</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Movements are stored in chronological order. Querying historical inventory uses `TreeMap.headMap(targetInstant)` to replay state up to that millisecond, reproducing the exact quantity in each bin.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-slate-300 space-y-1">
                <span className="text-slate-500">// Java Core Implementation</span>
                <p className="text-[#22D3EE]">SortedMap&lt;Instant, List&lt;StockMovement&gt;&gt; past = ledgerTimeline.headMap(asOf);</p>
              </div>
            </div>

            <div className="story-glass-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7C6CFF]/15 border border-[#7C6CFF]/30 text-[#7C6CFF] flex items-center justify-center">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">ArrayDeque LIFO Undo</h3>
                  <p className="text-xs font-mono text-slate-400">`java.util.Deque&lt;StockMovement&gt; undoStack`</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Made a mistake during dock receiving or bin transfer? Authorized managers can click Undo. The system pops the top movement from `ArrayDeque` and applies the exact mathematical inverse.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-slate-300 space-y-1">
                <span className="text-slate-500">// Immediate Rollback</span>
                <p className="text-[#7C6CFF]">StockMovement last = undoStack.pop();</p>
                <p className="text-slate-400">applyInverseMovement(last);</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 8: ROLES (RBAC)
            ======================================================== */}
        <section
          id="roles"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#7C6CFF]">
              08 / Role-Based Security
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Strict 3-tier access control &amp; cost masking.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Clean separation of responsibilities enforced at both the Java controller layer and the UI component level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="story-glass-card p-8 space-y-5 border-t-4 border-t-rose-500">
              <span className="text-xs font-mono font-bold text-rose-400">ADMINISTRATOR</span>
              <h3 className="font-heading font-bold text-2xl text-white">Full Operations</h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>View all supplier costs &amp; margins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Trigger ZIP archive backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Inspect complete system audit trail</span>
                </li>
              </ul>
            </div>

            <div className="story-glass-card p-8 space-y-5 border-t-4 border-t-blue-500">
              <span className="text-xs font-mono font-bold text-blue-400">MANAGER</span>
              <h3 className="font-heading font-bold text-2xl text-white">Floor Supervision</h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Receive and verify Purchase Orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Reconcile cycle counts &amp; variances</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>LIFO Undo movement rollback</span>
                </li>
              </ul>
            </div>

            <div className="story-glass-card p-8 space-y-5 border-t-4 border-t-emerald-500">
              <span className="text-xs font-mono font-bold text-emerald-400">EMPLOYEE</span>
              <h3 className="font-heading font-bold text-2xl text-white">Floor Associate</h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Perform stock-in, stock-out, and transfers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Floor barcode scanning &amp; counts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300 font-semibold">Cost prices masked (Hidden)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 9: PDF REPORT
            ======================================================== */}
        <section
          id="reports"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#22D3EE]">
              09 / Audit Documentation
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              OpenPDF count sheets &amp; CSV export.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Physical inventory counts require paper documentation for regulatory compliance. The Java backend streams high-contrast monochrome A4 count sheets directly to the browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="story-glass-card p-8 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 text-[#22D3EE] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-white">
                Monochrome A4 Floor Sheets
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Generated via OpenPDF (`PdfReportGenerator`). Specifically designed without heavy ink fills so warehouse managers can print hundreds of sheets cleanly on any commercial laser printer.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.04] text-xs font-mono text-slate-400">
                Endpoint: GET /api/reports/summary.pdf
              </div>
            </div>

            <div className="story-glass-card p-8 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-[#7C6CFF]/15 border border-[#7C6CFF]/30 text-[#7C6CFF] flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-white">
                CSV Catalog Export
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Standard comma-separated value streaming (`CsvReportGenerator`) compatible with Excel, SAP, or ERP integrations.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.04] text-xs font-mono text-slate-400">
                Endpoint: GET /api/reports/catalog.csv
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 10: UNDER THE HOOD (JAVA CONCEPTS)
            ======================================================== */}
        <section
          id="underthehood"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="space-y-4 mb-12">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#7C6CFF]">
              10 / Computer Science Architecture
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Under the hood: Pure Java OOP &amp; Collections.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-3xl">
              Engineered as an academic demonstration of thread safety, polymorphism, design patterns, and idiomatic Java Collections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
            <div className="lg:col-span-6">
              <div className="relative rounded-[28px] overflow-hidden border border-white/10 story-glass-card p-2 shadow-2xl">
                <img
                  src="/images/underhood-warehouse-hologram-01.jpg"
                  alt="Holographic warehouse digital twin architecture"
                  loading="lazy"
                  className="w-full h-auto rounded-[22px] object-contain block"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="story-glass-card p-6 space-y-2">
                <div className="flex items-center gap-2 text-[#7C6CFF] font-mono text-xs font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>CONCURRENCY: REENTRANTREADWRITELOCK</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Multiple read requests run concurrently without blocking. Writers acquire an exclusive write lock to mutate inventory with memory-barrier visibility.
                </p>
              </div>

              <div className="story-glass-card p-6 space-y-2">
                <div className="flex items-center gap-2 text-[#22D3EE] font-mono text-xs font-bold">
                  <Database className="w-4 h-4" />
                  <span>COLLECTIONS: HASHMAP, TREEMAP, ARRAYDEQUE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  `HashMap` yields O(1) SKU lookups; `TreeMap` powers chronological headMap queries; `ArrayDeque` serves as the LIFO undo stack; `PriorityQueue` sorts urgency alerts.
                </p>
              </div>

              <div className="story-glass-card p-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <GitBranch className="w-4 h-4" />
                  <span>STRATEGY PATTERN &amp; INHERITANCE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pluggable `PickStrategy` (`FifoPickStrategy`, `FefoPickStrategy`). Polymorphic product hierarchy: `PerishableProduct`, `ElectronicProduct`, `FragileProduct`, `BulkProduct`.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 11: FINAL CALL TO ACTION
            ======================================================== */}
        <section
          id="cta"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto"
        >
          <div className="story-glass-card p-8 sm:p-14 text-center relative space-y-10">
            <div className="max-w-2xl mx-auto space-y-6">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#22D3EE]">
                11 / Launch Platform
              </span>

              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Experience the terminal in action.
              </h2>

              <p className="text-slate-300 text-base sm:text-lg">
                Explore the complete demo mode right inside your browser with pre-loaded inventory, 2D floor maps, and offline mutations.
              </p>
            </div>

            {/* Final Visual Feature - Dimmed with sparkle mark kept visible */}
            <div className="max-w-4xl mx-auto relative rounded-[28px] overflow-hidden border border-white/10 p-2 bg-white/[0.03]">
              <div className="relative rounded-[22px] overflow-hidden">
                <img
                  src="/images/final-warehouse-night-01.jpg"
                  alt="Warehouse distribution hub at night"
                  loading="lazy"
                  className="w-full h-auto max-h-[420px] object-contain mx-auto block brightness-75 contrast-125"
                />
                <div className="absolute inset-0 bg-[#070912]/40 pointer-events-none" />
              </div>
            </div>

            {/* Accents row (used sparingly) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden border border-white/10 p-2 bg-white/[0.04]">
                <img
                  src="/images/orders-pallet-glow-01.jpg"
                  alt="Pallet goods glow"
                  loading="lazy"
                  className="w-full h-24 object-contain rounded-xl mx-auto"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 p-2 bg-white/[0.04]">
                <img
                  src="/images/logistics-truck-hero-01.jpg"
                  alt="Logistics transport"
                  loading="lazy"
                  className="w-full h-24 object-contain rounded-xl mx-auto"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 p-2 bg-white/[0.04]">
                <img
                  src="/images/logistics-trucks-dock-side-01.jpg"
                  alt="Dock logistics side view"
                  loading="lazy"
                  className="w-full h-24 object-contain rounded-xl mx-auto"
                />
              </div>
            </div>

              <div className="pt-4">
                <button
                  onClick={onLaunchApp}
                  className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] text-[#070912] font-heading font-extrabold text-lg shadow-2xl hover:shadow-[#7C6CFF]/40 hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center gap-3"
                >
                  <span>Try the live demo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-mono pt-4">
                Default demo accounts: admin / admin123 • manager / manager123 • employee / emp123
              </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/10 text-center text-xs text-slate-500 font-mono space-y-2">
        <p>Visuals generated with AI (Google Flow)</p>
        <p className="text-[11px] text-slate-600">
          IWMS Pro — Academic Java Warehouse &amp; Inventory Management System
        </p>
      </footer>
    </div>
  );
};
