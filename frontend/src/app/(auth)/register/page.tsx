'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState<FormData>({
    email: '', firstName: '', lastName: '', password: '', confirmPassword: '',
  });
  const [registered, setRegistered] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
      await register({
        email: form.email,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
      });
      setRegistered(true);
    } catch { /* error shown via store */ }
  };

  const displayError = error || localError;

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
        <div className="card p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Account created!</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            We sent a verification email to <strong className="text-brand-400">{form.email}</strong>.
            Please verify your email to access your account.
          </p>
          <Link href="/login" className="btn-primary w-full block text-center">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-600 rounded-full filter blur-[120px] opacity-15 animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-success rounded-full filter blur-[100px] opacity-10" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-2xl font-bold text-gradient">QuantEdge</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm">Start your paper trading journey — free forever</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm animate-fade-in">
                {displayError}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email address</label>
              <input id="reg-email" type="email" required className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} />
            </div>

            {/* Row: First name + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-firstname" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">First name</label>
                <input id="reg-firstname" type="text" required className="input" placeholder="John"
                  value={form.firstName} onChange={set('firstName')} maxLength={50} />
              </div>
              <div>
                <label htmlFor="reg-lastname" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Last name</label>
                <input id="reg-lastname" type="text" required className="input" placeholder="Doe"
                  value={form.lastName} onChange={set('lastName')} maxLength={50} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? 'text' : 'password'} required className="input pr-10"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={form.password} onChange={set('password')} minLength={8} />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  onClick={() => setShowPassword(!showPassword)}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPassword
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      } />
                  </svg>
                </button>
              </div>
              {/* Password strength bar */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    form.password.length === 0 ? 'bg-[var(--border)]'
                    : i === 1 ? 'bg-danger'
                    : i === 2 && form.password.length >= 8 ? 'bg-warning'
                    : i === 3 && /[A-Z]/.test(form.password) && form.password.length >= 8 ? 'bg-brand-400'
                    : i === 4 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && form.password.length >= 10 ? 'bg-success'
                    : 'bg-[var(--border)]'
                  }`} />
                ))}
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Confirm password</label>
              <input id="reg-confirm" type="password" required className="input"
                placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>

            <button id="register-submit" type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
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
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">Already have an account?</span>
            </div>
          </div>
          <Link href="/login" className="btn-secondary w-full text-center block">Sign in</Link>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          By creating an account you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
