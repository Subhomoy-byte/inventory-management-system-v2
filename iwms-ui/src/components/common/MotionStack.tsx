import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Database, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

interface CardItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  badge: string;
  statLabel: string;
  statValue: string;
  icon: React.ReactNode;
  accent: string;
}

const STACK_CARDS: CardItem[] = [
  {
    id: 'offline-engine',
    tag: 'EDGE RESILIENCE',
    title: 'Offline-First Outbox Engine',
    description:
      'Warehouse dead zones are handled gracefully. Floor picking, bin transfers, and stock audits queue in local IndexedDB and auto-drain on LAN reconnect.',
    badge: '100% Air-Gapped Ready',
    statLabel: 'Outbox Sync Latency',
    statValue: '0 ms Offline',
    icon: <WifiOff className="w-5 h-5 text-[#22D3EE]" />,
    accent: '#22D3EE',
  },
  {
    id: 'wal-ledger',
    tag: 'ATOMIC CONCURRENCY',
    title: 'Append-Only WAL & Time-Travel',
    description:
      'Zero external database required. Crash-safe memory state backed by AtomicFileWriter OS fsync flushes, MovementLedger, and TreeMap time reconstruction.',
    badge: 'ReentrantLock Thread-Safe',
    statLabel: 'Database License Cost',
    statValue: '$0.00 (Zero SQL)',
    icon: <Database className="w-5 h-5 text-[#7C6CFF]" />,
    accent: '#7C6CFF',
  },
  {
    id: 'rbac-masking',
    tag: 'CRYPTOGRAPHIC SECURITY',
    title: 'Dynamic RBAC & Financial Redaction',
    description:
      'PBKDF2-HMAC-SHA256 security with automatic 5-minute brute-force lockout. Unit cost prices and facility valuations are dynamically masked for floor staff.',
    badge: 'PBKDF2 Salted Auth',
    statLabel: 'Role-Based Access',
    statValue: 'Admin • Mgr • Staff',
    icon: <ShieldCheck className="w-5 h-5 text-[#34D399]" />,
    accent: '#34D399',
  },
];

export const MotionStack: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STACK_CARDS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % STACK_CARDS.length);
  };

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Upper Deck Controller */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#22D3EE] uppercase">
            System Telemetry Deck
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STACK_CARDS.map((card, i) => (
            <button
              key={card.id}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-[#7C6CFF]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`View ${card.title}`}
            />
          ))}
        </div>
      </div>

      {/* 3D Stack Container */}
      <div
        className="relative h-80 sm:h-84 cursor-pointer"
        onClick={handleNext}
        title="Click to peel card"
      >
        <AnimatePresence mode="popLayout">
          {STACK_CARDS.map((card, i) => {
            // Determine relative position in circular stack
            const offset = (i - index + STACK_CARDS.length) % STACK_CARDS.length;

            // Only render top 3 cards in stack
            if (offset > 2) return null;

            const translateY = offset * 18;
            const scale = 1 - offset * 0.06;
            const opacity = 1 - offset * 0.28;
            const zIndex = 30 - offset * 10;

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{
                  opacity,
                  y: translateY,
                  scale,
                  zIndex,
                }}
                exit={{
                  opacity: 0,
                  y: 40,
                  scale: 0.95,
                  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                }}
                className="absolute inset-x-0 top-0 p-6 sm:p-7 rounded-[28px] border border-white/12 bg-white/[0.05] backdrop-blur-xl shadow-2xl transition-colors hover:border-white/20"
                style={{
                  boxShadow:
                    offset === 0
                      ? '0 20px 40px -15px rgba(124, 108, 255, 0.2), 0 0 30px rgba(34, 211, 238, 0.08)'
                      : '0 10px 25px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10">
                      {card.icon}
                    </div>
                    <span
                      className="text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border"
                      style={{
                        color: card.accent,
                        borderColor: `${card.accent}40`,
                        backgroundColor: `${card.accent}12`,
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-white/50">
                    0{i + 1} / 0{STACK_CARDS.length}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading font-extrabold text-xl text-white tracking-tight mb-2">
                  {card.title}
                </h3>

                {/* Body */}
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-3 mb-5 font-normal">
                  {card.description}
                </p>

                {/* Metrics Footer */}
                <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-white/40">
                      {card.statLabel}
                    </span>
                    <span
                      className="font-mono font-bold text-sm"
                      style={{ color: card.accent }}
                    >
                      {card.statValue}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white font-medium">
                    <span>Peel card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtle Hint */}
      <p className="text-center text-[11px] text-white/40 font-mono mt-3">
        Hover or click to cycle system telemetry cards
      </p>
    </div>
  );
};
