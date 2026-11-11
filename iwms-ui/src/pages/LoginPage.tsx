import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { VectorGraphic } from '../components/common/VectorGraphic';
import { MotionStack } from '../components/common/MotionStack';
import {
  Boxes,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Radio,
  Fingerprint,
  Check,
} from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

interface LoginPageProps {
  onBackToOverview?: () => void;
}

type RoleTab = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToOverview }) => {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [activeRole, setActiveRole] = useState<RoleTab>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync role tab selection with default demo credentials
  const handleSelectRoleTab = (role: RoleTab) => {
    setActiveRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'MANAGER') {
      setUsername('manager');
      setPassword('manager123');
    } else {
      setUsername('employee');
      setPassword('emp123');
    }
  };

  const authenticateDemoUser = () => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Verify credentials for standard demo accounts
    if (trimmedUser === 'admin' && trimmedPass !== 'admin123') {
      setError('Invalid demo credentials. For Admin, use: admin123');
      return;
    }
    if (trimmedUser === 'manager' && trimmedPass !== 'manager123') {
      setError('Invalid demo credentials. For Manager, use: manager123');
      return;
    }
    if (trimmedUser === 'employee' && trimmedPass !== 'emp123') {
      setError('Invalid demo credentials. For Employee, use: emp123');
      return;
    }

    let role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' = activeRole;
    if (trimmedUser.includes('admin')) role = 'ADMIN';
    else if (trimmedUser.includes('manager')) role = 'MANAGER';
    else if (trimmedUser.includes('emp')) role = 'EMPLOYEE';

    login('demo-offline-token-' + Date.now(), {
      id: 'user-' + (trimmedUser || 'demo'),
      username: username.trim() || 'Demo Operator',
      role,
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          const data = await response.json();
          login(data.token, data.user);
          return;
        }
      }

      if (response.status === 401) {
        throw new Error('Invalid username or password');
      } else if (response.status === 423) {
        throw new Error('Account locked due to consecutive failed attempts (5 min cooldown)');
      } else if (response.status === 404 || response.status === 405 || response.status >= 500) {
        // Static hosting environment (Vercel / Netlify) fallback
        authenticateDemoUser();
        return;
      } else {
        throw new Error(`Authentication failed (${response.status})`);
      }
    } catch (err: any) {
      console.warn('Login request fallback to local auth:', err);
      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Load failed') ||
        err.message.includes('Failed to load') ||
        err.message.includes('Unexpected token') ||
        err.message.includes('is not valid JSON')
      ) {
        authenticateDemoUser();
      } else {
        setError(err.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSSO = (methodName: string) => {
    setError(null);
    authenticateDemoUser();
  };

  return (
    <div className="min-h-screen w-full bg-[#070912] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-[#7C6CFF] selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-[#7C6CFF]/15 blur-[120px]"
          style={{ animation: 'float 12s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#22D3EE]/12 blur-[130px]"
          style={{ animation: 'float 16s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute bottom-[-10rem] left-1/3 w-[30rem] h-[30rem] rounded-full bg-[#7C6CFF]/10 blur-[140px]"
          style={{ animation: 'float 20s ease-in-out infinite' }}
        />
      </div>

      {/* Top Bar Navigation */}
      <header className="relative z-20 max-w-7xl w-full mx-auto flex items-center justify-between pb-6">
        <button
          onClick={() => {
            if (onBackToOverview) {
              onBackToOverview();
            } else {
              window.location.hash = '';
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono font-semibold text-white/80 hover:text-white transition-all shadow-sm"
          title="Return to Story Overview"
        >
          <ArrowLeft className="w-4 h-4 text-[#7C6CFF]" />
          <span>← Back to Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#22D3EE]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>LAN Online • Zero Cloud DB</span>
          </div>
        </div>
      </header>

      {/* Main Dual Stage Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Futuristic Motion Stage (Jitter Stack + Vector Animation) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          {/* Brand Eyebrow with Micro Vector Graphic */}
          <div className="flex items-center gap-3">
            <div className="icon-slot w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C6CFF] to-[#22D3EE] flex items-center justify-center text-[#070912] shadow-lg shadow-[#7C6CFF]/30 ring-1 ring-white/20">
              <Boxes className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                  IWMS Pro
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#7C6CFF]/20 text-[#7C6CFF] border border-[#7C6CFF]/40">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-white/50 font-medium">
                Industrial Warehouse Management Terminal
              </p>
            </div>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            High-velocity inventory.{' '}
            <span className="bg-gradient-to-r from-[#7C6CFF] via-[#22D3EE] to-[#34D399] bg-clip-text text-transparent">
              Zero downtime.
            </span>
          </h2>

          <p className="text-sm text-white/70 leading-relaxed max-w-lg">
            Engineered with thread-safe pure Java memory models, crash-proof append-only Write-Ahead Logs, and an offline Progressive Web App client.
          </p>

          {/* Interactive 3D Motion Stack with Vector Background Accent */}
          <div className="relative pt-2">
            {/* Background Ambient Vector Animation */}
            <div className="absolute -top-10 -right-6 pointer-events-none opacity-40">
              <VectorGraphic size={160} variant="ambient" colorScheme="cyber" />
            </div>

            {/* Jitter Template 1 3D Stack */}
            <MotionStack />
          </div>
        </div>

        {/* Right Column: Glassmorphic Auth Terminal */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-panel p-7 sm:p-9 shadow-2xl relative">
            {/* Corner Decorative Vector Slot */}
            <div className="absolute top-4 right-4 pointer-events-none opacity-60">
              <VectorGraphic size={48} variant="badge" colorScheme="cyber" />
            </div>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-[#22D3EE] mb-2">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Secure Authentication Terminal</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
                Sign in to Warehouse
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Select your operational role and credentials to proceed.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="mb-6 p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-1 relative">
              {(
                [
                  { id: 'ADMIN', label: 'Admin', sub: 'Full Access' },
                  { id: 'MANAGER', label: 'Manager', sub: 'Operations' },
                  { id: 'EMPLOYEE', label: 'Staff', sub: 'Floor View' },
                ] as const
              ).map((tab) => {
                const isSelected = activeRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectRoleTab(tab.id)}
                    className={`relative flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 text-center z-10 ${
                      isSelected
                        ? 'text-[#070912] font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRoleIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-[#7C6CFF] to-[#22D3EE] rounded-xl shadow-md shadow-[#7C6CFF]/30 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 p-3.5 rounded-2xl bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-xs font-semibold flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="glass-input pl-10 text-sm"
                    placeholder="operator@iwmspro.local"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input pl-10 pr-10 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#7C6CFF] focus:ring-[#7C6CFF] focus:ring-offset-0"
                  />
                  <span>Remember session on local device</span>
                </label>

                <span className="text-[11px] font-mono text-[#7C6CFF]">PBKDF2 Salted</span>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full glass-button-primary mt-2 py-3 text-sm font-heading font-extrabold"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#070912] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Presets */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/50 font-mono mb-2.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7C6CFF]" />
                  <span>1-Click Preset Roles:</span>
                </span>
                <span className="text-[10px] text-white/40">Auto-fills pass</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('ADMIN')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-mono transition-all border text-center ${
                    activeRole === 'ADMIN'
                      ? 'bg-[#7C6CFF]/20 border-[#7C6CFF] text-white'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="block font-bold">Admin</span>
                  <span className="text-[10px] opacity-60">admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('MANAGER')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-mono transition-all border text-center ${
                    activeRole === 'MANAGER'
                      ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-white'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="block font-bold">Manager</span>
                  <span className="text-[10px] opacity-60">manager123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('EMPLOYEE')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-mono transition-all border text-center ${
                    activeRole === 'EMPLOYEE'
                      ? 'bg-[#34D399]/20 border-[#34D399] text-white'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="block font-bold">Staff</span>
                  <span className="text-[10px] opacity-60">emp123</span>
                </button>
              </div>

              {/* Alternative Sign-In Options */}
              <div className="mt-4 pt-3 flex items-center justify-between gap-2 text-[11px] text-white/50">
                <button
                  type="button"
                  onClick={() => handleSimulateSSO('RFID')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3 h-3 text-[#22D3EE]" />
                  <span>Keycard RFID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSSO('Biometric')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Fingerprint className="w-3 h-3 text-[#7C6CFF]" />
                  <span>Biometric</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto text-center text-xs text-white/40 font-mono py-4 border-t border-white/5">
        IWMS Pro &bull; Offline-First Progressive Web App &bull; Zero Cloud Database Requirement &bull; 100% Free Open-Source
      </footer>
    </div>
  );
};
