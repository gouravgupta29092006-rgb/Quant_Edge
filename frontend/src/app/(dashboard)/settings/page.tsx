'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { apiPost } from '@/lib/api';

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
    setSaving(true);
    setMessage(''); setError('');
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Feedback */}
      {message && <div className="bg-success/10 border border-success/30 text-success text-sm rounded-xl p-3">{message}</div>}
      {error   && <div className="bg-danger/10  border border-danger/30  text-danger  text-sm rounded-xl p-3">{error}</div>}

      {/* Profile */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Email address</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ''} disabled />
            <p className="text-xs text-[var(--text-muted)] mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label htmlFor="settings-username" className="block text-xs text-[var(--text-muted)] mb-1.5">Username</label>
            <input id="settings-username" className="input opacity-60 cursor-not-allowed" value={user?.username ?? ''} disabled />
          </div>
          <div>
            <label htmlFor="settings-displayname" className="block text-xs text-[var(--text-muted)] mb-1.5">Display name</label>
            <input id="settings-displayname" type="text" className="input" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <button id="settings-profile-save" type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="settings-current-pw" className="block text-xs text-[var(--text-muted)] mb-1.5">Current password</label>
            <input id="settings-current-pw" type="password" className="input" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="settings-new-pw" className="block text-xs text-[var(--text-muted)] mb-1.5">New password</label>
            <input id="settings-new-pw" type="password" className="input" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 chars" />
          </div>
          <div>
            <label htmlFor="settings-confirm-pw" className="block text-xs text-[var(--text-muted)] mb-1.5">Confirm new password</label>
            <input id="settings-confirm-pw" type="password" className="input" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
          </div>
          <button id="settings-password-save" type="submit" disabled={saving || !currentPassword || !newPassword}
            className="btn-primary px-6">
            {saving ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Account type</span>
            <span className="font-medium text-[var(--text-primary)]">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Email verified</span>
            <span className={`font-medium ${user?.emailVerified ? 'text-success' : 'text-danger'}`}>
              {user?.emailVerified ? 'Verified ✓' : 'Not verified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Member since</span>
            <span className="font-medium text-[var(--text-primary)]">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border border-danger/20">
        <h2 className="text-sm font-semibold text-danger mb-3">Danger Zone</h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">This is a virtual trading platform — all portfolios and data are simulated. Deleting your account will permanently remove all data.</p>
        <button id="settings-delete-account-btn" className="px-4 py-2 rounded-xl text-sm font-medium text-danger border border-danger/30 hover:bg-danger/10 transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );
}
