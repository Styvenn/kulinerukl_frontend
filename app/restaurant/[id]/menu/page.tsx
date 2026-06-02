'use client';

import React, { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Utensils, Search, Loader2, UtensilsCrossed, Plus,
  Pencil, Trash2, X, CheckCircle2, AlertCircle, Upload, ImagePlus,
  Package, ChefHat, ShoppingCart
} from 'lucide-react';
import { type MenuItem } from '@/lib/data';
import { apiGet, apiDelete, apiFormPost, apiFormPatch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';
import Modal from '@/components/ui/Modal';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RestaurantBasic {
  id: string;
  name: string;
  coverImage?: string;
}

// ─── Form State ───────────────────────────────────────────────────────────────
interface MenuForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: 'food' | 'drink' | '';
  isAvailable: boolean;
  image: File | null;
}

interface MenuFormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  image?: string;
}

const EMPTY_FORM: MenuForm = {
  name: '',
  description: '',
  price: '',
  stock: '50',
  category: '',
  isAvailable: true,
  image: null,
};

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(data: MenuForm): MenuFormErrors {
  const errors: MenuFormErrors = {};
  if (!data.name.trim()) errors.name = 'Nama menu wajib diisi.';
  else if (data.name.trim().length < 3) errors.name = 'Minimal 3 karakter.';
  else if (data.name.trim().length > 100) errors.name = 'Maksimal 100 karakter.';

  if (!data.description.trim()) errors.description = 'Deskripsi wajib diisi.';
  else if (data.description.trim().length < 5) errors.description = 'Minimal 5 karakter.';
  else if (data.description.trim().length > 500) errors.description = 'Maksimal 500 karakter.';

  if (!data.price.trim()) errors.price = 'Harga wajib diisi.';
  else {
    const num = Number(data.price.replace(/\D/g, ''));
    if (isNaN(num) || num <= 0) errors.price = 'Harga harus lebih dari 0.';
    else if (num > 10_000_000) errors.price = 'Harga terlalu besar (maks Rp 10.000.000).';
  }

  if (!data.stock || Number(data.stock) <= 0) errors.stock = 'Stok harus lebih dari 0.';
  else if (Number(data.stock) > 9999) errors.stock = 'Stok maksimal 9999.';

  if (!data.category) errors.category = 'Pilih kategori menu.';

  if (data.image) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(data.image.type)) errors.image = 'Format foto harus JPG, PNG, atau WebP.';
    else if (data.image.size > 5 * 1024 * 1024) errors.image = 'Ukuran foto maksimal 5 MB.';
  }
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>
      {children}{required && <span style={{ color: '#E53E3E', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
      <AlertCircle size={11} color="#E53E3E" />
      <span style={{ fontSize: 11, color: '#E53E3E' }}>{msg}</span>
    </div>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  background: '#F8FAFB', border: '1.5px solid #E2E8F0', color: '#1A1A2E',
  fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const inputErr: React.CSSProperties = { ...inputBase, border: '1.5px solid #E53E3E', background: '#FFF5F5' };

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
      <div style={{ height: 160, background: 'linear-gradient(90deg,#E2E8F0 25%,#CBD5E0 50%,#E2E8F0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 16, width: '60%', background: '#E2E8F0', borderRadius: 6 }} />
        <div style={{ height: 12, width: '80%', background: '#EDF2F7', borderRadius: 6 }} />
        <div style={{ height: 20, width: '35%', background: '#E2E8F0', borderRadius: 6 }} />
      </div>
    </div>
  );
}

// ─── Menu Form Modal ──────────────────────────────────────────────────────────
interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  restaurantId: string;
  onSuccess: () => void;
}

function MenuFormModal({ isOpen, onClose, editingItem, restaurantId, onSuccess }: MenuFormModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [form, setForm] = useState<MenuForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<MenuFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof MenuForm, boolean>>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Prefill form when editing
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setForm({
          name: editingItem.name ?? '',
          description: editingItem.description ?? '',
          price: String(editingItem.price ?? ''),
          stock: String(editingItem.stock ?? 50),
          category: (editingItem.category as 'food' | 'drink') ?? '',
          isAvailable: editingItem.isAvailable !== false,
          image: null,
        });
        setPreviewUrl(editingItem.imageUrl ?? null);
      } else {
        setForm(EMPTY_FORM);
        setPreviewUrl(null);
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, editingItem]);

  const touch = (field: keyof MenuForm) => setTouched((p) => ({ ...p, [field]: true }));

  const set = (field: keyof MenuForm, value: MenuForm[keyof MenuForm]) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleImage = (file: File | null) => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      set('image', file);
    } else {
      setPreviewUrl(editingItem?.imageUrl ?? null);
      set('image', null);
    }
  };

  const formatRupiah = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits ? Number(digits).toLocaleString('id-ID') : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched as Partial<Record<keyof MenuForm, boolean>>);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('price', String(Number(form.price.replace(/\D/g, ''))));
      fd.append('stock', String(Number(form.stock)));
      fd.append('culinaryPlaceId', restaurantId);
      if (form.image) fd.append('image', form.image);

      if (editingItem) {
        await apiFormPatch(`/menus/${editingItem.id}`, fd);
        toastSuccess('Berhasil!', 'Menu berhasil diperbarui.');
      } else {
        await apiFormPost('/menus', fd);
        toastSuccess('Berhasil!', 'Menu baru berhasil ditambahkan.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toastError('Gagal', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
      size="md"
      id="menu-form-modal"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Foto */}
          <div>
            <FieldLabel>Foto Menu</FieldLabel>
            <div
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { touch('image'); handleImage(f); } }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${touched.image && errors.image ? '#E53E3E' : '#CBD5E0'}`,
                borderRadius: 10, cursor: 'pointer', overflow: 'hidden', position: 'relative',
                background: '#F8FAFB', minHeight: previewUrl ? 180 : 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleImage(null); touch('image'); }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <ImagePlus size={28} color="#A0AEC0" style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: 12, color: '#A0AEC0', margin: '0 0 2px' }}>Klik atau seret foto ke sini</p>
                  <p style={{ fontSize: 10, color: '#CBD5E0', margin: 0 }}>JPG, PNG, WebP · Maks 5 MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={(e) => { touch('image'); handleImage(e.target.files?.[0] ?? null); }} />
            <ErrorMsg msg={touched.image ? errors.image : undefined} />
          </div>

          {/* Nama */}
          <div>
            <FieldLabel required>Nama Menu</FieldLabel>
            <input
              type="text" placeholder="Contoh: Nasi Goreng Spesial"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              onBlur={() => { touch('name'); setErrors(validate(form)); }}
              maxLength={100}
              style={touched.name && errors.name ? inputErr : inputBase}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <ErrorMsg msg={touched.name ? errors.name : undefined} />
              <span style={{ fontSize: 10, color: '#A0AEC0', marginLeft: 'auto' }}>{form.name.length}/100</span>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <FieldLabel required>Deskripsi</FieldLabel>
            <textarea
              placeholder="Jelaskan bahan, cita rasa, atau keistimewaan menu ini..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              onBlur={() => { touch('description'); setErrors(validate(form)); }}
              maxLength={500} rows={3}
              style={{ ...(touched.description && errors.description ? inputErr : inputBase), resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <ErrorMsg msg={touched.description ? errors.description : undefined} />
              <span style={{ fontSize: 10, color: '#A0AEC0', marginLeft: 'auto' }}>{form.description.length}/500</span>
            </div>
          </div>

          {/* Harga & Stok */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel required>Harga (Rp)</FieldLabel>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#A0AEC0', pointerEvents: 'none' }}>Rp</span>
                <input
                  type="text" inputMode="numeric" placeholder="0"
                  value={form.price ? formatRupiah(form.price) : ''}
                  onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => { touch('price'); setErrors(validate(form)); }}
                  style={{ ...(touched.price && errors.price ? inputErr : inputBase), paddingLeft: 32 }}
                />
              </div>
              <ErrorMsg msg={touched.price ? errors.price : undefined} />
            </div>
            <div>
              <FieldLabel required>Stok</FieldLabel>
              <input
                type="text" inputMode="numeric" placeholder="50"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value.replace(/\D/g, ''))}
                onBlur={() => { touch('stock'); setErrors(validate(form)); }}
                style={touched.stock && errors.stock ? inputErr : inputBase}
              />
              <ErrorMsg msg={touched.stock ? errors.stock : undefined} />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <FieldLabel required>Kategori</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['food', 'drink'] as const).map((cat) => {
                const active = form.category === cat;
                return (
                  <button key={cat} type="button"
                    onClick={() => { set('category', cat); touch('category'); }}
                    style={{
                      padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                      border: active ? '2px solid #D65A31' : '1.5px solid #E2E8F0',
                      background: active ? 'rgba(214,90,49,0.08)' : '#F8FAFB',
                      color: active ? '#D65A31' : '#718096', fontWeight: active ? 700 : 500,
                    }}
                  >
                    {cat === 'food' ? '🍽️ Makanan' : '🥤 Minuman'}
                  </button>
                );
              })}
            </div>
            <ErrorMsg msg={touched.category ? errors.category : undefined} />
          </div>

          {/* Ketersediaan */}
          <div>
            <FieldLabel>Ketersediaan</FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {[true, false].map((val) => {
                const active = form.isAvailable === val;
                return (
                  <button key={String(val)} type="button"
                    onClick={() => set('isAvailable', val)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                      border: active ? `2px solid ${val ? '#38A169' : '#E53E3E'}` : '1.5px solid #E2E8F0',
                      background: active ? (val ? 'rgba(56,161,105,0.08)' : 'rgba(229,62,62,0.07)') : '#F8FAFB',
                      color: active ? (val ? '#38A169' : '#E53E3E') : '#718096', fontWeight: active ? 700 : 500,
                    }}
                  >
                    {val ? '✅ Tersedia' : '❌ Tidak Tersedia'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#F1F5F9', border: 'none', color: '#4A5568', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Batal
            </button>
            <button type="submit" disabled={submitting}
              style={{
                flex: 2, padding: '11px', borderRadius: 10, border: 'none',
                background: submitting ? '#A0AEC0' : 'linear-gradient(135deg,#D65A31,#E8723F)',
                color: '#fff', fontWeight: 800, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: submitting ? 'none' : '0 4px 16px rgba(214,90,49,0.3)',
              }}>
              {submitting ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />Menyimpan...</> : <><Upload size={14} />{editingItem ? 'Perbarui Menu' : 'Simpan Menu'}</>}
            </button>
          </div>
        </div>
      </form>
      <style>{`
        input::placeholder, textarea::placeholder { color: #CBD5E0; }
        input:focus, textarea:focus { border-color: #D65A31 !important; outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onConfirm: () => Promise<void>;
}

function DeleteModal({ isOpen, onClose, item, onConfirm }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    finally { setDeleting(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" id="delete-menu-modal">
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(229,62,62,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={24} color="#E53E3E" />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>Hapus Menu?</h3>
        <p style={{ fontSize: 13, color: '#718096', margin: '0 0 24px', lineHeight: 1.6 }}>
          Menu <strong style={{ color: '#1A1A2E' }}>&ldquo;{item?.name}&rdquo;</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#F1F5F9', border: 'none', color: '#4A5568', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Batal
          </button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: deleting ? '#FCA5A5' : '#E53E3E', color: '#fff', fontWeight: 800, fontSize: 13, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {deleting ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />Menghapus...</> : <><Trash2 size={13} />Hapus</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { items: cartItems, addItem } = useCart();
  const isAdmin = role === 'admin';

  const [restaurant, setRestaurant] = useState<RestaurantBasic | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [restData, menuData] = await Promise.all([
        apiGet<RestaurantBasic>(`/culinary/${id}`),
        apiGet<{ data: MenuItem[] } | MenuItem[]>(`/culinary/${id}/menus`),
      ]);
      setRestaurant(restData);
      // Handle both paginated {data:[]} and plain array responses
      const raw = Array.isArray(menuData) ? menuData : (menuData as { data: MenuItem[] }).data ?? [];
      setMenus(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Gagal memuat data menu.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => { setEditingItem(null); setFormOpen(true); };
  const handleOpenEdit = (item: MenuItem) => { setEditingItem(item); setFormOpen(true); };
  const handleOpenDelete = (item: MenuItem) => { setDeletingItem(item); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await apiDelete(`/menus/${deletingItem.id}`);
      toastSuccess('Dihapus!', `Menu "${deletingItem.name}" berhasil dihapus.`);
      fetchData();
    } catch (err) {
      toastError('Gagal', err instanceof Error ? err.message : 'Gagal menghapus menu.');
      throw err; // re-throw so DeleteModal keeps deleting=false on fail
    }
  };

  const filtered = menus.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: 'linear-gradient(180deg, #0B2F35 0%, #1E5260 100%)', minHeight: '100vh' }}>

      {/* ── Sticky Header ── */}
      <div style={{ background: 'rgba(11,47,53,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Utensils size={14} color="#D65A31" />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#D65A31', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Katalog Menu
              </span>
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {loading ? 'Memuat...' : (restaurant?.name ?? 'Menu Restoran')}
            </h1>
          </div>
          {/* Add button — admin only */}
          {isAdmin && (
            <button
              id="btn-tambah-menu"
              onClick={handleOpenAdd}
              style={{ fontSize: 12, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'linear-gradient(135deg,#D65A31,#E8723F)', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 14px rgba(214,90,49,0.4)' }}
            >
              <Plus size={14} /> Tambah Menu
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 100px' }}>

        {/* Search + Count */}
        {!loading && !fetchError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari nama atau deskripsi menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
              {filtered.length} dari {menus.length} menu
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
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

        {/* Empty */}
        {!loading && !fetchError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <ChefHat size={52} color="rgba(255,255,255,0.18)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: '#fff', marginBottom: 8, fontSize: 20, fontWeight: 800 }}>
              {searchQuery ? 'Menu tidak ditemukan' : 'Belum Ada Menu'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 28 }}>
              {searchQuery
                ? `Tidak ada menu yang cocok dengan "${searchQuery}".`
                : 'Menu untuk restoran ini belum tersedia.'}
            </p>
            {!searchQuery && isAdmin && (
              <button
                onClick={handleOpenAdd}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'linear-gradient(135deg,#D65A31,#E8723F)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 16px rgba(214,90,49,0.35)' }}
              >
                <Plus size={14} /> Tambah Menu Pertama
              </button>
            )}
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)',
                  borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, background 0.2s',
                  animation: `fadeInUp 0.4s ease ${idx * 0.05}s both`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.11)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
              >
                {/* Image */}
                {item.imageUrl ? (
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
                    {/* Availability badge */}
                    {item.isAvailable === false && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(229,62,62,0.9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                        Habis
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 100, background: 'rgba(214,90,49,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Utensils size={32} color="rgba(214,90,49,0.5)" />
                  </div>
                )}

                {/* Body */}
                <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>{item.name}</h3>
                    {item.category && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'capitalize' }}>
                        {item.category === 'food' ? '🍽️' : '🥤'} {item.category}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6, flex: 1 }}>
                    {item.description ?? '-'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#D65A31' }}>
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </span>
                    {item.stock !== undefined && (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Package size={11} /> Stok: {item.stock}
                      </span>
                    )}
                  </div>

                  {!isAdmin && (
                    <button
                      onClick={() => {
                        addItem({
                          menuId: item.id,
                          menuName: item.name,
                          menuImage: item.imageUrl,
                          price: Number(item.price),
                          restaurantId: restaurant?.id || id,
                          restaurantName: restaurant?.name || 'Restoran',
                        });
                        toastSuccess('Ditambahkan', `${item.name} ditambahkan ke keranjang.`);
                      }}
                      style={{
                        marginTop: 8, padding: '8px', borderRadius: 8, background: 'rgba(214,90,49,0.15)',
                        border: '1px solid rgba(214,90,49,0.3)', color: '#D65A31', fontSize: 13,
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 6, transition: 'background 0.2s, transform 0.1s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(214,90,49,0.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(214,90,49,0.15)')}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                      <ShoppingCart size={14} /> Tambah ke Keranjang
                      {cartItems.find((i) => i.menuId === item.id) && (
                        <span style={{
                          position: 'absolute', top: -6, right: -6, background: '#E53E3E',
                          color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px',
                          borderRadius: 12, border: '2px solid #1E5260',
                        }}>
                          {cartItems.find((i) => i.menuId === item.id)?.qty}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Admin Action Buttons */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button
                        id={`btn-edit-menu-${item.id}`}
                        onClick={() => handleOpenEdit(item)}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        id={`btn-delete-menu-${item.id}`}
                        onClick={() => handleOpenDelete(item)}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(229,62,62,0.12)', border: '1px solid rgba(229,62,62,0.25)', color: '#FC8181', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(229,62,62,0.22)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(229,62,62,0.12)')}
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <MenuFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        editingItem={editingItem}
        restaurantId={id}
        onSuccess={fetchData}
      />
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        item={deletingItem}
        onConfirm={handleDelete}
      />

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}
