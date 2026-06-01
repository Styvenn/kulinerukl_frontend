'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import type { Metadata } from 'next';

export default function SignInPage() {
  const { login, role } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Format email tidak valid.';
    if (!password) newErrors.password = 'Password wajib diisi.';
    else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      // We need to read the role after login
      const storedUser = localStorage.getItem('lth_user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      const userRole = userObj?.role ?? 'user';

      success(
        `Selamat datang kembali, ${userObj?.name?.split(' ')[0] ?? ''}! 👋`,
        'Kamu berhasil masuk ke akun.'
      );

      setTimeout(() => {
        if (userRole === 'admin') router.push('/admin');
        else router.push('/');
      }, 600);
    } catch (err: unknown) {
      error('Login Gagal', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(214,90,49,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(214,90,49,0.06)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeInUp 0.5s ease forwards' }}>
        {/* Card */}
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
              Masuk ke Akun
            </h1>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 6 }}>
              Selamat datang kembali di{' '}
              <span style={{ color: '#D65A31', fontWeight: 600 }}>Local Taste Hub</span>
            </p>
          </div>

          {/* Demo Hints */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F0FFF4, #F0F7FF)',
              border: '1px solid #C6F6D5',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Shield size={13} color="#38A169" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#276749', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Akun Demo
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => { setEmail('user@gmail.com'); setPassword('user123'); }}
                style={{ fontSize: 11, color: '#2B6CB0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              >
                👤 User: user@gmail.com / user123
              </button>
            </div>
            <div>
              <button
                onClick={() => { setEmail('admin@mail.com'); setPassword('admin123'); }}
                style={{ fontSize: 11, color: '#D65A31', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              >
                🛡️ Admin: admin@gmail.com / admin123
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="signin-email"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D3748', marginBottom: 6 }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', pointerEvents: 'none' }} />
                <input
                  id="signin-email"
                  type="email"
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  style={{
                    width: '100%', padding: '11px 14px 11px 42px',
                    borderRadius: 10, fontSize: 14,
                    border: `1.5px solid ${errors.email ? '#FC8181' : '#E2E8F0'}`,
                    outline: 'none', transition: 'border-color 0.2s',
                    color: '#1A1A2E', background: '#FAFAFA',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = errors.email ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? '#FC8181' : '#E2E8F0')}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="signin-password"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D3748', marginBottom: 6 }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', pointerEvents: 'none' }} />
                <input
                  id="signin-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  style={{
                    width: '100%', padding: '11px 44px 11px 42px',
                    borderRadius: 10, fontSize: 14,
                    border: `1.5px solid ${errors.password ? '#FC8181' : '#E2E8F0'}`,
                    outline: 'none', transition: 'border-color 0.2s',
                    color: '#1A1A2E', background: '#FAFAFA',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = errors.password ? '#FC8181' : '#D65A31')}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? '#FC8181' : '#E2E8F0')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signin-submit-btn"
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
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#718096', marginTop: 20 }}>
            Belum punya akun?{' '}
            <Link href="/sign-up" style={{ color: '#D65A31', fontWeight: 700, textDecoration: 'none' }}>
              Daftar Gratis
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          © 2025 Local Taste Hub. All rights reserved.
        </p>
      </div>

      <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
    </div>
  );
}
