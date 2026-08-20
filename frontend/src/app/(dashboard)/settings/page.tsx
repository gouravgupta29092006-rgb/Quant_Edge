'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiPost } from '@/lib/api';

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.1)' }}>
          {icon}
        </div>
        <h2 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#4E5A7A', letterSpacing: '0.07em' }}>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const updated = await apiPost<typeof user>('/users/me', { displayName });
      if (updated && user) setUser({ ...user, ...updated });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Update failed.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setSaving(true); setMessage(''); setError('');
    try {
      await apiPost('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setMessage('Password changed successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Password change failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="page-wrapper max-w-2xl">
      {/* Feedback banners */}
      {message && (
        <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(0,211,149,0.08)', border: '1px solid rgba(0,211,149,0.2)', color: '#00D395' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', color: '#FF4466' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Profile */}
      <SectionCard title="Profile"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email ?? ''} disabled />
            <p className="text-xs mt-1.5" style={{ color: '#4E5A7A' }}>Email cannot be changed.</p>
          </div>
          <div>
            <FieldLabel>Username</FieldLabel>
            <input id="settings-username" className="input opacity-50 cursor-not-allowed" value={user?.username ?? ''} disabled />
          </div>
          <div>
            <FieldLabel>Display Name</FieldLabel>
            <input id="settings-displayname" type="text" className="input" value={displayName}
              onChange={e => setDisplayName(e.target.value)} placeholder="Your display name" />
          </div>
          <button id="settings-profile-save" type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <FieldLabel>Current Password</FieldLabel>
            <input id="settings-current-pw" type="password" className="input" value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <FieldLabel>New Password</FieldLabel>
            <input id="settings-new-pw" type="password" className="input" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
          </div>
          <div>
            <FieldLabel>Confirm New Password</FieldLabel>
            <input id="settings-confirm-pw" type="password" className="input" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: '#FF4466' }}>Passwords don't match</p>
            )}
          </div>
          <button id="settings-password-save" type="submit" disabled={saving || !currentPassword || !newPassword} className="btn-primary px-6">
            {saving ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </SectionCard>

      {/* Account info */}
      <SectionCard title="Account Information"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
        <div className="space-y-3">
          {[
            { label: 'Account type', value: user?.role ?? '—', color: '#818CF8' },
            {
              label: 'Email verified',
              value: user?.emailVerified ? 'Verified ✓' : 'Not verified',
              color: user?.emailVerified ? '#00D395' : '#FF4466',
            },
            {
              label: 'Member since',
              value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—',
            },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid #161C2E' }}>
              <span className="text-sm" style={{ color: '#8896B3' }}>{row.label}</span>
              <span className="text-sm font-semibold" style={{ color: row.color ?? '#F0F4FF' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger zone */}
      <div className="card p-6 relative overflow-hidden" style={{ borderColor: 'rgba(255,68,102,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,68,102,0.4), transparent)' }} />
        <h2 className="text-sm font-bold mb-2" style={{ color: '#FF4466' }}>Danger Zone</h2>
        <p className="text-xs mb-4" style={{ color: '#4E5A7A' }}>
          This is a virtual trading platform — all portfolios and data are simulated. Deleting your account will permanently remove all data.
        </p>
        <button id="settings-delete-account-btn"
          className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
          style={{ color: '#FF4466', border: '1px solid rgba(255,68,102,0.25)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,102,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Delete account
        </button>
      </div>
    </div>
  );
}
