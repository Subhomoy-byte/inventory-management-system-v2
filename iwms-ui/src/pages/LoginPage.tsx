import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
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
  Database,
  Wifi,
  Sun,
  Moon,
} from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

interface LoginPageProps {
  onBackToOverview?: () => void;
  onLoginRequest?: (performLogin: () => void) => void;
}

type RoleTab = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToOverview, onLoginRequest }) => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const executeLogin = (token: string, user: any) => {
    if (onLoginRequest) {
      onLoginRequest(() => login(token, user));
    } else {
      login(token, user);
    }
  };

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

    executeLogin('demo-offline-token-' + Date.now(), {
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
          executeLogin(data.token, data.user);
          return;
        }
      }

      if (response.status === 401) {
        throw new Error('Invalid username or password');
      } else if (response.status === 423) {
        throw new Error('Account locked due to consecutive failed attempts (5 min cooldown)');
      } else if (response.status === 404 || response.status === 405 || response.status >= 500) {
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

  const handleSimulateSSO = (_methodName?: string) => {
    setError(null);
    authenticateDemoUser();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#090D14] text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-white/[0.06]">
        <button
          onClick={() => {
            if (onBackToOverview) {
              onBackToOverview();
            } else {
              window.location.hash = '';
            }
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] hover:bg-slate-100 dark:hover:bg-[#161E30] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs"
          title="Return to Story Overview"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Back to Product Story</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726] hover:bg-slate-100 dark:hover:bg-[#182035] text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>Local Engine &bull; Zero External DB</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Industrial Proposition */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm">
              <img src="/favicon.svg" alt="IWMS Pro Warehouse Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                  IWMS Pro
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Industrial Warehouse Management Terminal
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            High-velocity inventory operations with zero cloud dependencies.
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
            Engineered with thread-safe pure Java memory models, crash-proof append-only Write-Ahead Logs, and an offline-first Progressive Web App client for Wi-Fi dead zones.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.06] shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
                <Database className="w-4 h-4" />
                <span>Append-Only WAL</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Immutable fsync ledger logging all movements without SQL overhead.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-white/[0.06] shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
                <Wifi className="w-4 h-4" />
                <span>IndexedDB Outbox</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Floor associate transactions queue locally and sync automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Auth Terminal */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="surface-panel p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mb-2">
                <Radio className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>Operator Terminal Auth</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sign in to Warehouse OS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your assigned workstation role and enter credentials.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="mb-5 p-1 rounded-xl bg-slate-100 dark:bg-[#090D14] border border-slate-200 dark:border-white/[0.08] flex items-center gap-1">
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
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Operator Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="surface-input pl-9 text-xs"
                    placeholder="operator"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="surface-input pl-9 pr-9 text-xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-white dark:bg-[#141B2D] border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Store session locally</span>
                </label>

                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">PBKDF2 Salted</span>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-2 py-2.5 text-xs font-semibold"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Presets */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>1-Click Preset Roles:</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Auto-fills credentials</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('ADMIN')}
                  className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                    activeRole === 'ADMIN'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'bg-slate-100 dark:bg-[#090D14] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="block">Admin</span>
                  <span className="text-[10px] opacity-70">admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('MANAGER')}
                  className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                    activeRole === 'MANAGER'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'bg-slate-100 dark:bg-[#090D14] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="block">Manager</span>
                  <span className="text-[10px] opacity-70">manager123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoleTab('EMPLOYEE')}
                  className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                    activeRole === 'EMPLOYEE'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold'
                      : 'bg-slate-100 dark:bg-[#090D14] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="block">Staff</span>
                  <span className="text-[10px] opacity-70">emp123</span>
                </button>
              </div>

              {/* Alternative Sign-In Options */}
              <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => handleSimulateSSO('RFID')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#090D14] dark:hover:bg-[#141B2D] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center gap-1.5 transition-colors text-slate-700 dark:text-slate-300"
                >
                  <KeyRound className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>Keycard RFID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateSSO('Biometric')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#090D14] dark:hover:bg-[#141B2D] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center gap-1.5 transition-colors text-slate-700 dark:text-slate-300"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Biometric</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto text-center text-xs text-slate-500 font-mono py-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        IWMS Pro &bull; Offline-First Progressive Web App &bull; Zero External Database Requirement &bull; 100% Free Open-Source
      </footer>
    </div>
  );
};
