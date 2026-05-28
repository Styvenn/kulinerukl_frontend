'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  MessageSquare,
  Sparkles,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { CATEGORY_LABEL, PRICE_LABEL } from '@/lib/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RestaurantDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, role, toggleBookmark, isBookmarked } = useAuth();
  const { restaurants, addReview } = useRestaurant();
  const { success, error } = useToast();

  // Review Form State
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Find current restaurant
  const restaurant = useMemo(() => {
    return restaurants.find((r) => r.id === id);
  }, [restaurants, id]);

  const handleBookmark = () => {
    if (role === 'guest') {
      error('Gagal', 'Silakan masuk terlebih dahulu untuk menyimpan favorit.');
      return;
    }
    const added = toggleBookmark(id);
    if (added) {
      success('Disimpan', 'Berhasil ditambahkan ke bookmark Anda.');
    } else {
      success('Dihapus', 'Dihapus dari bookmark Anda.');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      error('Peringatan', 'Ulasan tidak boleh kosong.');
      return;
    }

    if (role === 'guest') {
      error('Gagal', 'Anda harus masuk terlebih dahulu.');
      return;
    }

    addReview(id, {
      userId: user?.id ?? 'u-anon',
      userName: user?.name ?? 'Anonim',
      rating: ratingInput,
      comment: commentInput.trim(),
    });

    success('Terima kasih!', 'Ulasan Anda berhasil dikirim.');
    setCommentInput('');
    setRatingInput(5);
    setShowReviewForm(false);
  };

  if (!restaurant) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0B2F35' }}>Restoran Tidak Ditemukan</h2>
        <p style={{ color: '#718096' }}>Maaf, data kuliner yang Anda cari tidak tersedia.</p>
        <Link href="/" style={{ padding: '10px 20px', background: '#D65A31', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isFavorited = isBookmarked(restaurant.id);

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── COVER IMAGE HERO ── */}
      <section style={{ position: 'relative', height: 'clamp(240px, 40vh, 400px)', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11, 47, 53, 0.85) 0%, rgba(0,0,0,0.1) 100%)' }} />
        
        {/* Float action buttons */}
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B2F35',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <button
            onClick={handleBookmark}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: isFavorited ? '#D65A31' : '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isFavorited ? '#fff' : '#D65A31', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
            }}
          >
            <Heart size={20} fill={isFavorited ? '#fff' : 'none'} />
          </button>
        </div>

        {/* Hero Title Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 20px', color: '#fff', zIndex: 10 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ background: '#D65A31', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                {CATEGORY_LABEL[restaurant.category]}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                {PRICE_LABEL[restaurant.priceRange]}
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: '0 0 10px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {restaurant.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#F6C90E" stroke="#F6C90E" />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{restaurant.rating.toFixed(1)}</span>
                <span style={{ opacity: 0.8 }}>({restaurant.reviewCount} ulasan)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} />
                <span>{restaurant.district}, {restaurant.city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ maxWidth: 1200, margin: '30px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }} className="detail-layout">
          
          {/* LEFT: About, Menu, & Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Description Card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', marginBottom: 12 }}>Deskripsi</h2>
              <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                {restaurant.description}
              </p>
              
              {/* Ambiance tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
                {restaurant.ambiance.map((amb) => (
                  <span key={amb} style={{ background: '#F0F7FF', color: '#1E5260', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, textTransform: 'capitalize' }}>
                    ✨ Suasana: {amb}
                  </span>
                ))}
              </div>
            </div>

            {/* Menu List Card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Utensils size={18} color="#D65A31" />
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Daftar Menu Favorit</h2>
              </div>
              
              {restaurant.menu && restaurant.menu.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {restaurant.menu.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 14, borderRadius: 12, border: '1px solid #F1F5F9',
                        background: '#FAFBFB', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{item.name}</h4>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#D65A31', whiteSpace: 'nowrap' }}>
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#718096', margin: 0, lineHeight: 1.4 }}>{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#718096', fontSize: 13, margin: 0 }}>Menu belum diperbarui oleh pengelola.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={18} color="#D65A31" />
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Ulasan ({restaurant.reviewCount})</h2>
                </div>
                
                {role !== 'guest' ? (
                  <button
                    onClick={() => setShowReviewForm((v) => !v)}
                    style={{
                      padding: '8px 16px', background: '#D65A31', color: '#fff', border: 'none',
                      borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(214, 90, 49, 0.2)',
                    }}
                  >
                    {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
                  </button>
                ) : (
                  <Link href="/sign-in" style={{ fontSize: 12, fontWeight: 600, color: '#D65A31', textDecoration: 'none' }}>
                    Masuk untuk Review →
                  </Link>
                )}
              </div>

              {/* Review Write Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  style={{
                    background: '#FAFBFB', border: '1px solid #E2E8F0', borderRadius: 12,
                    padding: 16, marginBottom: 24, animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0B2F35', marginBottom: 12 }}>Beri Nilai Restoran Ini:</h4>
                  
                  {/* Star Rating Select */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const displayRating = hoverRating !== null ? hoverRating : ratingInput;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={24}
                            fill={star <= displayRating ? '#F6C90E' : 'none'}
                            stroke={star <= displayRating ? '#F6C90E' : '#CBD5E0'}
                            strokeWidth={1.5}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                      Tulis Ulasan Anda
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Bagaimana pelayanan, harga, dan cita rasa makanan di sini?"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8,
                        fontSize: 13, color: '#1A1A2E', outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px', background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                      color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                      cursor: 'pointer', boxShadow: '0 4px 10px rgba(214, 90, 49, 0.25)',
                    }}
                  >
                    Kirim Ulasan
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {restaurant.reviews && restaurant.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {restaurant.reviews.map((rev) => (
                    <div key={rev.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1E5260, #0B2F35)',
                              color: '#fff', fontSize: 12, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {rev.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{rev.userName}</h4>
                            <span style={{ fontSize: 11, color: '#A0AEC0' }}>{rev.date}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              fill={s <= rev.rating ? '#F6C90E' : 'none'}
                              stroke={s <= rev.rating ? '#F6C90E' : '#E2E8F0'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#4A5568', margin: 0, lineHeight: 1.5, paddingLeft: 42 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A0AEC0' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Belum ada ulasan untuk restoran ini. Jadi yang pertama mengulas!</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Quick Contact & Maps Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Quick Specs */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 16, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                Informasi Kontak
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <MapPin size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Alamat</h5>
                    <p style={{ fontSize: 12, color: '#718096', margin: 0, lineHeight: 1.4 }}>{restaurant.address}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Clock size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Jam Operasional</h5>
                    <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{restaurant.openHours}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Phone size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Telepon</h5>
                    <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{restaurant.phone}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={`tel:${restaurant.phone}`}
                  style={{
                    padding: '11px', background: '#0B2F35', color: '#fff', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: '0 3px 10px rgba(11, 47, 53, 0.15)',
                  }}
                >
                  <Phone size={14} />
                  Hubungi Sekarang
                </a>
              </div>
            </div>

            {/* Google Map Card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 260, background: '#E2E8F0', position: 'relative' }}>
                {restaurant.mapUrl && restaurant.mapUrl.startsWith('https://') ? (
                  <iframe
                    src={restaurant.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title={`Peta Lokasi ${restaurant.name}`}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg, #E2E8F0, #CBD5E0)', color: '#4A5568', textAlign: 'center' }}>
                    <MapPin size={36} color="#D65A31" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>Peta Lokasi Simulasi</p>
                    <p style={{ fontSize: 10, color: '#718096', margin: 0 }}>{restaurant.address}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
