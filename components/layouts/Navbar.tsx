'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Search,
  Bookmark,
  LayoutDashboard,
  BarChart3,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Shield,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

// ─── Nav Links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/about', label: 'Tentang Kami' },
];

// ─── Avatar Placeholder ───────────────────────────────────────────────────────
function AvatarPlaceholder({
  name,
  size = 36,
  isAdmin = false,
}: {
  name: string;
  size?: number;
  isAdmin?: boolean;
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isAdmin
          ? 'linear-gradient(135deg, #D65A31, #B84A24)'
          : 'linear-gradient(135deg, #1E5260, #0B2F35)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        border: isAdmin ? '2px solid rgba(214,90,49,0.4)' : '2px solid rgba(255,255,255,0.2)',
      }}
    >
      {initials}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { totalItems } = useCart();
  const { success, error } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection for shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    success('Sampai jumpa!', 'Kamu berhasil keluar dari akun.');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // ─── Styles ────────────────────────────────────────────────────────────────
  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: scrolled ? 'rgba(11, 47, 53, 0.97)' : '#0B2F35',
    backdropFilter: scrolled ? 'blur(14px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
    boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.22)' : 'none',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 20px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const linkStyle = (active: boolean): React.CSSProperties => ({
    color: active ? '#D65A31' : 'rgba(255,255,255,0.75)',
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 8,
    transition: 'color 0.2s, background 0.2s',
    background: active ? 'rgba(214,90,49,0.12)' : 'transparent',
    position: 'relative',
  });

  return (
    <>
      <nav style={navStyle} role="navigation" aria-label="Navigasi utama">
        <div style={innerStyle}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            id="nav-logo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(214,90,49,0.4)',
              }}
            >
              <UtensilsCrossed size={20} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: '#fff',
                letterSpacing: '-0.3px',
              }}
            >
              Local<span style={{ color: '#D65A31' }}>Taste</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, fontSize: 14 }}>
                {' '}Hub
              </span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────── */}
          <nav
            aria-label="Menu utama"
            style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 32, flex: 1 }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                style={linkStyle(isActive(link.href))}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(255,255,255,0.75)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Spacer ────────────────────────────────────────── */}
          <div style={{ flex: 1 }} className="hidden-mobile" />

          {/* ── Right Section ─────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* ── GUEST ── */}
            {role === 'guest' && (
              <>
                {/* Guest Cart Icon */}
                <button
                  onClick={() => {
                    error('Akses Ditolak', 'Silakan login untuk menggunakan keranjang.');
                    router.push('/sign-in');
                  }}
                  title="Keranjang"
                  style={{
                    width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s', position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                >
                  <ShoppingCart size={17} />
                  {totalItems > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: '#E53E3E', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, border: '2px solid #0B2F35' }}>
                      {totalItems}
                    </span>
                  )}
                </button>
                <Link
                  href="/sign-in"
                  id="nav-btn-signin"
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    fontSize: 14,
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(255,255,255,0.8)';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/sign-up"
                  id="nav-btn-signup"
                  style={{
                    background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                    padding: '9px 20px',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(214,90,49,0.35)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 6px 18px rgba(214,90,49,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 4px 12px rgba(214,90,49,0.35)';
                  }}
                >
                  Daftar Gratis
                </Link>
              </>
            )}

            {/* ── USER ── */}
            {role === 'user' && (
              <>
                {/* User Cart Icon */}
                <Link
                  href="/cart"
                  title="Keranjang Saya"
                  style={{
                    width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s', position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                >
                  <ShoppingCart size={17} />
                  {totalItems > 0 && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: '#E53E3E', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, border: '2px solid #0B2F35' }}>
                      {totalItems}
                    </span>
                  )}
                </Link>
                {/* Bookmark */}
                <Link
                  href="/bookmarks"
                  id="nav-btn-bookmarks"
                  title="Bookmark Saya"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(214,90,49,0.18)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#D65A31';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(255,255,255,0.75)';
                  }}
                >
                  <Bookmark size={17} />
                </Link>

                {/* Avatar dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    id="nav-user-avatar"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      padding: '4px 10px 4px 4px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(255,255,255,0.13)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(255,255,255,0.08)')
                    }
                  >
                    <AvatarPlaceholder name={user?.name ?? 'U'} size={30} />
                    <span
                      style={{ color: '#fff', fontSize: 13, fontWeight: 500, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      color="rgba(255,255,255,0.6)"
                      style={{
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.25s',
                      }}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        background: '#fff',
                        borderRadius: 14,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                        minWidth: 220,
                        overflow: 'hidden',
                        animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
                        transformOrigin: 'top right',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      {/* User Info */}
                      <div
                        style={{
                          padding: '14px 16px',
                          borderBottom: '1px solid #F1F5F9',
                          background: '#F8F9FA',
                        }}
                      >
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', margin: 0 }}>
                          {user?.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                          {user?.email}
                        </p>
                      </div>
                      {/* Links */}
                      <DropdownItem icon={<User size={15} />} label="Profil Saya" href="/profile" />
                      <DropdownItem icon={<ClipboardList size={15} />} label="Pesanan Saya" href="/orders" />
                      <DropdownItem icon={<Bookmark size={15} />} label="Bookmark Saya" href="/bookmarks" />
                      {/* Logout */}
                      <button
                        id="nav-btn-logout"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '11px 16px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#E53E3E',
                          fontSize: 14,
                          fontWeight: 500,
                          textAlign: 'left',
                          borderTop: '1px solid #FED7D7',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = 'none')
                        }
                      >
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── ADMIN ── */}
            {role === 'admin' && (
              <>
                {/* Analytics */}
                <Link
                  href="/admin/analytics"
                  id="nav-btn-analytics"
                  title="Analytics"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(214,90,49,0.18)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#D65A31';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)';
                  }}
                >
                  <BarChart3 size={17} />
                </Link>

                {/* Dashboard button - prominent */}
                <Link
                  href="/admin"
                  id="nav-btn-admin-dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none',
                    padding: '8px 14px',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(214,90,49,0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 18px rgba(214,90,49,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(214,90,49,0.4)';
                  }}
                >
                  <LayoutDashboard size={15} />
                  Admin Dashboard
                </Link>

                {/* Admin Avatar dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    id="nav-admin-avatar"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(214,90,49,0.15)',
                      border: '1px solid rgba(214,90,49,0.3)',
                      borderRadius: 10,
                      padding: '4px 8px 4px 4px',
                      cursor: 'pointer',
                    }}
                  >
                    <AvatarPlaceholder name={user?.name ?? 'A'} size={30} isAdmin />
                    <Shield size={12} color="#D65A31" />
                  </button>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        background: '#fff',
                        borderRadius: 14,
                        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                        minWidth: 200,
                        overflow: 'hidden',
                        animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
                        transformOrigin: 'top right',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #FFF5F0, #fff)', borderBottom: '1px solid #FED7C0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Shield size={13} color="#D65A31" />
                          <span style={{ fontSize: 11, color: '#D65A31', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Administrator
                          </span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', margin: '4px 0 0' }}>{user?.name}</p>
                      </div>
                      <DropdownItem icon={<ClipboardList size={15} />} label="Kelola Order" href="/admin/orders" />
                      <button
                        id="nav-admin-btn-logout"
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '11px 16px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#E53E3E',
                          fontSize: 14,
                          fontWeight: 500,
                          textAlign: 'left',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
                      >
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Hamburger (mobile) ── */}
            <button
              id="nav-mobile-menu-toggle"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                flexShrink: 0,
              }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ────────────────────────────────────── */}
        {mobileOpen && (
          <div
            style={{
              background: '#0B2F35',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 20px 20px',
              animation: 'fadeInUp 0.25s ease forwards',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  color: isActive(link.href) ? '#D65A31' : 'rgba(255,255,255,0.8)',
                  fontWeight: isActive(link.href) ? 600 : 500,
                  fontSize: 15,
                  textDecoration: 'none',
                  background: isActive(link.href) ? 'rgba(214,90,49,0.1)' : 'transparent',
                  marginBottom: 2,
                }}
              >
                <MapPin size={15} style={{ opacity: 0.5 }} />
                {link.label}
              </Link>
            ))}

            {role !== 'admin' && (
              <Link
                href={role === 'guest' ? '/sign-in' : '/cart'}
                onClick={(e) => {
                  if (role === 'guest') {
                    e.preventDefault();
                    error('Akses Ditolak', 'Silakan login untuk menggunakan keranjang.');
                    router.push('/sign-in');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  borderRadius: 10, color: isActive('/cart') ? '#D65A31' : 'rgba(255,255,255,0.8)',
                  fontWeight: isActive('/cart') ? 600 : 500, fontSize: 15, textDecoration: 'none',
                  background: isActive('/cart') ? 'rgba(214,90,49,0.1)' : 'transparent', marginBottom: 2,
                }}
              >
                <ShoppingCart size={15} style={{ opacity: 0.5 }} />
                Keranjang ({totalItems})
              </Link>
            )}

            {role === 'guest' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <Link
                  href="/sign-in"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '11px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/sign-up"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '11px',
                    borderRadius: 10,
                    background: '#D65A31',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  Daftar
                </Link>
              </div>
            )}

            {(role === 'user' || role === 'admin') && (
              <button
                onClick={handleLogout}
                style={{
                  marginTop: 12,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid rgba(229,62,62,0.3)',
                  background: 'rgba(229,62,62,0.08)',
                  color: '#FC8181',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={15} />
                Keluar
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div style={{ height: 64 }} />

      {/* Inline responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile   { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ─── Helper: Dropdown Item ────────────────────────────────────────────────────
function DropdownItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 16px',
        color: '#2D3748',
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.background = '#F8F9FA')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')
      }
    >
      <span style={{ color: '#718096' }}>{icon}</span>
      {label}
    </Link>
  );
}
