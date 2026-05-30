'use client';

import React, { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  Loader2,
} from 'lucide-react';
import { CATEGORY_LABEL, PRICE_LABEL, type Restaurant, type Review } from '@/lib/data';
import { apiGet, apiPost } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

function SkeletonBlock({ w = '100%', h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div style={{ width: w, height: h, background: 'linear-gradient(90deg,#E2E8F0 25%,#CBD5E0 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', borderRadius: 8, animation: 'shimmer 1.5s infinite' }} />
  );
}

export default function RestaurantDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, role, toggleBookmark, isBookmarked } = useAuth();
  const { success, error } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await apiGet<Restaurant>(`/culinary/${id}`);
      setRestaurant(data);
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        const revData = await apiGet<Review[]>(`/reviews/culinary/${id}`);
        setReviews(Array.isArray(revData) ? revData : []);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Gagal memuat detail restoran.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleBookmark = async () => {
    if (role === 'guest') { error('Login diperlukan', 'Silakan masuk terlebih dahulu.'); return; }
    setBookmarkLoading(true);
    try {
      const added = await toggleBookmark(id);
      added ? success('Disimpan!', 'Berhasil ditambahkan ke bookmark.') : success('Dihapus', 'Dihapus dari bookmark.');
    } catch { error('Gagal', 'Tidak dapat mengubah bookmark.'); }
    finally { setBookmarkLoading(false); }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) { error('Peringatan', 'Ulasan tidak boleh kosong.'); return; }
    if (role === 'guest') { error('Login diperlukan', 'Anda harus masuk terlebih dahulu.'); return; }
    setReviewSubmitting(true);
    try {
      await apiPost('/reviews', { culinaryPlaceId: id, rating: ratingInput, comment: commentInput.trim() });
      success('Terima kasih!', 'Ulasan Anda berhasil dikirim.');
      setCommentInput(''); setRatingInput(5); setShowReviewForm(false);
      await fetchDetail();
    } catch (err) { error('Gagal', err instanceof Error ? err.message : 'Gagal mengirim ulasan.'); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SkeletonBlock h={380} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonBlock h={32} w="60%" /><SkeletonBlock h={20} w="40%" /><SkeletonBlock h={80} />
            </div>
            <SkeletonBlock h={200} />
          </div>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  if (fetchError || !restaurant) {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <Utensils size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#1A1A2E', marginBottom: 8 }}>Restoran tidak ditemukan</h2>
          <p style={{ color: '#718096', marginBottom: 20, fontSize: 14 }}>{fetchError ?? 'Data tidak tersedia.'}</p>
          <button onClick={() => router.back()} style={{ padding: '10px 20px', background: '#D65A31', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>← Kembali</button>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(id);

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'relative', height: 380, overflow: 'hidden', background: '#0B2F35' }}>
        {restaurant.coverImage && <img src={restaurant.coverImage} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(11,47,53,0.85) 0%,transparent 60%)' }} />
        <button onClick={() => router.back()} style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <button onClick={handleBookmark} disabled={bookmarkLoading} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: bookmarked ? '#D65A31' : 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: `1px solid ${bookmarked ? '#D65A31' : 'rgba(255,255,255,0.2)'}`, color: '#fff', cursor: bookmarkLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          {bookmarkLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Heart size={16} fill={bookmarked ? '#fff' : 'none'} />}
        </button>
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D65A31', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Sparkles size={11} />{CATEGORY_LABEL[restaurant.category] ?? restaurant.category}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{restaurant.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={14} fill="#F6C90E" stroke="#F6C90E" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Number(restaurant.rating).toFixed(1)}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>({restaurant.reviewCount} ulasan)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              <MapPin size={12} />{restaurant.district}, {restaurant.city}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 12 }}>
              {PRICE_LABEL[restaurant.priceRange]}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div className="detail-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0B2F35', marginBottom: 12 }}>Tentang Restoran</h2>
              <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.7, margin: 0 }}>{restaurant.description}</p>
              {restaurant.ambiance && restaurant.ambiance.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {restaurant.ambiance.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: '#0B2F35', background: 'rgba(11,47,53,0.08)', padding: '4px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {restaurant.menu && restaurant.menu.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0B2F35', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Utensils size={16} color="#D65A31" />Menu Unggulan</h2>
                  <Link href={`/restaurant/${id}/menu`} style={{ fontSize: 12, fontWeight: 700, color: '#D65A31', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1.5px solid #D65A31', borderRadius: 8 }}>
                    Lihat Semua <ChevronRight size={13} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {restaurant.menu.slice(0, 4).map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #F8F9FA' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 2px' }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{item.description}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#D65A31', whiteSpace: 'nowrap', marginLeft: 12 }}>Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                {restaurant.menu.length > 4 && (
                  <Link href={`/restaurant/${id}/menu`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '11px', background: 'linear-gradient(135deg,#0B2F35,#1E5260)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    Lihat Semua {restaurant.menu.length} Menu <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0B2F35', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={16} color="#D65A31" />Ulasan Pengunjung</h2>
                {role !== 'guest' && (
                  <button onClick={() => setShowReviewForm((v) => !v)} style={{ fontSize: 12, fontWeight: 700, padding: '7px 14px', background: showReviewForm ? '#E2E8F0' : 'linear-gradient(135deg,#D65A31,#B84A24)', color: showReviewForm ? '#4A5568' : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    {showReviewForm ? 'Batal' : '+ Tulis Ulasan'}
                  </button>
                )}
              </div>

              {showReviewForm && role !== 'guest' && (
                <form onSubmit={handleReviewSubmit} style={{ background: '#FAFBFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 6 }}>Rating</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setRatingInput(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <Star size={22} fill={s <= (hoverRating ?? ratingInput) ? '#F6C90E' : 'none'} stroke={s <= (hoverRating ?? ratingInput) ? '#F6C90E' : '#CBD5E0'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 6 }}>Ulasan Anda</label>
                    <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Bagikan pengalaman kuliner Anda..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#1A1A2E', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={reviewSubmitting} style={{ padding: '10px 20px', background: reviewSubmitting ? '#A0AEC0' : 'linear-gradient(135deg,#D65A31,#B84A24)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: reviewSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {reviewSubmitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                    {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </form>
              )}

              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {reviews.map((rev) => (
                    <div key={rev.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1E5260,#0B2F35)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{rev.userName.substring(0,2).toUpperCase()}</div>
                          <div>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{rev.userName}</h4>
                            <span style={{ fontSize: 11, color: '#A0AEC0' }}>{rev.date}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= rev.rating ? '#F6C90E' : 'none'} stroke={s <= rev.rating ? '#F6C90E' : '#E2E8F0'} />)}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#4A5568', margin: 0, lineHeight: 1.5, paddingLeft: 42 }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A0AEC0' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Belum ada ulasan. Jadi yang pertama mengulas!</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 16, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>Informasi Kontak</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <MapPin size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div><h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Alamat</h5><p style={{ fontSize: 12, color: '#718096', margin: 0, lineHeight: 1.4 }}>{restaurant.address}</p></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Clock size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div><h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Jam Operasional</h5><p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{restaurant.openHours}</p></div>
                </div>
                {restaurant.phone && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Phone size={16} color="#718096" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div><h5 style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', margin: '0 0 2px' }}>Telepon</h5><p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{restaurant.phone}</p></div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} style={{ padding: '11px', background: '#0B2F35', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Phone size={14} />Hubungi Sekarang
                  </a>
                )}
                <Link href={`/restaurant/${id}/menu`} style={{ padding: '11px', background: 'linear-gradient(135deg,#D65A31,#B84A24)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Utensils size={14} />Lihat Semua Menu
                </Link>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 260, background: '#E2E8F0' }}>
                {restaurant.mapUrl && restaurant.mapUrl.startsWith('https://') ? (
                  <iframe src={restaurant.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" title={`Peta ${restaurant.name}`} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#E2E8F0,#CBD5E0)', color: '#4A5568', textAlign: 'center', padding: 20 }}>
                    <MapPin size={36} color="#D65A31" style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>Peta Lokasi</p>
                    <p style={{ fontSize: 10, color: '#718096', margin: 0 }}>{restaurant.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @media(max-width:820px){.detail-layout{grid-template-columns:1fr !important}}
      `}</style>
    </div>
  );
}
