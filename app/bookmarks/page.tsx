'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Bookmark, Lock, ArrowRight, Heart, MapPin, Clock, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_LABEL, PRICE_LABEL } from '@/lib/data';

export default function BookmarksPage() {
  const { role, bookmarks, toggleBookmark } = useAuth();
  const { restaurants } = useRestaurant();
  const { success } = useToast();

  // Find bookmarked restaurants
  const bookmarkedRestaurants = useMemo(() => {
    return restaurants.filter((r) => bookmarks.includes(r.id));
  }, [restaurants, bookmarks]);

  const handleRemoveBookmark = (id: string, name: string) => {
    toggleBookmark(id);
    success('Dihapus', `Restoran "${name}" dihapus dari favorit.`);
  };

  // Guest State UI
  if (role === 'guest') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 24, padding: '48px 32px', boxShadow: '0 10px 30px rgba(11, 47, 53, 0.05)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(214, 90, 49, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D65A31', margin: '0 auto 20px' }}>
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 10 }}>Akses Terbatas</h1>
          <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.6, marginBottom: 28 }}>
            Halaman ini menyimpan kuliner favorit Anda. Silakan masuk atau daftarkan akun untuk menikmati fitur bookmark.
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

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Bookmark size={22} color="#D65A31" fill="#D65A31" />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Bookmark Saya</h1>
          </div>
          <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>
            Daftar restoran kuliner lokal yang telah Anda simpan untuk dikunjungi nanti.
          </p>
        </div>

        {/* List Grid */}
        {bookmarkedRestaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0', margin: '0 auto 16px' }}>
              <Heart size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', marginBottom: 6 }}>Belum Ada Bookmark</h3>
            <p style={{ color: '#718096', fontSize: 13, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Mulai jelajahi menu kuliner kami dan klik tombol hati pada restoran untuk menambahkannya ke sini.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block', padding: '10px 24px', background: '#D65A31', color: '#fff',
                fontWeight: 600, fontSize: 13, borderRadius: 10, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(214, 90, 49, 0.25)',
              }}
            >
              Cari Kuliner Terbaik
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {bookmarkedRestaurants.map((rest) => (
              <article
                key={rest.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: '1px solid #F1F5F9',
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rest.thumbnailImage}
                    alt={rest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
                  
                  {/* Remove Bookmark */}
                  <button
                    onClick={() => handleRemoveBookmark(rest.id, rest.name)}
                    title="Hapus dari Bookmark"
                    style={{
                      position: 'absolute', top: 12, right: 12, width: 34, height: 34,
                      borderRadius: '50%', background: '#D65A31', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Heart size={16} fill="#fff" stroke="#fff" strokeWidth={2} />
                  </button>

                  <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(11,47,53,0.85)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                    {CATEGORY_LABEL[rest.category]}
                  </span>
                  
                  <span style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(214,90,49,0.92)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                    {PRICE_LABEL[rest.priceRange]}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/restaurant/${rest.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {rest.name}
                    </h3>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <MapPin size={12} color="#718096" />
                    <span style={{ fontSize: 12, color: '#718096' }}>{rest.district}, {rest.city}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                    <Star size={13} fill="#F6C90E" stroke="#F6C90E" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{rest.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 11, color: '#A0AEC0' }}>({rest.reviewCount} ulasan)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                    <Clock size={12} color="#A0AEC0" />
                    <span style={{ fontSize: 11, color: '#A0AEC0', flex: 1 }}>{rest.openHours}</span>
                    <Link href={`/restaurant/${rest.id}`} style={{ fontSize: 11, color: '#D65A31', fontWeight: 600, textDecoration: 'none' }}>
                      Detail →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
