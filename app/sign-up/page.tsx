'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { apiPost } from '@/lib/api';

export default function SignUpPage() {
  const { success, error } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama lengkap wajib diisi.';
    else if (form.name.trim().length < 2) e.name = 'Nama minimal 2 karakter.';
    if (!form.email) e.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password) e.password = 'Password wajib diisi.';
    else if (form.password.length < 6) e.password = 'Password minimal 6 karakter.';
    if (!form.confirm) e.confirm = 'Konfirmasi password wajib diisi.';
    else if (form.password !== form.confirm) e.confirm = 'Password tidak cocok.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiPost('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      success('Pendaftaran Berhasil! 🎉', 'Akun kamu siap. Silakan masuk sekarang.');
      setTimeout(() => router.push('/sign-in'), 1200);
    } catch (err) {
      error('Pendaftaran Gagal', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel = ['', 'Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['', '#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#276749'][strength];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B2F35 0%, #1E5260 40%, #0B2F35 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(214,90,49,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(214,90,49,0.06)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInUp 0.5s ease forwards' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 8px 20px rgba(214,90,49,0.3)',
              }}
            >
              <UtensilsCrossed size={26} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0B2F35', margin: 0 }}>
              Buat Akun Baru
            </h1>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 6 }}>
              Bergabung dengan ribuan foodie di{' '}
              <span style={{ color: '#D65A31', fontWeight: 600 }}>Local Taste Hub</span>
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {['Simpan Favorit', 'Beri Ulasan', 'Rekomendasi Spesial'].map((b) => (
              <div
                key={b}
                style={{
                  flex: 1, textAlign: 'center', padding: '8px 6px',
                  background: '#F8F9FA', borderRadius: 10,
                  border: '1px solid #E2E8F0',
                }}
              >
                <CheckCircle size={14} color="#38A169" style={{ margin: '0 auto 4px' }} />
                <p style={{ fontSize: 10, color: '#4A5568', fontWeight: 600, margin: 0 }}>{b}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <FieldWrapper label="Nama Lengkap" error={errors.name}>
              <InputIcon icon={<User size={16} />}>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Nama kamu"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  style={inputStyle(!!errors.name)}
                  onFocus={(e) => (e.target.style.borderColor = errors.name ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.name ? '#FC8181' : '#E2E8F0')}
                />
              </InputIcon>
            </FieldWrapper>

            {/* Email */}
            <FieldWrapper label="Email" error={errors.email}>
              <InputIcon icon={<Mail size={16} />}>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => (e.target.style.borderColor = errors.email ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? '#FC8181' : '#E2E8F0')}
                />
              </InputIcon>
            </FieldWrapper>

            {/* Password */}
            <FieldWrapper label="Password" error={errors.password}>
              <InputIcon icon={<Lock size={16} />} right={
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }>
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 karakter"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  style={inputStyle(!!errors.password)}
                  onFocus={(e) => (e.target.style.borderColor = errors.password ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? '#FC8181' : '#E2E8F0')}
                />
              </InputIcon>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}
                        style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? strengthColor : '#E2E8F0',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColor, fontWeight: 600, marginTop: 3 }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </FieldWrapper>

            {/* Confirm Password */}
            <FieldWrapper label="Konfirmasi Password" error={errors.confirm}>
              <InputIcon icon={<Lock size={16} />} right={
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', display: 'flex' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }>
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={form.confirm}
                  onChange={(e) => update('confirm', e.target.value)}
                  style={inputStyle(!!errors.confirm)}
                  onFocus={(e) => (e.target.style.borderColor = errors.confirm ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.confirm ? '#FC8181' : '#E2E8F0')}
                />
              </InputIcon>
            </FieldWrapper>

            {/* Terms */}
            <p style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 16, lineHeight: 1.6 }}>
              Dengan mendaftar, kamu menyetujui{' '}
              <span style={{ color: '#D65A31', fontWeight: 600, cursor: 'pointer' }}>Syarat & Ketentuan</span>
              {' '}dan{' '}
              <span style={{ color: '#D65A31', fontWeight: 600, cursor: 'pointer' }}>Kebijakan Privasi</span> kami.
            </p>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#A0AEC0' : 'linear-gradient(135deg, #D65A31, #B84A24)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(214,90,49,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Membuat Akun...
                </>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#718096', marginTop: 20 }}>
            Sudah punya akun?{' '}
            <Link href="/sign-in" style={{ color: '#D65A31', fontWeight: 700, textDecoration: 'none' }}>
              Masuk di sini
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          © 2025 Local Taste Hub. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D3748', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function InputIcon({ icon, right, children }: { icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', pointerEvents: 'none', display: 'flex' }}>
        {icon}
      </span>
      {children}
      {right && (
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
          {right}
        </span>
      )}
    </div>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 44px 11px 42px',
  borderRadius: 10, fontSize: 14,
  border: `1.5px solid ${hasError ? '#FC8181' : '#E2E8F0'}`,
  outline: 'none', transition: 'border-color 0.2s',
  color: '#1A1A2E', background: '#FAFAFA',
  boxSizing: 'border-box',
});
