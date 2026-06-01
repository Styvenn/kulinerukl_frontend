'use client';

import React, { use, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Utensils,
    Upload,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ImagePlus,
} from 'lucide-react';
import { apiFormPost } from '@/lib/api'; // sesuaikan path helper API kamu

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>;
}

interface FormData {
    name: string;
    description: string;
    price: string;
    category: 'food' | 'drink' | '';
    isAvailable: boolean;
    stock: string;
    image: File | null;
}

interface FormErrors {
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    image?: string;
    stock?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};

    if (!data.name.trim()) {
        errors.name = 'Nama menu wajib diisi.';
    } else if (data.name.trim().length < 3) {
        errors.name = 'Nama menu minimal 3 karakter.';
    } else if (data.name.trim().length > 100) {
        errors.name = 'Nama menu maksimal 100 karakter.';
    }

    if (!data.description.trim()) {
        errors.description = 'Deskripsi wajib diisi.';
    } else if (data.description.trim().length < 10) {
        errors.description = 'Deskripsi minimal 10 karakter.';
    } else if (data.description.trim().length > 500) {
        errors.description = 'Deskripsi maksimal 500 karakter.';
    }

    if (!data.price.trim()) {
        errors.price = 'Harga wajib diisi.';
    } else {
        const num = Number(data.price.replace(/\D/g, ''));
        if (isNaN(num) || num <= 0) {
            errors.price = 'Harga harus berupa angka lebih dari 0.';
        } else if (num > 10_000_000) {
            errors.price = 'Harga terlalu besar (maks Rp 10.000.000).';
        }
    }

    if (!data.stock || Number(data.stock) <= 0) {
        errors.stock = 'Stok harus berupa angka lebih dari 0.';
    } else if (Number(data.stock) > 9999) {
        errors.stock = 'Stok maksimal 9999.';
    }

    if (!data.category) {
        errors.category = 'Pilih kategori menu.';
    }

    if (data.image) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(data.image.type)) {
            errors.image = 'Format foto harus JPG, PNG, atau WebP.';
        } else if (data.image.size > 5 * 1024 * 1024) {
            errors.image = 'Ukuran foto maksimal 5 MB.';
        }
    }

    return errors;
}

// ─── Field Components ─────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>
            {children}
            {required && <span style={{ color: '#D65A31', marginLeft: 4 }}>*</span>}
        </label>
    );
}

function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <AlertCircle size={12} color="#FC8181" />
            <span style={{ fontSize: 11, color: '#FC8181' }}>{msg}</span>
        </div>
    );
}

const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
};

const inputError: React.CSSProperties = {
    ...inputBase,
    border: '1px solid rgba(252,129,129,0.6)',
    background: 'rgba(252,129,129,0.06)',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TambahMenuPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [form, setForm] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true,
        stock: '50',
        image: null,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [submitError, setSubmitError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const touch = (field: keyof FormData) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
        const next = { ...form, [field]: value };
        setForm(next);
        if (touched[field]) {
            setErrors(validate(next));
        }
    };

    const handleImageChange = (file: File | null) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            set('image', file);
        } else {
            setPreviewUrl(null);
            set('image', null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageChange(file);
    };

    const formatRupiah = (val: string) => {
        const digits = val.replace(/\D/g, '');
        return digits ? Number(digits).toLocaleString('id-ID') : '';
    };

    const handlePriceChange = (raw: string) => {
        const digits = raw.replace(/\D/g, '');
        set('price', digits);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Touch all fields to show errors
        setTouched({ name: true, description: true, price: true, category: true, image: true, stock: true });
        const errs = validate(form);
        setErrors(errs);

        if (Object.keys(errs).length > 0) return;

        setSubmitState('loading');
        setSubmitError('');

        try {
            const fd = new FormData();
            fd.append('name', form.name.trim());
            fd.append('description', form.description.trim());
            fd.append('price', String(Number(form.price)));
            fd.append('stock', String(Number(form.stock)));
            fd.append('culinaryPlaceId', id);
            fd.append('isAvailable', String(form.isAvailable));
            if (form.image) fd.append('image', form.image);

            // Sesuaikan endpoint dengan backend NestJS kamu
            await apiFormPost(`/menus`, fd);


            setSubmitState('success');
            setTimeout(() => router.push(`/restaurant/${id}/menu`), 1800);
        } catch (err) {
            setSubmitState('error');
            setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan menu. Coba lagi.');
        }
    };

    // ─── Success State ───────────────────────────────────────────────────────────

    if (submitState === 'success') {
        return (
            <div style={{ background: 'linear-gradient(180deg, #0B2F35 0%, #1E5260 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(72,187,120,0.15)', border: '2px solid rgba(72,187,120,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 size={36} color="#68D391" />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Menu Berhasil Ditambahkan!</h2>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Mengalihkan ke halaman menu...</p>
                </div>
                <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }`}</style>
            </div>
        );
    }

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <div style={{ background: 'linear-gradient(180deg, #0B2F35 0%, #1E5260 100%)', minHeight: '100vh' }}>

            {/* ── Sticky Header ── */}
            <div style={{ background: 'rgba(11,47,53,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => router.back()}
                        style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Utensils size={14} color="#D65A31" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#D65A31', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin · Tambah Menu</span>
                        </div>
                        <h1 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0 }}>Menu Baru</h1>
                    </div>
                    <Link
                        href={`/restaurant/${id}/menu`}
                        style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, whiteSpace: 'nowrap' }}
                    >
                        Lihat Semua Menu
                    </Link>
                </div>
            </div>

            {/* ── Form ── */}
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>
                <form onSubmit={handleSubmit} noValidate>

                    {/* Card wrapper */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* ── Foto Upload ── */}
                        <div>
                            <FieldLabel>Foto Menu</FieldLabel>
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${errors.image && touched.image ? 'rgba(252,129,129,0.5)' : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: 14,
                                    padding: previewUrl ? 0 : '32px 20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: 'rgba(255,255,255,0.04)',
                                    transition: 'border-color 0.2s',
                                    minHeight: previewUrl ? 200 : 'auto',
                                }}
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="preview" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleImageChange(null); }}
                                            style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus size={32} color="rgba(255,255,255,0.3)" style={{ marginBottom: 10 }} />
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Klik atau seret foto ke sini</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>JPG, PNG, WebP · Maks 5 MB</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => { touch('image'); handleImageChange(e.target.files?.[0] ?? null); }} />
                            <ErrorMsg msg={touched.image ? errors.image : undefined} />
                        </div>

                        {/* ── Nama Menu ── */}
                        <div>
                            <FieldLabel required>Nama Menu</FieldLabel>
                            <input
                                type="text"
                                placeholder="Contoh: Nasi Goreng Spesial"
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                onBlur={() => { touch('name'); setErrors(validate(form)); }}
                                maxLength={100}
                                style={touched.name && errors.name ? inputError : inputBase}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
                                <ErrorMsg msg={touched.name ? errors.name : undefined} />
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{form.name.length}/100</span>
                            </div>
                        </div>

                        {/* ── Deskripsi ── */}
                        <div>
                            <FieldLabel required>Deskripsi</FieldLabel>
                            <textarea
                                placeholder="Jelaskan bahan, cita rasa, atau keistimewaan menu ini..."
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                onBlur={() => { touch('description'); setErrors(validate(form)); }}
                                maxLength={500}
                                rows={4}
                                style={{ ...(touched.description && errors.description ? inputError : inputBase), resize: 'vertical', lineHeight: 1.6 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
                                <ErrorMsg msg={touched.description ? errors.description : undefined} />
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{form.description.length}/500</span>
                            </div>
                        </div>

                        {/* ── Harga ── */}
                        <div>
                            <FieldLabel required>Harga (Rp)</FieldLabel>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>Rp</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={form.price ? formatRupiah(form.price) : ''}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    onBlur={() => { touch('price'); setErrors(validate(form)); }}
                                    style={{ ...(touched.price && errors.price ? inputError : inputBase), paddingLeft: 38 }}
                                />
                            </div>
                            <ErrorMsg msg={touched.price ? errors.price : undefined} />
                        </div>


                        {/* ── Stok ── */}
                        <div>
                            <FieldLabel required>Stok</FieldLabel>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Contoh: 50"
                                value={form.stock}
                                onChange={(e) => set('stock', e.target.value.replace(/\D/g, ''))}
                                onBlur={() => { touch('stock'); setErrors(validate(form)); }}
                                style={touched.stock && errors.stock ? inputError : inputBase}
                            />
                            <ErrorMsg msg={touched.stock ? errors.stock : undefined} />
                        </div>

                        {/* ── Kategori ── */}
                        <div>
                            <FieldLabel required>Kategori Menu</FieldLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {(['food', 'drink'] as const).map((cat) => {
                                    const label = cat === 'food' ? '🍽️ Makanan' : '🥤 Minuman';
                                    const active = form.category === cat;
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => { set('category', cat); touch('category'); }}
                                            style={{
                                                padding: '13px 10px',
                                                borderRadius: 12,
                                                border: active ? '2px solid #D65A31' : '1px solid rgba(255,255,255,0.15)',
                                                background: active ? 'rgba(214,90,49,0.15)' : 'rgba(255,255,255,0.05)',
                                                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                                                fontWeight: active ? 700 : 500,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <ErrorMsg msg={touched.category ? errors.category : undefined} />
                        </div>

                        {/* ── Ketersediaan ── */}
                        <div>
                            <FieldLabel>Ketersediaan</FieldLabel>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {[true, false].map((val) => {
                                    const active = form.isAvailable === val;
                                    return (
                                        <button
                                            key={String(val)}
                                            type="button"
                                            onClick={() => set('isAvailable', val)}
                                            style={{
                                                flex: 1,
                                                padding: '12px 10px',
                                                borderRadius: 12,
                                                border: active
                                                    ? `2px solid ${val ? 'rgba(72,187,120,0.7)' : 'rgba(252,129,129,0.7)'}`
                                                    : '1px solid rgba(255,255,255,0.15)',
                                                background: active
                                                    ? val ? 'rgba(72,187,120,0.12)' : 'rgba(252,129,129,0.1)'
                                                    : 'rgba(255,255,255,0.05)',
                                                color: active
                                                    ? val ? '#68D391' : '#FC8181'
                                                    : 'rgba(255,255,255,0.45)',
                                                fontWeight: active ? 700 : 500,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {val ? '✅ Tersedia' : '❌ Habis / Tidak Tersedia'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Submit Error ── */}
                        {submitState === 'error' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', borderRadius: 10, padding: '12px 16px' }}>
                                <AlertCircle size={16} color="#FC8181" />
                                <span style={{ fontSize: 13, color: '#FC8181' }}>{submitError}</span>
                            </div>
                        )}

                        {/* ── Action Buttons ── */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitState === 'loading'}
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    borderRadius: 12,
                                    background: submitState === 'loading' ? 'rgba(214,90,49,0.5)' : 'linear-gradient(135deg, #D65A31, #E8723F)',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 14,
                                    cursor: submitState === 'loading' ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    boxShadow: '0 4px 20px rgba(214,90,49,0.3)',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {submitState === 'loading' ? (
                                    <>
                                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Simpan Menu
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </form>
            </div>

            <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        input:focus, textarea:focus { border-color: rgba(214,90,49,0.6) !important; background: rgba(214,90,49,0.06) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>
        </div>
    );
}