import React from 'react';
import { motion } from 'framer-motion';

export interface VectorGraphicProps {
  size?: number;
  className?: string;
  variant?: 'ambient' | 'badge' | 'burst' | 'radar';
  interactive?: boolean;
  colorScheme?: 'cyber' | 'emerald' | 'amber' | 'rose';
}

export const VectorGraphic: React.FC<VectorGraphicProps> = ({
  size = 120,
  className = '',
  variant = 'ambient',
  interactive = true,
  colorScheme = 'cyber',
}) => {
  // Palettes tuned to the futuristic aesthetic
  const palette = {
    cyber: {
      clover: 'rgba(34, 211, 238, 0.15)',
      burst: '#070912',
      burstStroke: 'rgba(124, 108, 255, 0.4)',
      diamond: 'url(#cyberGradient)',
      glow: 'rgba(124, 108, 255, 0.35)',
    },
    emerald: {
      clover: 'rgba(52, 211, 153, 0.18)',
      burst: '#070912',
      burstStroke: 'rgba(52, 211, 153, 0.5)',
      diamond: 'url(#emeraldGradient)',
      glow: 'rgba(52, 211, 153, 0.4)',
    },
    amber: {
      clover: 'rgba(251, 191, 36, 0.16)',
      burst: '#070912',
      burstStroke: 'rgba(251, 191, 36, 0.5)',
      diamond: 'url(#amberGradient)',
      glow: 'rgba(251, 191, 36, 0.35)',
    },
    rose: {
      clover: 'rgba(248, 113, 113, 0.16)',
      burst: '#070912',
      burstStroke: 'rgba(248, 113, 113, 0.5)',
      diamond: 'url(#roseGradient)',
      glow: 'rgba(248, 113, 113, 0.35)',
    },
  }[colorScheme];

  // Rotation speeds based on variant
  const burstDuration = variant === 'burst' ? 8 : variant === 'badge' ? 14 : 20;
  const diamondDuration = variant === 'burst' ? 6 : variant === 'badge' ? 10 : 16;

  // Starburst 20-point jagged star polygon points around center (100, 100)
  const starburstPoints = (() => {
    const points: string[] = [];
    const numPoints = 20;
    const cx = 100;
    const cy = 100;
    const outerR = 78;
    const innerR = 48;

    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.sin(angle);
      const y = cy - r * Math.cos(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  })();

  return (
    <div
      className={`icon-slot select-none ${className}`}
      style={{ width: size, height: size }}
      title="IWMS Vector Motion Graphic"
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={interactive ? { scale: 1.08 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <defs>
          {/* Cyber Gradient */}
          <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C6CFF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          {/* Emerald Gradient */}
          <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Amber Gradient */}
          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Rose Gradient */}
          <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>

          {/* Ambient Glow Filter */}
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Clover / Petal Cloud Backdrop */}
        <motion.g
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
          }}
          style={{ originX: '100px', originY: '100px' }}
        >
          {/* 4 overlapping circles forming the clover */}
          <circle cx="78" cy="78" r="42" fill={palette.clover} />
          <circle cx="122" cy="78" r="42" fill={palette.clover} />
          <circle cx="122" cy="122" r="42" fill={palette.clover} />
          <circle cx="78" cy="122" r="42" fill={palette.clover} />
        </motion.g>

        {/* 2. Sharp Jagged Starburst Ring */}
        <motion.polygon
          points={starburstPoints}
          fill={palette.burst}
          stroke={palette.burstStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: burstDuration,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            originX: '100px',
            originY: '100px',
            filter: 'drop-shadow(0 0 10px rgba(124, 108, 255, 0.25))',
          }}
        />

        {/* 3. Central 4-pointed curved cyber-spark diamond */}
        <motion.path
          d="M 100 36 Q 100 100 164 100 Q 100 100 100 164 Q 100 100 36 100 Q 100 100 100 36 Z"
          fill={palette.diamond}
          filter="url(#softGlow)"
          animate={{
            rotate: -360,
            scale: [0.92, 1.08, 0.92],
          }}
          transition={{
            rotate: { duration: diamondDuration, repeat: Infinity, ease: 'linear' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            originX: '100px',
            originY: '100px',
            filter: `drop-shadow(0 0 14px ${palette.glow})`,
          }}
        />

        {/* Micro Core Spark in center */}
        <circle cx="100" cy="100" r="5" fill="#FFFFFF" opacity="0.9" />
      </motion.svg>
    </div>
  );
};
