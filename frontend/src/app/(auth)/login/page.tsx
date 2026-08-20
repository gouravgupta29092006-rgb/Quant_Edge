'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/* ── Shared brand panel ─────────────────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #080A14 0%, #0C0F1E 60%, #060910 100%)' }}>

      {/* Mesh glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.6)' }}>
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Q</span>
        </div>
        <span className="text-xl font-bold" style={{
          fontFamily: 'Outfit, sans-serif',
          background: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>QuantEdge</span>
      </div>

      {/* Central hero */}
      <div className="relative space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}>
            <span className="live-dot" />
            Paper Trading Platform
          </div>
          <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
            Trade smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Risk nothing.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8896B3', maxWidth: '320px' }}>
            Practice trading strategies with $100,000 virtual capital. Real market data, zero real risk.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Virtual Capital', value: '$100K', sub: 'to start' },
            { label: 'Live Market Data', value: 'Real-time', sub: 'quotes' },
            { label: 'AI Analysis', value: 'Powered', sub: 'by Gemini' },
            { label: 'Strategies', value: 'Backtest', sub: 'any strategy' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="p-4 rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(12,14,21,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#4E5A7A' }}>{label}</div>
              <div className="text-lg font-bold" style={{
                fontFamily: 'Outfit, sans-serif', color: '#F0F4FF',
              }}>{value}</div>
              <div className="text-xs" style={{ color: '#4E5A7A' }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="relative text-xs" style={{ color: '#2D3A5E' }}>
        QuantEdge · For educational use only · No real money involved
      </p>
    </div>
  );
}

/* ── Login Page ─────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [interimToken, setInterimToken] = useState<string | null>(null);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) {
        setInterimToken(result.interimToken || null);
      } else {
        router.push('/dashboard');
      }
    } catch { /* error shown via store */ }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#05060A' }}>
      {/* Left — brand panel */}
      <BrandPanel />

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 animate-fade-up"
        style={{ background: '#05060A' }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            <span className="text-white font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Q</span>
          </div>
          <span className="text-xl font-bold text-gradient" style={{ fontFamily: 'Outfit, sans-serif' }}>QuantEdge</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: '#8896B3' }}>Sign in to your trading account</p>
          </div>

          {/* 2FA step */}
          {interimToken ? (
            <div className="card p-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>Two-factor authentication</p>
                <p className="text-xs mt-1" style={{ color: '#8896B3' }}>Enter your 6-digit authenticator code</p>
              </div>
              <input
                id="two-fa-code"
                type="text" inputMode="numeric" maxLength={6}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                value={twoFaCode}
                onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              <button type="button" className="btn-primary w-full" disabled={twoFaCode.length !== 6}>Verify</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', color: '#FF4466' }}>
                  {displayError}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  id="login-email" type="email" required autoComplete="email"
                  className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>
                    PASSWORD
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium transition-colors"
                    style={{ color: '#818CF8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#A5B4FC')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#818CF8')}>
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
                  <button type="button" tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#4E5A7A' }}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={e => (e.currentTarget.style.color = '#8896B3')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4E5A7A')}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d={showPassword
                          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="btn-primary w-full !py-3" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: '#161C2E' }} />
                <span className="text-xs" style={{ color: '#4E5A7A' }}>New to QuantEdge?</span>
                <div className="flex-1 h-px" style={{ background: '#161C2E' }} />
              </div>

              <Link href="/register" className="btn-secondary w-full text-center block">
                Create free account
              </Link>
            </form>
          )}
        </div>

        <p className="mt-8 text-xs" style={{ color: '#2D3A5E' }}>
          For educational use only · No real money involved
        </p>
      </div>
    </div>
  );
}
