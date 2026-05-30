'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils, Search, Loader2, UtensilsCrossed } from 'lucide-react';
import { type MenuItem } from '@/lib/data';
import { apiGet } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RestaurantBasic {
  id: string;
  name: string;
  coverImage?: string;
  category?: string;
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ height: 18, width: '60%', background: 'linear-gradient(90deg,#E2E8F0 25%,#CBD5E0 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: 14, width: '80%', background: 'linear-gradient(90deg,#E2E8F0 25%,#CBD5E0 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: 20, width: '30%', background: 'linear-gradient(90deg,#E2E8F0 25%,#CBD5E0 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
    </div>
  );
}

export default function MenuPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantBasic | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch restaurant info and menus in parallel
      const [restData, menuData] = await Promise.all([
        apiGet<RestaurantBasic>(`/culinary/${id}`),
        apiGet<MenuItem[]>(`/culinary/${id}/menus`),
      ]);
      setRestaurant(restData);
      setMenus(Array.isArray(menuData) ? menuData : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Gagal memuat data menu.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = menus.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: 'linear-gradient(180deg, #0B2F35 0%, #1E5260 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'rgba(11,47,53,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Utensils size={16} color="#D65A31" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#D65A31', textTransform: 'uppercase', letterSpacing: '1px' }}>Katalog Menu</span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {loading ? 'Memuat...' : (restaurant?.name ?? 'Menu Restoran')}
            </h1>
          </div>
          <Link
            href={`/restaurant/${id}`}
            style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Detail Restoran
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Search + Count bar */}
        {!loading && !fetchError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari nama atau deskripsi menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
              {filtered.length} dari {menus.length} menu
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error State */}
        {!loading && fetchError && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <UtensilsCrossed size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: '#fff', marginBottom: 8, fontSize: 18 }}>Gagal Memuat Menu</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>{fetchError}</p>
            <button onClick={fetchData} style={{ padding: '10px 24px', background: '#D65A31', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !fetchError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Utensils size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: '#fff', marginBottom: 8, fontSize: 18 }}>
              {searchQuery ? 'Menu tidak ditemukan' : 'Belum Ada Menu'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
              {searchQuery
                ? `Tidak ada menu yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                : 'Menu untuk restoran ini belum tersedia saat ini.'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ padding: '10px 24px', background: '#D65A31', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Hapus Pencarian
              </button>
            )}
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'transform 0.2s, background 0.2s',
                  animation: `fadeInUp 0.4s ease ${idx * 0.04}s both`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(214,90,49,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Utensils size={18} color="#D65A31" />
                </div>

                {/* Name */}
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>{item.name}</h3>

                {/* Description */}
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, flex: 1 }}>{item.description}</p>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#D65A31' }}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 20 }}>
                    Menu #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              href={`/restaurant/${id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Restoran
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}
