'use client';

import React, { use, useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPatch } from '@/lib/api';
import { type Order, STATUS_MAP } from '../page';
import { type CartItem } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { generateReceiptPDF } from '@/lib/generateReceiptPDF';
import {
  ArrowLeft, ClipboardList, CheckCircle2, AlertCircle, XCircle, Printer,
  Building2, Package, Banknote, CreditCard, Upload, Loader2, ImagePlus, X
} from 'lucide-react';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { role, user } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for re-upload
  const [transferProofUrl, setTransferProofUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (role === 'guest') router.push('/sign-in');
  }, [role, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res: any = await apiGet(`/orders/${id}`);
      const data = res.data || res;
      if (data.userId !== user?.id) {
        throw new Error('Order tidak ditemukan atau Anda tidak memiliki akses.');
      }
      setOrder(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'user' && user?.id) {
      fetchOrder();
    }
  }, [role, user, id]);

  const groupedItems = useMemo(() => {
    if (!order) return {};
    return order.items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {} as Record<string, { restaurantName: string; items: CartItem[] }>);
  }, [order]);

  const handleImage = (file: File | null) => {
    if (!file) {
      setTransferProofUrl('');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Terlalu besar', 'Ukuran foto maksimal 5 MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      error('Format tidak didukung', 'Gunakan JPG, PNG, atau WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setTransferProofUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReupload = async () => {
    if (!transferProofUrl) return;
    setIsUploading(true);
    try {
      await apiPatch(`/orders/${id}`, {
        transferProofUrl,
        status: 'pending_validation'
      });
      success('Berhasil', 'Bukti transfer berhasil diunggah ulang.');
      setTransferProofUrl('');
      fetchOrder();
    } catch (err) {
      error('Gagal', err instanceof Error ? err.message : 'Gagal mengunggah bukti transfer.');
    } finally {
      setIsUploading(false);
    }
  };

  if (role !== 'user') return null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', color: '#A0AEC0' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Memuat detail pesanan...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div style={{ minHeight: '100vh', padding: '60px 20px', background: '#F8F9FA', textAlign: 'center' }}>
        <AlertCircle size={48} color="#E53E3E" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A2E', marginBottom: 12 }}>Pesanan Tidak Ditemukan</h2>
        <p style={{ color: '#718096', marginBottom: 24 }}>{errorMsg}</p>
        <Link href="/orders" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #1E5260, #0B2F35)', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 700 }}>
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[order.status];

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px 100px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => router.push('/orders')} style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4A5568', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0B2F35', margin: '0 0 4px' }}>Detail Pesanan</h1>
            <p style={{ color: '#718096', margin: 0, fontSize: 13 }}>#{order.id.toUpperCase()}</p>
          </div>
          
          {/* Print Button */}
          {order.status === 'completed' && (
            <button
              onClick={() => generateReceiptPDF(order)}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #D65A31, #B84A24)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(214, 90, 49, 0.3)' }}
            >
              <Printer size={16} /> Cetak Struk PDF
            </button>
          )}
        </div>

        {/* Status Banner */}
        {order.status === 'rejected' && order.rejectionNote && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12 }}>
            <XCircle size={20} color="#E53E3E" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#C53030', margin: '0 0 4px' }}>Pesanan Ditolak</h3>
              <p style={{ fontSize: 13, color: '#E53E3E', margin: 0 }}>Alasan: {order.rejectionNote}</p>
            </div>
          </div>
        )}
        
        {/* Upload Ulang Bukti (jika transfer & pending_payment) */}
        {order.paymentMethod === 'transfer' && order.status === 'pending_payment' && (
          <div style={{ background: '#EBF8FF', border: '1px solid #90CDF4', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#2B6CB0', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} /> Menunggu Bukti Transfer
            </h3>
            <p style={{ fontSize: 13, color: '#2C5282', marginBottom: 16 }}>
              Anda memilih metode Transfer Bank namun belum melampirkan bukti transfer. Silakan transfer ke rekening <strong>BCA 1234567890 a/n Local Taste Hub</strong> dan unggah buktinya di bawah.
            </p>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div
                onDrop={(e) => { e.preventDefault(); handleImage(e.dataTransfer.files?.[0] || null); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 140, height: transferProofUrl ? 180 : 100, border: '2px dashed #90CDF4', borderRadius: 12, cursor: 'pointer',
                  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                }}
              >
                {transferProofUrl ? (
                  <>
                    <img src={transferProofUrl} alt="Bukti Transfer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setTransferProofUrl(''); }}
                      style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <ImagePlus size={20} color="#63B3ED" style={{ margin: '0 auto 6px' }} />
                    <span style={{ fontSize: 11, color: '#4299E1', fontWeight: 600 }}>Pilih Foto</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleImage(e.target.files?.[0] || null)} />
              
              <button
                onClick={handleReupload}
                disabled={!transferProofUrl || isUploading}
                style={{
                  padding: '12px 20px', borderRadius: 10, border: 'none', background: !transferProofUrl || isUploading ? '#CBD5E0' : '#3182CE',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: !transferProofUrl || isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                {isUploading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Mengunggah...</> : <><Upload size={16} /> Unggah Bukti</>}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, '@media (minWidth: 768px)': { gridTemplateColumns: '2fr 1fr' } } as React.CSSProperties}>
          
          {/* Kolom Kiri: Daftar Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E', margin: 0, paddingBottom: 10, borderBottom: '2px solid #E2E8F0' }}>Daftar Item</h2>
            {Object.entries(groupedItems).map(([restoId, group]) => (
              <div key={restoId} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                <div style={{ padding: '12px 20px', background: '#FAFBFB', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building2 size={16} color="#718096" />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{group.restaurantName}</h3>
                </div>
                <div style={{ padding: '0 20px' }}>
                  {group.items.map((item, idx) => (
                    <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx < group.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#F1F5F9', overflow: 'hidden' }}>
                          {item.menuImage && <img src={item.menuImage} alt={item.menuName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>{item.menuName}</h4>
                          <p style={{ fontSize: 12, color: '#718096', margin: 0 }}>{item.qty}x @ Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Kolom Kanan: Ringkasan */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E', margin: '0 0 20px' }}>Informasi Pemesanan</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#A0AEC0', margin: '0 0 4px' }}>Status Pesanan</p>
                  <span style={{ display: 'inline-block', background: status.bg, color: status.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {status.label}
                  </span>
                </div>
                
                <div>
                  <p style={{ fontSize: 12, color: '#A0AEC0', margin: '0 0 4px' }}>Tanggal Waktu</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', margin: 0 }}>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 12, color: '#A0AEC0', margin: '0 0 4px' }}>Metode Pembayaran</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>
                    {order.paymentMethod === 'cash' ? <Banknote size={16} color="#D65A31" /> : <CreditCard size={16} color="#3182CE" />}
                    {order.paymentMethod === 'cash' ? 'Cash / Tunai' : 'Transfer Bank'}
                  </div>
                </div>

                <div style={{ borderTop: '2px dashed #E2E8F0', margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#718096' }}>Total Belanja</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#D65A31' }}>Rp {order.totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
