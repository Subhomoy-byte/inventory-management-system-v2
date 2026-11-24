import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WarpFieldBackground } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

interface WarpTransitionOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  durationMs?: number;
}

export const WarpTransitionOverlay: React.FC<WarpTransitionOverlayProps> = ({
  isOpen,
  onComplete,
  title = 'HYPERSPACE JUMP ENGAGED',
  subtitle = 'ROUTING THROUGH FACILITY GATEWAY',
  durationMs = 1400,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / durationMs, 1);
      setProgress(Math.round(ratio * 100));

      if (ratio < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 120);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="warp-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#01020a] overflow-hidden select-none"
        >
          {/* Configured ThreeUI WarpFieldBackground (Hyperspace Variant) */}
          <div className="shader-frame absolute inset-0 w-full h-full">
            <WarpFieldBackground
              variant="hyperspace"
              speed={15.0}
              streakOpacity={0.60}
              tileOpacity={0.90}
              fov={75}
              hue={0}
              saturation={1.00}
              brightness={1.00}
            />
          </div>

          {/* Tactical HUD Overlay Elements */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl pointer-events-none">
            {/* Pulsing Quantum Bracket Indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs uppercase tracking-widest backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>WARP VECTOR // ACTIVE</span>
            </motion.div>

            {/* Jump Title & Subtitle */}
            <motion.h2
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-cyan-200/80 font-mono tracking-wide mt-2"
            >
              {subtitle}
            </motion.p>

            {/* Telemetry Progress Bar */}
            <div className="w-64 sm:w-80 h-1 bg-white/10 rounded-full overflow-hidden mt-6 border border-white/10 backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7C6CFF] via-[#22D3EE] to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between w-64 sm:w-80 text-[10px] font-mono text-slate-400 mt-2">
              <span>WARP-FIELD r128</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
