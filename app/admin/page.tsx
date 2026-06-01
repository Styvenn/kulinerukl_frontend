'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Star,
  MessageSquare,
  Utensils,
  MapPin,
  Loader2,
  Search,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { DISTRICTS, CATEGORY_LABEL, PRICE_LABEL, type Category, type PriceRange, type Ambiance, type Restaurant } from '@/lib/data';
import { Pagination } from '@/components/ui/Pagination';

const MOCK_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format&fit=crop&q=60',
];

export default function AdminDashboardPage() {
  const { role } = useAuth();
  const { restaurants, addRestaurant, updateRestaurant, deleteRestaurant, refetch } = useRestaurant();
  const { success, error } = useToast();

  React.useEffect(() => {
    refetch({ limit: 100 });
  }, [refetch]);

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDistrict, setFormDistrict] = useState('Klojen');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('10:00 – 22:00');
  const [formCategory, setFormCategory] = useState<Category>('street-food');
  const [formPriceRange, setFormPriceRange] = useState<PriceRange>('mid');
  const [formPriceMin, setFormPriceMin] = useState(15000);
  const [formPriceMax, setFormPriceMax] = useState(50000);
  const [formAmbiance, setFormAmbiance] = useState<Ambiance[]>(['indoor']);
  const [formImage, setFormImage] = useState(MOCK_IMAGE_PRESETS[0]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ✅ useMemo dipindah ke sini — sebelum early return
  const stats = useMemo(() => {
    const total = restaurants.length;
    const totalReviews = restaurants.reduce((acc, r) => acc + (r.reviewCount ?? 0), 0);
    const sumRatings = restaurants.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    const avgRating = total > 0 ? sumRatings / total : 0;
    const uniqueCats = new Set(restaurants.map((r) => r.category?.slug || r.category)).size;
    return { total, totalReviews, avgRating, uniqueCats };
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (r.name ?? '').toLowerCase().includes(q) ||
        (r.district ?? '').toLowerCase().includes(q) ||
        (r.category?.name ?? r.category ?? '').toLowerCase().includes(q);
    });
  }, [restaurants, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // ✅ Authorization Check setelah semua hooks
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

  const handleOpenCreate = () => {
    setEditingRestaurant(null);
    setFormName('');
    setFormDesc('');
    setFormAddress('');
    setFormDistrict('Klojen');
    setFormPhone('');
    setFormHours('10:00 – 22:00');
    setFormCategory('street-food');
    setFormPriceRange('mid');
    setFormPriceMin(15000);
    setFormPriceMax(50000);
    setFormAmbiance(['indoor']);
    setFormImage(MOCK_IMAGE_PRESETS[Math.floor(Math.random() * MOCK_IMAGE_PRESETS.length)]);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (rest: Restaurant) => {
    setEditingRestaurant(rest);
    setFormName(rest.name);
    setFormDesc(rest.description);
    setFormAddress(rest.address);
    setFormDistrict(rest.district);
    setFormPhone(rest.phone ?? '');
    setFormHours(rest.openHours ?? '10:00 – 22:00');
    setFormCategory(rest.category?.slug || rest.category);
    setFormPriceRange(rest.priceRange);
    setFormPriceMin(rest.priceMin);
    setFormPriceMax(rest.priceMax);
    setFormAmbiance(rest.ambiance ?? ['indoor']);
    setFormImage(rest.thumbnailImage ?? MOCK_IMAGE_PRESETS[0]);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      error('Input Tidak Lengkap', 'Nama restoran dan alamat lengkap wajib diisi.');
      return;
    }

    setSubmitLoading(true);

    try {
      // Fetch or create the category dynamically
      const categoriesResponse = await apiGet<any>('/categories');
      const categoriesArray = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
      let targetCat = categoriesArray.find((c: any) => c.slug === formCategory);
      if (!targetCat) {
        targetCat = await apiPost('/categories', {
          name: CATEGORY_LABEL[formCategory as Category] || formCategory,
          slug: formCategory,
        });
      }

      const payload: any = {
        name: formName.trim(),
        slug: formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formDesc.trim(),
        address: formAddress.trim(),
        district: formDistrict,
        city: 'Malang',
        phone: formPhone.trim() || '(0341) 123456',
        openHours: formHours.trim(),
        priceRange: formPriceRange.toUpperCase(),
        priceMin: Number(formPriceMin),
        priceMax: Number(formPriceMax),
        coverImage: formImage,
        thumbnailImage: formImage,
        mapUrl: '',
        ambiance: formAmbiance,
        categoryId: targetCat.id,
      };

      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant.id, payload);
        success('Berhasil Disimpan', `Data restoran "${formName}" berhasil diperbarui.`);
      } else {
        await addRestaurant(payload);
        success('Berhasil Disimpan', `Restoran "${formName}" berhasil ditambahkan.`);
      }

      setFormModalOpen(false);
    } catch (err: any) {
      error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setActiveRestaurantId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activeRestaurantId) {
      await deleteRestaurant(activeRestaurantId);
      success('Dihapus!', 'Data restoran berhasil dihapus.');
      setDeleteModalOpen(false);
      setActiveRestaurantId(null);
    }
  };

  const handleAmbianceCheckbox = (tag: Ambiance) => {
    setFormAmbiance((prev) =>
      prev.includes(tag) ? prev.filter((a) => a !== tag) : [...prev, tag]
    );
  };

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 20, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Dashboard Admin</h1>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Kelola daftar restoran kuliner, ubah data, dan pantau statistik platform.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            style={{
              padding: '11px 20px', background: 'linear-gradient(135deg, #D65A31, #B84A24)',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 14px rgba(214, 90, 49, 0.3)',
            }}
          >
            <Plus size={16} />
            Tambah Restoran Baru
          </button>
        </div>

        {/* METRICS SECTION */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(214,90,49,0.1)', color: '#D65A31', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={20} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', margin: 0 }}>{stats.total}</p>
              <p style={{ fontSize: 12, color: '#A0AEC0', margin: '2px 0 0' }}>Total Restoran</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(11,47,53,0.1)', color: '#0B2F35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', margin: 0 }}>{stats.totalReviews}</p>
              <p style={{ fontSize: 12, color: '#A0AEC0', margin: '2px 0 0' }}>Total Ulasan</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFDF0', color: '#F6C90E', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FFF1C5' }}>
              <Star size={20} fill="#F6C90E" />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', margin: 0 }}>{stats.avgRating.toFixed(1)} ★</p>
              <p style={{ fontSize: 12, color: '#A0AEC0', margin: '2px 0 0' }}>Rata-rata Rating</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(30,82,96,0.1)', color: '#1E5260', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', margin: 0 }}>{stats.uniqueCats}</p>
              <p style={{ fontSize: 12, color: '#A0AEC0', margin: '2px 0 0' }}>Kategori Aktif</p>
            </div>
          </div>
        </section>

        {/* RESTAURANT TABLE LIST */}
        <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B2F35', margin: 0 }}>Daftar Data Restoran</h3>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
              <input
                type="text"
                placeholder="Cari nama, kecamatan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
                  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
                  background: '#F8F9FA', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#FAFBFB', borderBottom: '1px solid #F1F5F9' }}>
                  <th style={thStyle}>Foto</th>
                  <th style={thStyle}>Nama Restoran</th>
                  <th style={thStyle}>Lokasi</th>
                  <th style={thStyle}>Kategori Utama</th>
                  <th style={thStyle}>Harga</th>
                  <th style={thStyle}>Rating / Review</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0', fontSize: 13 }}>
                      Tidak ada data restoran ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((rest) => (
                    <tr key={rest.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                      <td style={tdStyle}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rest.thumbnailImage}
                          alt={rest.name}
                          style={{ width: 50, height: 42, objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#1A1A2E' }}>{rest.name}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4A5568' }}>
                          <MapPin size={12} color="#718096" />
                          {rest.district}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: 'rgba(11, 47, 53, 0.08)', color: '#0B2F35', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>
                          {rest.category?.name}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#D65A31', fontWeight: 600, fontSize: 12 }}>
                          {PRICE_LABEL[rest.priceRange]}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Star size={13} fill="#F6C90E" stroke="#F6C90E" />
                          <span style={{ fontWeight: 700 }}>{(rest.rating ?? 0).toFixed(1)}</span>
                          <span style={{ color: '#A0AEC0' }}>({rest.reviewCount ?? 0})</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleOpenEdit(rest)}
                            title="Edit Restoran"
                            style={{
                              width: 32, height: 32, borderRadius: 8, background: '#F0FDF4',
                              color: '#15803d', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(rest.id)}
                            title="Hapus Restoran"
                            style={{
                              width: 32, height: 32, borderRadius: 8, background: '#FEF2F2',
                              color: '#b91c1c', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 24px', background: '#fff' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </section>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Konfirmasi Hapus" size="sm">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, marginBottom: 24 }}>
              Apakah Anda yakin ingin menghapus data restoran ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1, padding: '11px', background: '#E53E3E', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  flex: 1, padding: '11px', background: '#F8F9FA', color: '#4A5568',
                  border: '1px solid #E2E8F0', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>

        {/* CREATE / EDIT FORM MODAL */}
        <Modal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title={editingRestaurant ? '✍️ Edit Data Restoran' : '➕ Tambah Restoran Baru'}
          size="lg"
        >
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
              <div>
                <label style={labelStyle}>Nama Restoran *</label>
                <input
                  type="text" required
                  placeholder="Contoh: Bakso President"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Kategori Utama *</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as Category)} style={inputStyle}>
                  <option value="street-food">Street Food</option>
                  <option value="cafe">Cozy Cafe</option>
                  <option value="noodle">Noodle Spots</option>
                  <option value="dessert">Dessert</option>
                  <option value="night-hangout">Night Hangout</option>
                  <option value="indonesian">Indonesian</option>
                  <option value="western">Western</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kecamatan (Malang) *</label>
                <select value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} style={inputStyle}>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nomor Telepon</label>
                <input
                  type="text"
                  placeholder="(0341) 555-555"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Jam Operasional</label>
                <input
                  type="text"
                  placeholder="09:00 – 22:00"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Foto Restoran (Preset Demonstrasi)</label>
                <select value={formImage} onChange={(e) => setFormImage(e.target.value)} style={inputStyle}>
                  <option value={MOCK_IMAGE_PRESETS[0]}>📸 Tampilan 1 (Resto Dalam)</option>
                  <option value={MOCK_IMAGE_PRESETS[1]}>📸 Tampilan 2 (Meja & Lampu)</option>
                  <option value={MOCK_IMAGE_PRESETS[2]}>📸 Tampilan 3 (Makanan Mewah)</option>
                  <option value={MOCK_IMAGE_PRESETS[3]}>📸 Tampilan 4 (Resto Modern)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Alamat Lengkap Restoran *</label>
              <input
                type="text" required
                placeholder="Jl. Raya No. 10, Kecamatan Klojen, Kota Malang"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Deskripsi Restoran</label>
              <textarea
                rows={2}
                placeholder="Tulis ulasan ringkas mengenai suasana restoran, menu andalan..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ background: '#FAFBFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
              <label style={{ ...labelStyle, marginBottom: 10 }}>Kategori Rentang Harga</label>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['budget', 'mid', 'premium'] as const).map((pr) => (
                  <label key={pr} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#4A5568' }}>
                    <input
                      type="radio"
                      name="form-price-range"
                      checked={formPriceRange === pr}
                      onChange={() => setFormPriceRange(pr)}
                      style={{ accentColor: '#D65A31' }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>
                      {pr === 'budget' ? 'Budget (<30k)' : pr === 'mid' ? 'Medium (30k-75k)' : 'Premium (75k+)'}
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-grid">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Estimasi Harga Min (Rp)</label>
                  <input type="number" value={formPriceMin} onChange={(e) => setFormPriceMin(Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Estimasi Harga Max (Rp)</label>
                  <input type="number" value={formPriceMax} onChange={(e) => setFormPriceMax(Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Pilihan Tag Suasana</label>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {(['indoor', 'outdoor', 'rooftop', 'cozy', 'lively'] as const).map((tag) => (
                  <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#4A5568' }}>
                    <input
                      type="checkbox"
                      checked={(formAmbiance ?? []).includes(tag)}
                      onChange={() => handleAmbianceCheckbox(tag)}
                      style={{ accentColor: '#D65A31' }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10, borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  flex: 1, padding: '12px', background: 'linear-gradient(135deg, #D65A31, #B84A24)',
                  color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  cursor: submitLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(214, 90, 49, 0.3)',
                }}
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Data Restoran'
                )}
              </button>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                style={{
                  padding: '12px 20px', background: '#F8F9FA', color: '#4A5568',
                  border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: 12,
  fontWeight: 700,
  color: '#718096',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '2px solid #F1F5F9',
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: 13,
  color: '#4A5568',
  verticalAlign: 'middle',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#4A5568',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  fontSize: 13,
  color: '#1A1A2E',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};