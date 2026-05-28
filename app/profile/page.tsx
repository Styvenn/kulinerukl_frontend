'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { User, Mail, Shield, Bookmark, Edit2, CheckCircle2, Lock, ArrowRight, Star } from 'lucide-react';

export default function ProfilePage() {
  const { user, role, bookmarks, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Sync state with context user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (role === 'guest') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 24, padding: '48px 32px', boxShadow: '0 10px 30px rgba(11, 47, 53, 0.05)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(214, 90, 49, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D65A31', margin: '0 auto 20px' }}>
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 10 }}>Akses Terbatas</h1>
          <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.6, marginBottom: 28 }}>
            Halaman profil hanya dapat diakses oleh pengguna yang sudah masuk. Silakan masuk ke akun Anda terlebih dahulu.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href="/sign-in"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(214, 90, 49, 0.3)',
              }}
            >
              Masuk Sekarang
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/sign-up"
              style={{
                padding: '13px', borderRadius: 12, border: '1px solid #E2E8F0',
                color: '#4A5568', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                background: '#fff',
              }}
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) newErrors.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Format email tidak valid.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateProfile(name, email);
    setIsEditing(false);
    success('Berhasil!', 'Profil Anda berhasil diperbarui.');
  };

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 20, marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Profil Saya</h1>
          <p style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>Kelola informasi detail profil dan pantau aktivitas kuliner Anda.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28, alignItems: 'flex-start' }}>
          
          {/* Card Left: Avatar & Stats */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <div
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: role === 'admin' ? 'linear-gradient(135deg, #D65A31, #B84A24)' : 'linear-gradient(135deg, #1E5260, #0B2F35)',
                color: '#fff', fontSize: 32, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                border: '4px solid #F1F5F9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              {user?.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
            </div>
            
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: '0 0 4px' }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: '#718096', margin: '0 0 16px' }}>{user?.email}</p>
            
            {/* Badge role */}
            <span
              style={{
                background: role === 'admin' ? 'rgba(214, 90, 49, 0.15)' : 'rgba(30, 82, 96, 0.12)',
                color: role === 'admin' ? '#D65A31' : '#1E5260',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                padding: '4px 14px', borderRadius: 20, display: 'inline-block', marginBottom: 28
              }}
            >
              {role === 'admin' ? '🛡️ Administrator' : '👤 Pengguna Umum'}
            </span>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <Bookmark size={18} color="#D65A31" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: 0 }}>{bookmarks.length}</p>
                <p style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>Bookmark</p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #F1F5F9' }}>
                <Star size={18} color="#F6C90E" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: 0 }}>3</p>
                <p style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>Ulasan Saya</p>
              </div>
            </div>
          </div>

          {/* Card Right: Form Edit */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Informasi Pribadi</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', color: '#D65A31',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Edit2 size={13} />
                  Ubah Profil
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate}>
              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 8 }}>
                  Nama Lengkap
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                      border: `1.5px solid ${errors.name ? '#FC8181' : '#E2E8F0'}`,
                      background: isEditing ? '#fff' : '#F8F9FA',
                      color: '#1A1A2E', outline: 'none', fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.name && <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A5568', marginBottom: 8 }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
                      border: `1.5px solid ${errors.email ? '#FC8181' : '#E2E8F0'}`,
                      background: isEditing ? '#fff' : '#F8F9FA',
                      color: '#1A1A2E', outline: 'none', fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.email && <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Submit Buttons */}
              {isEditing && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1, padding: '11px', background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                      color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 4px 12px rgba(214, 90, 49, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setName(user?.name ?? ''); setEmail(user?.email ?? ''); setErrors({}); }}
                    style={{
                      padding: '11px 18px', background: '#F8F9FA', color: '#4A5568',
                      border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Batal
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
