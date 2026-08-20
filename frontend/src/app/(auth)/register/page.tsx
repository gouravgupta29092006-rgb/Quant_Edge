'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #080A14 0%, #0C0F1E 60%, #060910 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
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
      <div className="relative space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,211,149,0.12)', border: '1px solid rgba(0,211,149,0.25)', color: '#00D395' }}>
          <span className="live-dot" />
          Free Forever
        </div>
        <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
          Start trading.<br />
          <span style={{ background: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Zero risk.
          </span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#8896B3', maxWidth: '320px' }}>
          Join thousands of traders practicing with $100,000 virtual capital and real market data.
        </p>
        <ul className="space-y-2.5">
          {[
            'Paper trade with $100K virtual capital',
            'Real-time market data & AI insights',
            'Backtest your strategies',
            'No credit card required',
          ].map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#8896B3' }}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#00D395" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs" style={{ color: '#2D3A5E' }}>
        QuantEdge · For educational use only · No real money involved
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState<FormData>({ email: '', firstName: '', lastName: '', password: '', confirmPassword: '' });
  const [registered, setRegistered] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const setField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = (): string => {
    if (form.firstName.trim().length < 1) return 'First name is required.';
    if (form.lastName.trim().length < 1) return 'Last name is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.';
    if (!/[@#$%^&+=!]/.test(form.password)) return 'Password must contain a special character (@#$%^&+=!).';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const err = validate();
    if (err) { setLocalError(err); return; }
    setLocalError('');
    try {
      await register({ email: form.email, firstName: form.firstName.trim(), lastName: form.lastName.trim(), password: form.password });
      setRegistered(true);
    } catch { /* error shown via store */ }
  };

  const pwdStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[@#$%^&+=!]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ['#FF4466', '#F59E0B', '#818CF8', '#00D395'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const displayError = error || localError;

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05060A' }}>
        <div className="card p-10 max-w-md w-full text-center animate-scale-in mx-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,211,149,0.1)', border: '1px solid rgba(0,211,149,0.2)' }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#00D395" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Account created!</h2>
          <p className="text-sm mb-6" style={{ color: '#8896B3' }}>
            We sent a verification email to{' '}
            <strong style={{ color: '#818CF8' }}>{form.email}</strong>.<br />
            Please verify your email to access your account.
          </p>
          <Link href="/login" className="btn-primary w-full block text-center">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: '#05060A' }}>
      <BrandPanel />

      <div className="flex flex-col items-center justify-center px-6 py-12 overflow-y-auto animate-fade-up"
        style={{ background: '#05060A' }}>
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}>
            <span className="text-white font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Q</span>
          </div>
          <span className="text-xl font-bold text-gradient" style={{ fontFamily: 'Outfit, sans-serif' }}>QuantEdge</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
              Create your account
            </h2>
            <p className="text-sm" style={{ color: '#8896B3' }}>Start trading for free — no card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', color: '#FF4466' }}>
                {displayError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
              <input id="reg-email" type="email" required className="input" placeholder="you@example.com"
                value={form.email} onChange={setField('email')} />
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="reg-firstname" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>FIRST NAME</label>
                <input id="reg-firstname" type="text" required className="input" placeholder="John"
                  value={form.firstName} onChange={setField('firstName')} maxLength={50} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-lastname" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>LAST NAME</label>
                <input id="reg-lastname" type="text" required className="input" placeholder="Doe"
                  value={form.lastName} onChange={setField('lastName')} maxLength={50} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>PASSWORD</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? 'text' : 'password'} required
                  className="input pr-10" placeholder="Min 8 chars, uppercase & number"
                  value={form.password} onChange={setField('password')} minLength={8} />
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
              {/* Strength bar */}
              {form.password && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwdStrength ? strengthColors[pwdStrength - 1] : '#161C2E' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColors[pwdStrength - 1] }}>
                    {strengthLabels[pwdStrength - 1]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-xs font-semibold" style={{ color: '#8896B3', letterSpacing: '0.04em' }}>CONFIRM PASSWORD</label>
              <input id="reg-confirm" type="password" required className="input"
                placeholder="Repeat password"
                value={form.confirmPassword} onChange={setField('confirmPassword')} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs" style={{ color: '#FF4466' }}>Passwords don't match</p>
              )}
            </div>

            <button id="register-submit" type="submit" className="btn-primary w-full !py-3 mt-2" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: '#161C2E' }} />
              <span className="text-xs" style={{ color: '#4E5A7A' }}>Already have an account?</span>
              <div className="flex-1 h-px" style={{ background: '#161C2E' }} />
            </div>
            <Link href="/login" className="btn-secondary w-full text-center block">Sign in</Link>
          </form>
        </div>

        <p className="mt-8 text-xs" style={{ color: '#2D3A5E' }}>
          By creating an account you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
