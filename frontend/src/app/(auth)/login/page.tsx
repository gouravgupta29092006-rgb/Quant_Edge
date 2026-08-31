'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

/* ── Stats for brand panel ──────────────────────────────────────── */
const STATS = [
  { label: 'Virtual Capital', value: '$100K', sub: 'to start trading' },
  { label: 'Live Market Data', value: 'Real-time', sub: 'market quotes' },
  { label: 'AI Analytics', value: 'Gemini', sub: 'powered insights' },
  { label: 'Strategies', value: 'Backtest', sub: 'any strategy' },
];

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const satisfies import('framer-motion').Variants;
const item = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
} as const satisfies import('framer-motion').Variants;

/* ── Brand Panel (left column) ───────────────────────────────────── */
function BrandPanel() {
  const shouldReduce = useReducedMotion();
  return (
    <div
      className="hidden lg:flex flex-col justify-between h-full p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #050810 0%, #0C0F1E 60%, #060910 100%)' }}
    >
      {/* Animated mesh glows */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }}
          animate={shouldReduce ? {} : { scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      <motion.div
        className="relative space-y-8"
        variants={stagger} initial="hidden" animate="visible"
      >
        {/* Logo */}
        <motion.div variants={item} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.55)' }}>
            <span className="text-white font-bold text-lg font-display">Q</span>
          </div>
          <span className="text-xl font-bold font-display text-gradient">QuantEdge</span>
        </motion.div>

        {/* Hero copy */}
        <motion.div variants={item} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand/15 border border-brand/30 text-brand-400">
            <span className="live-dot" /> Paper Trading Platform
          </div>
          <h1 className="text-4xl font-bold leading-tight font-display text-text-primary">
            Trade smarter.<br />
            <span className="text-gradient">Risk nothing.</span>
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary max-w-xs">
            Practice trading strategies with $100,000 virtual capital. Real market data, zero real risk.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          {STATS.map(({ label, value, sub }) => (
            <div key={label} className="p-4 rounded-2xl glass">
              <div className="text-[11px] font-medium text-text-muted mb-1">{label}</div>
              <div className="text-lg font-bold font-display text-text-primary">{value}</div>
              <div className="text-xs text-text-muted">{sub}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="relative text-xs text-text-disabled"
      >
        QuantEdge · For educational use only · No real money involved
      </motion.p>
    </div>
  );
}

const formStagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const satisfies import('framer-motion').Variants;
const formItem = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
} as const satisfies import('framer-motion').Variants;

/* ── Login Page ─────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [twoFaCode,     setTwoFaCode]     = useState('');
  const [interimToken,  setInterimToken]  = useState<string | null>(null);
  const [localError,    setLocalError]    = useState('');
  const shouldReduce = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); setLocalError('');
    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) { setInterimToken(result.interimToken || null); }
      else { router.push('/dashboard'); }
    } catch { /* error shown via store */ }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-base">
      <BrandPanel />

      {/* Right — form panel */}
      <motion.div
        className="flex flex-col items-center justify-center px-6 py-12 bg-bg-base"
        initial={shouldReduce ? undefined : { opacity: 0, x: 20 }}
        animate={shouldReduce ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mobile logo */}
        <motion.div
          className="flex lg:hidden items-center gap-2 mb-10"
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            <span className="text-white font-bold font-display">Q</span>
          </div>
          <span className="text-xl font-bold font-display text-gradient">QuantEdge</span>
        </motion.div>

        <div className="w-full max-w-sm">
          <motion.div variants={formStagger} initial="hidden" animate="visible" className="space-y-6">
            {/* Heading */}
            <motion.div variants={formItem} className="space-y-1">
              <h2 className="text-2xl font-bold font-display text-text-primary">Welcome back</h2>
              <p className="text-sm text-text-secondary">Sign in to your trading account</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {interimToken ? (
                /* 2FA step */
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                  className="card p-6 space-y-4"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-brand/10">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">Two-factor authentication</p>
                    <p className="text-xs mt-1 text-text-secondary">Enter your 6-digit authenticator code</p>
                  </div>
                  <input
                    id="two-fa-code" type="text" inputMode="numeric" maxLength={6}
                    className="input text-center text-2xl tracking-widest font-mono"
                    placeholder="000000" value={twoFaCode}
                    onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                  <motion.button
                    type="button" className="btn-primary w-full" disabled={twoFaCode.length !== 6}
                    whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  >
                    Verify
                  </motion.button>
                </motion.div>
              ) : (
                /* Login form */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {displayError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-3 rounded-xl text-sm bg-danger/8 border border-danger/20 text-danger overflow-hidden"
                      >
                        {displayError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <motion.div variants={formItem} className="space-y-1.5">
                    <label htmlFor="login-email" className="metric-label block">Email Address</label>
                    <input
                      id="login-email" type="email" required autoComplete="email"
                      className="input" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={formItem} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="metric-label">Password</label>
                      <Link href="/forgot-password" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password" type={showPassword ? 'text' : 'password'}
                        required autoComplete="current-password"
                        className="input pr-10" placeholder="••••••••"
                        value={password} onChange={e => setPassword(e.target.value)}
                      />
                      <motion.button
                        type="button" tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                        onClick={() => setShowPassword(s => !s)}
                        whileTap={shouldReduce ? {} : { scale: 0.9 }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d={showPassword
                              ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.button
                    id="login-submit" type="submit"
                    className="btn-primary w-full !py-3"
                    disabled={isLoading}
                    whileHover={shouldReduce ? {} : { scale: 1.02 }}
                    whileTap={shouldReduce ? {} : { scale: 0.97 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Signing in…
                      </span>
                    ) : 'Sign in'}
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-text-muted">New to QuantEdge?</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Link
                    href="/register"
                    className="btn-secondary w-full text-center block"
                  >
                    Create free account
                  </Link>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-8 text-xs text-center text-text-disabled"
          >
            For educational use only · No real money involved
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
