'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight, Upload, X,
  Building2, CreditCard, Banknote, AlertCircle, Loader2, ImagePlus
} from 'lucide-react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { apiPost } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { success, error } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [transferProofUrl, setTransferProofUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Group items by restaurant
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {} as Record<string, { restaurantName: string; items: CartItem[] }>);
  }, [items]);

  // Auth Guard
  useEffect(() => {
    if (role === 'guest') {
      error('Akses Ditolak', 'Silakan login terlebih dahulu.');
      router.push('/sign-in');
    }
  }, [role, router, error]);

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

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (paymentMethod === 'transfer' && !transferProofUrl) {
      error('Bukti Transfer', 'Mohon unggah bukti transfer terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        items,
        totalPrice,
        paymentMethod,
        transferProofUrl,
        status: paymentMethod === 'cash' ? 'pending_payment' : 'pending_validation',
      };

      await apiPost('/orders', payload);
      
      clearCart();
      success('Pesanan Berhasil', 'Pesanan Anda sedang diproses.');
      router.push('/orders');
    } catch (err) {
      error('Gagal', err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (role === 'guest') return null;

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px 100px' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0B2F35', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingCart size={24} color="#D65A31" />
          Keranjang Belanja
        </h1>

        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, background: '#FFF5F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingCart size={40} color="#D65A31" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 10 }}>Keranjang Masih Kosong</h2>
            <p style={{ color: '#718096', marginBottom: 24 }}>Yuk, eksplorasi menu lezat dari restoran terbaik di Malang.</p>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                background: 'linear-gradient(135deg, #D65A31, #B84A24)', color: '#fff',
                textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 14px rgba(214, 90, 49, 0.3)'
              }}
            >
              Mulai Belanja <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }} className="cart-grid">
            
            {/* ── Left Column: Items ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(groupedItems).map(([restoId, group]) => (
                <div key={restoId} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                  <div style={{ padding: '14px 20px', background: '#FAFBFB', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Building2 size={16} color="#718096" />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', margin: 0 }}>{group.restaurantName}</h3>
                  </div>
                  <div style={{ padding: '0 20px' }}>
                    {group.items.map((item, idx) => (
                      <div key={item.menuId} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: idx < group.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        
                        {/* Image */}
                        <div style={{ width: 80, height: 80, borderRadius: 12, background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                          {item.menuImage ? (
                            <img src={item.menuImage} alt={item.menuName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ShoppingCart size={24} color="#CBD5E0" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>{item.menuName}</h4>
                            <button
                              onClick={() => removeItem(item.menuId)}
                              style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 2 }}
                              title="Hapus item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#D65A31', marginBottom: 12 }}>
                            Rp {item.price.toLocaleString('id-ID')}
                          </div>
                          
                          {/* Qty Control */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                              <button
                                onClick={() => updateQty(item.menuId, item.qty - 1)}
                                disabled={item.qty <= 1}
                                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFB', border: 'none', color: item.qty <= 1 ? '#CBD5E0' : '#4A5568', cursor: item.qty <= 1 ? 'not-allowed' : 'pointer' }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.menuId, item.qty + 1)}
                                disabled={item.qty >= 99}
                                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFB', border: 'none', color: item.qty >= 99 ? '#CBD5E0' : '#4A5568', cursor: item.qty >= 99 ? 'not-allowed' : 'pointer' }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginLeft: 'auto' }}>
                              Rp {(item.price * item.qty).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right Column: Summary ── */}
            <div style={{ alignSelf: 'start', position: 'sticky', top: 90 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B2F35', margin: '0 0 20px' }}>Ringkasan Order</h3>
                
                {/* Subtotals per resto */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {Object.entries(groupedItems).map(([restoId, group]) => {
                    const subtotal = group.items.reduce((acc, i) => acc + (i.price * i.qty), 0);
                    return (
                      <div key={restoId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4A5568' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                          {group.restaurantName}
                        </span>
                        <span style={{ fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '2px dashed #E2E8F0', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>Total ({totalItems} item)</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#D65A31' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>

                {/* Payment Method */}
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', margin: '0 0 12px' }}>Metode Pembayaran</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      padding: 12, borderRadius: 12, border: paymentMethod === 'cash' ? '2px solid #D65A31' : '1px solid #E2E8F0',
                      background: paymentMethod === 'cash' ? '#FFF5F0' : '#fff', color: paymentMethod === 'cash' ? '#D65A31' : '#4A5568',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <Banknote size={20} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Cash / Tunai</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    style={{
                      padding: 12, borderRadius: 12, border: paymentMethod === 'transfer' ? '2px solid #3182CE' : '1px solid #E2E8F0',
                      background: paymentMethod === 'transfer' ? '#EBF8FF' : '#fff', color: paymentMethod === 'transfer' ? '#3182CE' : '#4A5568',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <CreditCard size={20} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Transfer Bank</span>
                  </button>
                </div>

                {/* Transfer Proof Section */}
                {paymentMethod === 'transfer' && (
                  <div style={{ background: '#F8FAFB', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <AlertCircle size={16} color="#3182CE" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2B6CB0' }}>Info Rekening Pembayaran</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 800, margin: '0 0 4px', color: '#1A1A2E' }}>BCA 1234567890</p>
                    <p style={{ fontSize: 12, color: '#718096', margin: '0 0 16px' }}>a/n Local Taste Hub</p>

                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Upload Bukti Transfer *</div>
                    <div
                      onDrop={(e) => { e.preventDefault(); handleImage(e.dataTransfer.files?.[0] || null); }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: '2px dashed #CBD5E0', borderRadius: 8, cursor: 'pointer',
                        background: '#fff', minHeight: transferProofUrl ? 120 : 80, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'
                      }}
                    >
                      {transferProofUrl ? (
                        <>
                          <img src={transferProofUrl} alt="Bukti Transfer" style={{ width: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTransferProofUrl(''); }}
                            style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 16 }}>
                          <ImagePlus size={20} color="#A0AEC0" style={{ margin: '0 auto 6px' }} />
                          <p style={{ fontSize: 11, color: '#718096', margin: 0 }}>Klik/seret foto struk ke sini</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handleImage(e.target.files?.[0] || null)} />
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || (paymentMethod === 'transfer' && !transferProofUrl)}
                  style={{
                    width: '100%', padding: 14, borderRadius: 12, border: 'none',
                    background: (isSubmitting || (paymentMethod === 'transfer' && !transferProofUrl)) ? '#CBD5E0' : 'linear-gradient(135deg, #1E5260, #0B2F35)',
                    color: '#fff', fontWeight: 700, fontSize: 15, cursor: (isSubmitting || (paymentMethod === 'transfer' && !transferProofUrl)) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: (isSubmitting || (paymentMethod === 'transfer' && !transferProofUrl)) ? 'none' : '0 4px 14px rgba(11, 47, 53, 0.3)'
                  }}
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                  ) : (
                    <>Buat Pesanan <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .cart-grid { grid-template-columns: 2fr 1fr !important; }
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
