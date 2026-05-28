'use client';

import React from 'react';
import { Shield, Sparkles, MapPin, Heart, Users, Award, MessageSquare } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0B2F35 0%, #1E5260 50%, #0B2F35 100%)',
          color: '#fff',
          padding: '80px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(214, 90, 49, 0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span
            style={{
              background: 'rgba(214, 90, 49, 0.2)',
              border: '1px solid rgba(214, 90, 49, 0.4)',
              color: '#D65A31',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 16px',
              borderRadius: 20,
              textTransform: 'uppercase',
              letterSpacing: 1,
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            Tentang Kami
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Menghubungkan Anda dengan <br />
            <span style={{ color: '#D65A31' }}>Cita Rasa Lokal</span> Asli
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
            Local Taste Hub adalah platform rekomendasi kuliner terkurasi untuk membantu Anda menemukan warung legendaris, kafe cozy, dan tempat makan terbaik yang dicintai oleh masyarakat lokal.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ maxWidth: 1000, margin: '-40px auto 60px', padding: '0 20px', position: 'relative', zIndex: 20 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '30px 40px',
            boxShadow: '0 10px 30px rgba(11, 47, 53, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 30,
            textAlign: 'center',
          }}
        >
          <div>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#D65A31', margin: 0 }}>50+</p>
            <p style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Restoran Terkurasi</p>
          </div>
          <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} className="stat-divider">
            <p style={{ fontSize: 36, fontWeight: 800, color: '#0B2F35', margin: 0 }}>1,200+</p>
            <p style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ulasan Asli</p>
          </div>
          <div>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#0B2F35', margin: 0 }}>10k+</p>
            <p style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pecinta Kuliner</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center', marginBottom: 80 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0B2F35', marginBottom: 16 }}>
              Visi Kami: Melestarikan Kuliner Nusantara
            </h2>
            <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.7, marginBottom: 16 }}>
              Setiap sudut daerah memiliki cerita rasa yang unik. Dari resep warisan keluarga di warung tenda pinggir jalan hingga inovasi rasa di kafe modern. Visi kami adalah memastikan kuliner lokal mendapatkan panggung utama yang layak mereka dapatkan.
            </p>
            <p style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.7 }}>
              Kami percaya bahwa rekomendasi makanan terbaik bukan hanya soal kepopuleran, melainkan keaslian rasa dan kualitas yang konsisten. Itulah sebabnya kami hanya menghadirkan ulasan dari komunitas lokal tepercaya.
            </p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(214, 90, 49, 0.1), rgba(11, 47, 53, 0.05))',
              borderRadius: 24,
              padding: 40,
              border: '1px solid rgba(214, 90, 49, 0.15)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D65A31', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B2F35', margin: '0 0 4px' }}>Bebas Ulasan Palsu</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>Semua ulasan di platform kami melalui sistem validasi ketat untuk menghindari bot atau manipulasi bintang.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0B2F35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B2F35', margin: '0 0 4px' }}>Rekomendasi Cerdas</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>Butuh ide instan? Fitur acak "Bingung Makan Apa?" siap memberikan kejutan kuliner lezat terdekat.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E5260', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B2F35', margin: '0 0 4px' }}>Filter Presisi</h3>
                <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>Cari kuliner berdasarkan kecamatan, rentang harga spesifik, suasana indoor/outdoor, dan rating bintang.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', textAlign: 'center', marginBottom: 40 }}>
          Pilar Nilai Kami
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <Award size={36} color="#D65A31" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B2F35', marginBottom: 8 }}>Kualitas Terbaik</h3>
            <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>Setiap lokasi kuliner di platform kami dievaluasi secara berkala berdasarkan higienitas, konsistensi rasa, dan pelayanan.</p>
          </div>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <Users size={36} color="#0B2F35" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B2F35', marginBottom: 8 }}>Dukungan UMKM</h3>
            <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>Kami berkomitmen penuh membantu pemilik usaha kuliner lokal kecil agar lebih dikenal luas oleh para wisatawan lokal.</p>
          </div>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
            <Heart size={36} color="#1E5260" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B2F35', marginBottom: 8 }}>Dipercaya Komunitas</h3>
            <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.6 }}>Ulasan ditulis langsung oleh warga lokal yang mengerti seluk beluk rasa daerah, tanpa disponsori untuk menipu konsumen.</p>
          </div>
        </div>
      </section>

      {/* Styles for screens */}
      <style>{`
        @media (max-width: 768px) {
          .stat-divider {
            border-left: none !important;
            border-right: none !important;
            border-top: 1px solid #E2E8F0;
            border-bottom: 1px solid #E2E8F0;
            padding: 20px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
