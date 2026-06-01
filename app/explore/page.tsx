'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRestaurant } from '@/context/RestaurantContext';
import { useAuth } from '@/context/AuthContext';
import { useToast as useGlobalToast } from '@/components/ui/Toast';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Heart,
  X,
  Navigation,
} from 'lucide-react';
import { DISTRICTS, CATEGORY_LABEL, PRICE_LABEL, type Category, type PriceRange, type Restaurant } from '@/lib/data';

const PRICE_OPTIONS: { value: PriceRange | 'all'; label: string }[] = [
  { value: 'all',     label: 'Semua Harga' },
  { value: 'budget',  label: 'Budget (< 30k)' },
  { value: 'mid',     label: 'Mid (30k–75k)' },
  { value: 'premium', label: 'Premium (75k+)' },
];

// District coordinate definitions for the map simulator
const DISTRICT_COORDS: Record<string, { x: number; y: number; color: string }> = {
  'Klojen': { x: 50, y: 50, color: '#D65A31' }, // center
  'Blimbing': { x: 75, y: 25, color: '#2B6CB0' }, // top-right
  'Lowokwaru': { x: 30, y: 25, color: '#319795' }, // top-left
  'Sukun': { x: 25, y: 75, color: '#D69E2E' }, // bottom-left
  'Kedungkandang': { x: 80, y: 75, color: '#4A5568' }, // bottom-right
};

export default function ExplorePage() {
  const { restaurants, refetch } = useRestaurant();
  const { role, toggleBookmark, isBookmarked } = useAuth();
  const { success, error } = useGlobalToast();

  React.useEffect(() => {
    refetch({ limit: 100 });
  }, [refetch]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<PriceRange | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  
  // Selected restaurant for map highlighting
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Mobile toggle between List view and Map view
  const [mobileMode, setMobileMode] = useState<'list' | 'map'>('list');

  // Filter restaurants
  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.menu?.some((m) => m.name.toLowerCase().includes(q));
      const matchCat = activeCategory === 'all' || r.category?.slug === activeCategory || r.category === activeCategory || r.categories?.includes(activeCategory);
      const matchPrice = priceFilter === 'all' || r.priceRange === priceFilter;
      const matchDistrict = districtFilter === 'all' || r.district === districtFilter;
      return matchSearch && matchCat && matchPrice && matchDistrict;
    });
  }, [restaurants, searchQuery, activeCategory, priceFilter, districtFilter]);

  const handleBookmark = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (role === 'guest') {
        error('Gagal', 'Silakan login terlebih dahulu untuk menyimpan favorit.');
        return;
      }
      try {
        const added = await toggleBookmark(id);
        if (added) {
          success('Berhasil!', 'Ditambahkan ke favorit.');
        } else {
          success('Dihapus', 'Dihapus dari favorit.');
        }
      } catch {
        error('Gagal', 'Tidak dapat mengubah bookmark.');
      }
    },
    [role, toggleBookmark, success, error]
  );

  // Generate deterministic Jitter coordinates on Map based on ID
  const getCoords = useCallback((rest: Restaurant) => {
    const base = DISTRICT_COORDS[rest.district] || { x: 50, y: 50, color: '#D65A31' };
    
    // Hash restaurant ID to get jitter offset
    let hash = 0;
    for (let i = 0; i < rest.id.length; i++) {
      hash = rest.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Offset between -12 and +12
    const jx = (hash % 16) - 8;
    const jy = (Math.floor(hash / 7) % 16) - 8;
    
    return {
      x: Math.max(10, Math.min(90, base.x + jx)),
      y: Math.max(10, Math.min(90, base.y + jy)),
      color: base.color,
    };
  }, []);

  const selectedRest = useMemo(() => {
    return restaurants.find((r) => r.id === selectedId) || null;
  }, [restaurants, selectedId]);

  return (
    <div style={{ background: '#F8F9FA', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── FILTER & SEARCH BAR ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 20px', zIndex: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input
              type="text"
              placeholder="Cari masakan, nama restoran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={filterInputStyle}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={clearBtnStyle}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* District Select */}
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} style={selectStyle}>
            <option value="all">📍 Semua Kecamatan</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Category Select */}
          <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value as Category | 'all')} style={selectStyle}>
            <option value="all">🍽️ Semua Kategori</option>
            <option value="street-food">Street Food</option>
            <option value="cafe">Cozy Cafe</option>
            <option value="noodle">Noodle Spots</option>
            <option value="dessert">Dessert</option>
            <option value="night-hangout">Night Hangout</option>
          </select>

          {/* Price Select */}
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value as PriceRange | 'all')} style={selectStyle}>
            <option value="all">💰 Semua Harga</option>
            {PRICE_OPTIONS.slice(1).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Map view mobile toggle */}
          <button
            onClick={() => setMobileMode((v) => (v === 'list' ? 'map' : 'list'))}
            style={{
              padding: '10px 16px', background: '#0B2F35', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            className="mobile-toggle-btn"
          >
            {mobileMode === 'list' ? (
              <>
                <MapIcon size={14} />
                Lihat Peta
              </>
            ) : (
              <>
                <ListIcon size={14} />
                Lihat Daftar
              </>
            )}
          </button>

        </div>
      </section>

      {/* ── SPLIT LAYOUT CONTAINER ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: List */}
        <div
          style={{
            width: '400px', flexShrink: 0, borderRight: '1px solid #E2E8F0',
            background: '#fff', display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}
          className={`list-panel ${mobileMode === 'map' ? 'mobile-hide' : ''}`}
        >
          <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Hasil Pencarian ({filtered.length})
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
              <Compass size={40} style={{ opacity: 0.3, marginBottom: 12, margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Restoran Tidak Ditemukan</h4>
              <p style={{ fontSize: 12, margin: 0 }}>Coba ubah filter atau kata kunci Anda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((rest) => {
                const isSelected = selectedId === rest.id;
                return (
                  <div
                    key={rest.id}
                    onClick={() => { setSelectedId(rest.id); setMobileMode('map'); }}
                    style={{
                      padding: 16, borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                      background: isSelected ? 'rgba(214, 90, 49, 0.04)' : '#fff',
                      borderLeft: isSelected ? '4px solid #D65A31' : '4px solid transparent',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={() => setSelectedId(rest.id)}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rest.thumbnailImage}
                        alt={rest.name}
                        style={{ width: 70, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #E2E8F0' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rest.name}
                          </h4>
                          <button onClick={(e) => handleBookmark(e, rest.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Heart size={14} fill={isBookmarked(rest.id) ? '#D65A31' : 'none'} color="#D65A31" />
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#718096', marginBottom: 4 }}>
                          <MapPin size={10} />
                          <span>{rest.district}</span>
                          <span>·</span>
                          <span style={{ color: '#D65A31', fontWeight: 600 }}>{PRICE_LABEL[rest.priceRange]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 1, color: '#D69E2E', fontWeight: 700 }}>
                            <Star size={11} fill="#F6C90E" stroke="none" />
                            {rest.rating.toFixed(1)}
                          </div>
                          <span style={{ color: '#A0AEC0', fontSize: 11 }}>({rest.reviewCount} ulasan)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Map Simulator */}
        <div
          style={{
            flex: 1, position: 'relative', background: '#EBF3F5',
            display: 'flex', flexDirection: 'column',
          }}
          className={`map-panel ${mobileMode === 'list' ? 'mobile-hide' : ''}`}
        >
          {/* Map canvas containing street/river decorations */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            
            {/* SVG river & main road decoration lines */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* River */}
              <path
                d="M -50 200 C 300 250, 450 650, 1200 680"
                fill="none" stroke="#CBE6EC" strokeWidth="48" strokeLinecap="round" opacity="0.6"
              />
              <path
                d="M -50 200 C 300 250, 450 650, 1200 680"
                fill="none" stroke="#B9DEE7" strokeWidth="36" strokeLinecap="round" opacity="0.8"
              />
              {/* Main Highway 1 */}
              <line x1="-50" y1="350" x2="1500" y2="350" stroke="#fff" strokeWidth="16" opacity="0.8" />
              <line x1="-50" y1="350" x2="1500" y2="350" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,4" />
              {/* Main Highway 2 */}
              <line x1="500" y1="-50" x2="500" y2="1200" stroke="#fff" strokeWidth="16" opacity="0.8" />
              <line x1="500" y1="-50" x2="500" y2="1200" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6,4" />
            </svg>

            {/* District Labels */}
            {Object.entries(DISTRICT_COORDS).map(([name, val]) => (
              <div
                key={name}
                style={{
                  position: 'absolute', left: `${val.x}%`, top: `${val.y}%`,
                  transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                  textAlign: 'center', opacity: 0.18, zIndex: 1,
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 900, color: '#0B2F35', textTransform: 'uppercase', letterSpacing: 2 }}>
                  {name}
                </span>
              </div>
            ))}

            {/* Pins of filtered restaurants */}
            {filtered.map((rest) => {
              const coords = getCoords(rest);
              const isSelected = selectedId === rest.id;
              return (
                <button
                  key={rest.id}
                  onClick={() => setSelectedId(rest.id)}
                  style={{
                    position: 'absolute', left: `${coords.x}%`, top: `${coords.y}%`,
                    transform: 'translate(-50%, -100%)', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    zIndex: isSelected ? 50 : 10, outline: 'none', padding: 0,
                  }}
                >
                  {/* Pin Dot/Pointer */}
                  <div
                    style={{
                      width: isSelected ? 34 : 26, height: isSelected ? 34 : 26,
                      borderRadius: '50% 50% 50% 0',
                      background: isSelected ? '#D65A31' : coords.color,
                      transform: 'rotate(-45deg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                      transition: 'width 0.2s, height 0.2s, background-color 0.2s',
                    }}
                  >
                    {/* Inner core */}
                    <div
                      style={{
                        width: isSelected ? 12 : 8, height: isSelected ? 12 : 8,
                        background: '#fff', borderRadius: '50%', transform: 'rotate(45deg)',
                      }}
                    />
                  </div>
                  {/* Pin Shadow */}
                  <div
                    style={{
                      width: isSelected ? 10 : 6, height: 2, background: 'rgba(0,0,0,0.2)',
                      borderRadius: '50%', marginTop: 2,
                    }}
                  />
                </button>
              );
            })}

            {/* Floating selected Restaurant Card info box on the map */}
            {selectedRest && (
              <div
                style={{
                  position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                  background: '#fff', borderRadius: 16, width: '90%', maxWidth: 350,
                  padding: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', zIndex: 150,
                  border: '1px solid #E2E8F0', display: 'flex', gap: 12,
                  animation: 'fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedRest.thumbnailImage}
                  alt={selectedRest.name}
                  style={{ width: 80, height: 75, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid #F1F5F9' }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{
                      position: 'absolute', top: 12, right: 12, background: '#F1F5F9',
                      border: 'none', borderRadius: '50%', width: 22, height: 22,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <X size={10} color="#718096" />
                  </button>

                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0B2F35', margin: '0 0 4px', paddingRight: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedRest.name}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#718096', marginBottom: 4 }}>
                    <MapPin size={10} />
                    <span>{selectedRest.district}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#D69E2E', fontSize: 12, fontWeight: 700 }}>
                      <Star size={11} fill="#F6C90E" stroke="none" />
                      {selectedRest.rating.toFixed(1)}
                    </div>
                    <span style={{ fontSize: 11, color: '#D65A31', fontWeight: 600 }}>{PRICE_LABEL[selectedRest.priceRange]}</span>
                  </div>

                  <Link
                    href={`/restaurant/${selectedRest.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 12, color: '#D65A31', fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    Detail Selengkapnya
                    <Navigation size={10} />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <style>{`
        .filter-panel-toggle { display: none; }
        @media (min-width: 769px) {
          .mobile-toggle-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .list-panel, .map-panel {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

const filterInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 36px 10px 34px',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  outline: 'none',
  background: '#F8F9FA',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  color: '#4A5568',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer',
};

const clearBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#E2E8F0',
  border: 'none',
  borderRadius: '50%',
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#718096',
};
