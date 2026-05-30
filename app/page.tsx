'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Shuffle,
  Star,
  Heart,
  MapPin,
  Clock,
  ChevronRight,
  Flame,
  Coffee,
  Soup,
  IceCream,
  Moon,
  SlidersHorizontal,
  X,
  TrendingUp,
} from 'lucide-react';
import {
  DISTRICTS,
  PRICE_LABEL,
  CATEGORY_LABEL,
  type Category,
  type PriceRange,
  type Restaurant,
} from '@/lib/data';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORIES: { id: Category | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all',          label: 'Semua',        icon: Flame },
  { id: 'street-food',  label: 'Street Food',  icon: Flame },
  { id: 'cafe',         label: 'Cozy Cafe',    icon: Coffee },
  { id: 'noodle',       label: 'Noodle Spots', icon: Soup },
  { id: 'dessert',      label: 'Dessert',      icon: IceCream },
  { id: 'night-hangout',label: 'Night Hangout',icon: Moon },
];

const PRICE_OPTIONS: { value: PriceRange | 'all'; label: string }[] = [
  { value: 'all',     label: 'Semua Harga' },
  { value: 'budget',  label: 'Budget (< 30k)' },
  { value: 'mid',     label: 'Mid (30k–75k)' },
  { value: 'premium', label: 'Premium (75k+)' },
];

// ─── Star Rating Display ──────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= Math.round(rating) ? '#F6C90E' : 'none'}
          stroke={s <= Math.round(rating) ? '#F6C90E' : '#CBD5E0'}
          strokeWidth={1.5}
        />
      ))}
      <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748', marginLeft: 3 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Restaurant Card ──────────────────────────────────────────────────────────
function RestaurantCard({
  restaurant,
  onBookmark,
  isBookmarked,
}: {
  restaurant: Restaurant;
  onBookmark: (id: string) => void;
  isBookmarked: boolean;
}) {
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <article
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(214,90,49,0.14)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
      }}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', height: 190, overflow: 'hidden' }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.thumbnailImage}
          alt={restaurant.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            transform: imgHovered ? 'scale(1.07)' : 'scale(1)',
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
          }}
        />
        {/* Category badge */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(11,47,53,0.85)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          {CATEGORY_LABEL[restaurant.category]}
        </span>
        {/* Bookmark button */}
        <button
          aria-label={isBookmarked ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmark(restaurant.id);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: isBookmarked ? '#D65A31' : 'rgba(255,255,255,0.92)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'background 0.25s, transform 0.2s',
            transform: isBookmarked ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <Heart
            size={16}
            fill={isBookmarked ? '#fff' : 'none'}
            stroke={isBookmarked ? '#fff' : '#D65A31'}
            strokeWidth={2}
          />
        </button>
        {/* Price badge */}
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: 'rgba(214,90,49,0.92)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
          }}
        >
          {PRICE_LABEL[restaurant.priceRange]}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link
          href={`/restaurant/${restaurant.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h3
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#1A1A2E',
              margin: '0 0 6px',
              lineHeight: 1.3,
            }}
          >
            {restaurant.name}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <MapPin size={12} color="#718096" />
          <span style={{ fontSize: 12, color: '#718096' }}>
            {restaurant.district}, {restaurant.city}
          </span>
        </div>

        <StarRating rating={restaurant.rating} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            paddingTop: 10,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <Clock size={12} color="#A0AEC0" />
          <span style={{ fontSize: 11, color: '#A0AEC0', flex: 1 }}>{restaurant.openHours}</span>
          <span style={{ fontSize: 11, color: '#718096' }}>
            {restaurant.reviewCount} ulasan
          </span>
        </div>
      </div>
    </article>
  );
}

// ─── Random Pick Modal ────────────────────────────────────────────────────────
function RandomPickModal({
  isOpen,
  onClose,
  restaurant,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
}) {
  if (!restaurant) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎲 Rekomendasi Acak Untukmu!" id="random-pick-modal" size="md">
      <div style={{ textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            borderRadius: 12,
            marginBottom: 16,
          }}
        />
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 6 }}>
          {restaurant.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <MapPin size={14} color="#718096" />
          <span style={{ fontSize: 13, color: '#718096' }}>
            {restaurant.address}
          </span>
        </div>
        <StarRating rating={restaurant.rating} />
        <p style={{ marginTop: 12, fontSize: 13, color: '#4A5568', lineHeight: 1.6 }}>
          {restaurant.description}
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <Link
            href={`/restaurant/${restaurant.id}`}
            onClick={onClose}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '12px',
              background: 'linear-gradient(135deg, #D65A31, #B84A24)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(214,90,49,0.35)',
            }}
          >
            Lihat Detail →
          </Link>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#F8F9FA',
              color: '#4A5568',
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Homepage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { role, toggleBookmark, isBookmarked } = useAuth();
  const { success, error } = useToast();
  const { restaurants } = useRestaurant();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<PriceRange | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState(0);
  const [ambianceFilter, setAmbianceFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Random modal
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [randomRestaurant, setRandomRestaurant] = useState<Restaurant | null>(null);

  // Filtered restaurants
  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.menu?.some((m) => m.name.toLowerCase().includes(q));
      const matchCat = activeCategory === 'all' || r.category === activeCategory || r.categories?.includes(activeCategory);
      const matchPrice = priceFilter === 'all' || r.priceRange === priceFilter;
      const matchDistrict = districtFilter === 'all' || r.district === districtFilter;
      const matchRating = r.rating >= minRating;
      const matchAmbiance =
        ambianceFilter === 'all' || r.ambiance.includes(ambianceFilter as 'indoor' | 'outdoor');
      return matchSearch && matchCat && matchPrice && matchDistrict && matchRating && matchAmbiance;
    });
  }, [restaurants, searchQuery, activeCategory, priceFilter, districtFilter, minRating, ambianceFilter]);

  const handleBookmark = useCallback(
    async (id: string) => {
      if (role === 'guest') {
        error('Gagal!', 'Anda harus login terlebih dahulu untuk menyimpan favorit.');
        return;
      }
      try {
        const added = await toggleBookmark(id);
        if (added) {
          success('Berhasil!', 'Restoran berhasil ditambahkan ke favorit!');
        } else {
          success('Dihapus', 'Restoran dihapus dari favorit.');
        }
      } catch {
        error('Gagal', 'Tidak dapat mengubah bookmark.');
      }
    },
    [role, toggleBookmark, success, error]
  );

  const handleRandom = () => {
    if (restaurants.length === 0) {
      error('Ups!', 'Tidak ada restoran tersedia saat ini.');
      return;
    }
    const pick = restaurants[Math.floor(Math.random() * restaurants.length)];
    setRandomRestaurant(pick);
    setRandomModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setPriceFilter('all');
    setDistrictFilter('all');
    setMinRating(0);
    setAmbianceFilter('all');
  };

  const activeFilterCount = [
    priceFilter !== 'all',
    districtFilter !== 'all',
    minRating > 0,
    ambianceFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B2F35 0%, #1E5260 50%, #0B2F35 100%)',
          padding: '64px 20px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute', top: -60, right: -60, width: 300, height: 300,
            borderRadius: '50%', background: 'rgba(214,90,49,0.08)', pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: -40, left: -40, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(214,90,49,0.06)', pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(214,90,49,0.15)', border: '1px solid rgba(214,90,49,0.3)',
              borderRadius: 20, padding: '6px 14px', marginBottom: 20,
            }}
          >
            <TrendingUp size={14} color="#D65A31" />
            <span style={{ fontSize: 12, color: '#D65A31', fontWeight: 600 }}>
              {restaurants.length}+ Kuliner Lokal Terkurasi
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 14,
              letterSpacing: '-0.5px',
            }}
          >
            Temukan Kuliner Lokal<br />
            <span style={{ color: '#D65A31' }}>Terbaik</span> di Sekitarmu
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 32, lineHeight: 1.7 }}>
            Dari warung pinggir jalan hingga kafe modern — semua ada di sini.
          </p>

          {/* Search bar */}
          <div
            style={{
              position: 'relative',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#A0AEC0',
                pointerEvents: 'none',
              }}
            />
            <input
              id="hero-search-input"
              type="search"
              placeholder="Cari nama restoran, menu favorit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 56px',
                borderRadius: 14,
                border: '2px solid transparent',
                fontSize: 15,
                outline: 'none',
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'border-color 0.2s',
                color: '#1A1A2E',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#D65A31')}
              onBlur={(e) => (e.target.style.borderColor = 'transparent')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: '#F1F5F9', border: 'none', borderRadius: 6, width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <X size={13} color="#718096" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── CATEGORY TABS ────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #F1F5F9' }}>
        <div
          style={{
            maxWidth: 1280, margin: '0 auto', padding: '0 20px',
            display: 'flex', gap: 6, overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                id={`cat-btn-${id}`}
                onClick={() => setActiveCategory(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '14px 18px',
                  border: 'none', borderBottom: active ? '2px solid #D65A31' : '2px solid transparent',
                  background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  color: active ? '#D65A31' : '#718096',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  transition: 'color 0.2s, border-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Sidebar Filter (desktop) ──────────────────────── */}
          <aside
            style={{
              width: 260, flexShrink: 0, position: 'sticky', top: 88,
              background: '#fff', borderRadius: 16, padding: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'none',
            }}
            className="desktop-sidebar"
          >
            <FilterPanel
              priceFilter={priceFilter}
              districtFilter={districtFilter}
              minRating={minRating}
              ambianceFilter={ambianceFilter}
              onPrice={setPriceFilter}
              onDistrict={setDistrictFilter}
              onRating={setMinRating}
              onAmbiance={setAmbianceFilter}
              onReset={resetFilters}
              activeCount={activeFilterCount}
            />
          </aside>

          {/* ── Grid ─────────────────────────────────────────── */}
          <div style={{ flex: 1 }}>
            {/* Toolbar */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, gap: 12,
              }}
            >
              <p style={{ color: '#718096', fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: '#1A1A2E' }}>{filtered.length}</span> restoran ditemukan
              </p>
              {/* Mobile filter toggle */}
              <button
                id="mobile-filter-toggle"
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 14px', borderRadius: 10,
                  background: activeFilterCount > 0 ? '#D65A31' : '#fff',
                  color: activeFilterCount > 0 ? '#fff' : '#4A5568',
                  border: `1px solid ${activeFilterCount > 0 ? '#D65A31' : '#E2E8F0'}`,
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}
                className="show-on-mobile"
              >
                <SlidersHorizontal size={15} />
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🍽️</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', marginBottom: 6 }}>
                  Tidak ada restoran ditemukan
                </h3>
                <p style={{ color: '#718096', fontSize: 14, marginBottom: 20 }}>
                  Coba ubah filter atau kata kunci pencarianmu.
                </p>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '10px 24px', background: '#D65A31', color: '#fff',
                    border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 20,
                }}
              >
                {filtered.map((r) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    onBookmark={handleBookmark}
                    isBookmarked={isBookmarked(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FAB: Random Pick ──────────────────────────────────── */}
      <button
        id="fab-random-pick"
        onClick={handleRandom}
        title="Bingung Makan Apa?"
        style={{
          position: 'fixed', bottom: 28, right: 24,
          display: 'flex', alignItems: 'center', gap: 9,
          background: 'linear-gradient(135deg, #D65A31, #B84A24)',
          color: '#fff', border: 'none', borderRadius: 40,
          padding: '14px 22px',
          fontWeight: 700, fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(214,90,49,0.45)',
          zIndex: 800,
          animation: 'pulse-orange 2.5s infinite',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.03)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 36px rgba(214,90,49,0.55)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(214,90,49,0.45)';
        }}
      >
        <Shuffle size={18} />
        Bingung Makan Apa?
      </button>

      {/* ── Mobile Filter Drawer ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 700, animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#fff', borderRadius: '20px 20px 0 0',
              padding: '8px 20px 32px',
              maxHeight: '85vh', overflowY: 'auto',
              animation: 'fadeInUp 0.3s ease',
            }}
          >
            <div
              style={{
                width: 40, height: 4, background: '#E2E8F0', borderRadius: 2,
                margin: '8px auto 20px',
              }}
            />
            <FilterPanel
              priceFilter={priceFilter}
              districtFilter={districtFilter}
              minRating={minRating}
              ambianceFilter={ambianceFilter}
              onPrice={setPriceFilter}
              onDistrict={setDistrictFilter}
              onRating={setMinRating}
              onAmbiance={setAmbianceFilter}
              onReset={resetFilters}
              activeCount={activeFilterCount}
            />
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '100%', marginTop: 16, padding: '13px',
                background: '#D65A31', color: '#fff', border: 'none',
                borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      )}

      {/* Random Modal */}
      <RandomPickModal
        isOpen={randomModalOpen}
        onClose={() => setRandomModalOpen(false)}
        restaurant={randomRestaurant}
      />

      {/* Inline responsive helpers */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-sidebar { display: block !important; }
          .show-on-mobile  { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-sidebar { display: none !important; }
          .show-on-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Filter Panel (shared) ────────────────────────────────────────────────────
function FilterPanel({
  priceFilter, districtFilter, minRating, ambianceFilter,
  onPrice, onDistrict, onRating, onAmbiance, onReset, activeCount,
}: {
  priceFilter: PriceRange | 'all';
  districtFilter: string;
  minRating: number;
  ambianceFilter: 'all' | 'indoor' | 'outdoor';
  onPrice: (v: PriceRange | 'all') => void;
  onDistrict: (v: string) => void;
  onRating: (v: number) => void;
  onAmbiance: (v: 'all' | 'indoor' | 'outdoor') => void;
  onReset: () => void;
  activeCount: number;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: '#0B2F35' }}>Filter</h2>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            style={{
              background: 'none', border: 'none', color: '#D65A31',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reset ({activeCount})
          </button>
        )}
      </div>

      {/* Location */}
      <FilterSection label="Lokasi (Kecamatan)">
        <select
          id="filter-district"
          value={districtFilter}
          onChange={(e) => onDistrict(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Semua Kecamatan</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </FilterSection>

      {/* Price */}
      <FilterSection label="Rentang Harga">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRICE_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 13, color: '#4A5568' }}>
              <input
                type="radio"
                name="price-filter"
                value={opt.value}
                checked={priceFilter === opt.value}
                onChange={() => onPrice(opt.value as PriceRange | 'all')}
                style={{ accentColor: '#D65A31' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection label={`Rating Minimum (${minRating > 0 ? `${minRating}★` : 'Semua'})`}>
        <input
          id="filter-rating-slider"
          type="range" min={0} max={5} step={0.5}
          value={minRating}
          onChange={(e) => onRating(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#D65A31' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
          <span>0</span><span>5 ★</span>
        </div>
      </FilterSection>

      {/* Ambiance */}
      <FilterSection label="Suasana">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', 'indoor', 'outdoor'] as const).map((a) => (
            <button
              key={a}
              id={`filter-ambiance-${a}`}
              onClick={() => onAmbiance(a)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${ambianceFilter === a ? '#D65A31' : '#E2E8F0'}`,
                background: ambianceFilter === a ? '#D65A31' : '#fff',
                color: ambianceFilter === a ? '#fff' : '#4A5568',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {a === 'all' ? 'Semua' : a === 'indoor' ? 'Indoor' : 'Outdoor'}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid #E2E8F0', fontSize: 13, color: '#2D3748',
  background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'auto',
};
