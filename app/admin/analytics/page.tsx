'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  MapPin,
  Star,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { CATEGORY_LABEL } from '@/lib/data';

export default function AdminAnalyticsPage() {
  const { role } = useAuth();
  const { restaurants } = useRestaurant();

  // Authorization Check
  if (role !== 'admin') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 460, width: '100%', background: '#fff', borderRadius: 24, padding: '48px 36px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', margin: '0 auto 20px' }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 10 }}>Akses Ditolak</h1>
          <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.6, marginBottom: 28 }}>
            Halaman ini dilindungi dan hanya dapat diakses oleh Administrator platform Local Taste Hub.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: 10,
              background: 'linear-gradient(135deg, #0B2F35, #1E5260)', color: '#fff',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(11, 47, 53, 0.2)',
            }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 1. Chart Data: Distribution by District (Kecamatan)
  const districtChartData = useMemo(() => {
    const counts: Record<string, number> = {
      'Klojen': 0,
      'Blimbing': 0,
      'Lowokwaru': 0,
      'Sukun': 0,
      'Kedungkandang': 0,
    };
    restaurants.forEach((r) => {
      if (counts[r.district] !== undefined) {
        counts[r.district]++;
      } else {
        counts[r.district] = 1;
      }
    });

    const maxVal = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: (count / maxVal) * 100,
    }));
  }, [restaurants]);

  // 2. Chart Data: Category Breakdown
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    restaurants.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const total = restaurants.length || 1;
    return Object.entries(counts)
      .map(([cat, count]) => ({
        catKey: cat,
        name: CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL] || cat,
        count,
        pct: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [restaurants]);

  // 3. Top Rated Restaurants (Top 5)
  const topRatedList = useMemo(() => {
    return [...restaurants]
      .filter((r) => r.rating > 0)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, 5);
  }, [restaurants]);

  // 4. Aggregated Recent Reviews Feed
  const recentReviews = useMemo(() => {
    const allRev: { id: string; restName: string; restId: string; userName: string; rating: number; comment: string; date: string }[] = [];
    restaurants.forEach((r) => {
      r.reviews.forEach((rev) => {
        allRev.push({
          id: rev.id,
          restId: r.id,
          restName: r.name,
          userName: rev.userName,
          rating: rev.rating,
          comment: rev.comment,
          date: rev.date,
        });
      });
    });

    // Sort by date (assuming id is rev-timestamp or has timestamp)
    return allRev
      .sort((a, b) => {
        // Fallback simple compare on string id which has timestamp
        return b.id.localeCompare(a.id);
      })
      .slice(0, 5);
  }, [restaurants]);

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 20, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <BarChart3 size={22} color="#D65A31" />
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Analitik & Statistik</h1>
            </div>
            <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>Visualisasi data persebaran kuliner lokal dan metrik kinerja ulasan pengguna.</p>
          </div>
          <Link
            href="/admin"
            style={{
              padding: '8px 16px', background: '#0B2F35', color: '#fff',
              fontSize: 12, fontWeight: 700, borderRadius: 8, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Buka CRUD Panel
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }} className="analytics-grid">
          
          {/* Chart 1: District Distribution (Bar Chart SVG/HTML) */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="#D65A31" />
              Persebaran Restoran per Kecamatan
            </h3>
            
            {/* Visual Bar Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {districtChartData.map((dist) => (
                <div key={dist.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                    <span>{dist.name}</span>
                    <span style={{ color: '#0B2F35' }}>{dist.count} Restoran</span>
                  </div>
                  {/* Outer Bar */}
                  <div style={{ width: '100%', height: 12, background: '#F1F5F9', borderRadius: 20, overflow: 'hidden' }}>
                    {/* Inner Bar */}
                    <div
                      style={{
                        width: `${dist.pct}%`, height: '100%',
                        background: 'linear-gradient(90deg, #D65A31, #F07348)',
                        borderRadius: 20, transition: 'width 0.8s ease-in-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="#0B2F35" />
              Pembagian Berdasarkan Kategori
            </h3>
            
            {/* Visual breakdown list with progressive progress indicator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoryChartData.length === 0 ? (
                <p style={{ fontSize: 12, color: '#A0AEC0', textAlign: 'center' }}>Tidak ada data kategori.</p>
              ) : (
                categoryChartData.map((cat) => (
                  <div key={cat.catKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>
                      <span>{cat.name}</span>
                      <span style={{ color: '#1E5260' }}>
                        {cat.count} resto ({cat.pct.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Outer Progress */}
                    <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 20, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${cat.pct}%`, height: '100%',
                          background: 'linear-gradient(90deg, #0B2F35, #1E5260)',
                          borderRadius: 20,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 28 }} className="analytics-grid">
          
          {/* Chart 3: Top Rated Ranking list */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="#D65A31" />
              Restoran Peringkat Tertinggi (Top 5)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topRatedList.length === 0 ? (
                <p style={{ fontSize: 12, color: '#A0AEC0', textAlign: 'center' }}>Belum ada ulasan restoran.</p>
              ) : (
                topRatedList.map((rest, index) => (
                  <div
                    key={rest.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                      background: '#FAFBFB', border: '1px solid #F1F5F9', borderRadius: 12,
                    }}
                  >
                    {/* Position circle */}
                    <div
                      style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: index === 0 ? 'linear-gradient(135deg, #F6C90E, #D69E2E)' : index === 1 ? '#E2E8F0' : index === 2 ? '#EDF2F7' : '#fff',
                        color: index <= 2 ? '#2D3748' : '#A0AEC0',
                        border: index > 2 ? '1px solid #E2E8F0' : 'none',
                        fontSize: 12, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Rest info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/restaurant/${rest.id}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rest.name}
                        </h4>
                      </Link>
                      <span style={{ fontSize: 11, color: '#A0AEC0' }}>{rest.district} · {rest.reviewCount} ulasan</span>
                    </div>

                    {/* Rating badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(246, 201, 14, 0.1)', color: '#D69E2E', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      <Star size={12} fill="#F6C90E" stroke="none" />
                      {rest.rating.toFixed(1)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Aggregated Reviews Feed */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} color="#0B2F35" />
              Feed Ulasan Terbaru
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A0AEC0' }}>
                  <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 12, margin: 0 }}>Belum ada ulasan masuk.</p>
                </div>
              ) : (
                recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      paddingBottom: 12, borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{rev.userName}</span>
                        <span style={{ fontSize: 11, color: '#A0AEC0' }}> pada </span>
                        <Link href={`/restaurant/${rev.restId}`} style={{ fontSize: 12, fontWeight: 700, color: '#D65A31', textDecoration: 'none' }}>
                          {rev.restName}
                        </Link>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Star size={11} fill="#F6C90E" stroke="none" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#D69E2E' }}>{rev.rating}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: '#718096', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 800px) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
