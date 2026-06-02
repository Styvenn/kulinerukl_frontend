'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import {
  ClipboardList, Package, ChevronRight, AlertCircle, Loader2, Calendar, FileText
} from 'lucide-react';
import type { CartItem } from '@/context/CartContext';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  paymentMethod: 'cash' | 'transfer';
  transferProofUrl?: string;
  status: 'pending_payment' | 'pending_validation' | 'confirmed' | 'rejected' | 'completed';
  createdAt: string;
  rejectionNote?: string;
}

export const STATUS_MAP: Record<Order['status'], { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Menunggu Pembayaran', color: '#718096', bg: '#EDF2F7' },
  pending_validation: { label: 'Menunggu Validasi', color: '#D69E2E', bg: '#FEFCBF' },
  confirmed: { label: 'Dikonfirmasi', color: '#38A169', bg: '#C6F6D5' },
  rejected: { label: 'Ditolak', color: '#E53E3E', bg: '#FED7D7' },
  completed: { label: 'Selesai', color: '#0B2F35', bg: 'rgba(11, 47, 53, 0.15)' },
};

export default function OrdersPage() {
  const { role, user } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'guest') {
      router.push('/sign-in');
    } else if (role === 'admin') {
      router.push('/admin'); // Or show access denied
    }
  }, [role, router]);

  useEffect(() => {
    if (role === 'user' && user?.id) {
      const fetchOrders = async () => {
        try {
          const res: any = await apiGet('/orders');
          const data = Array.isArray(res) ? res : (res?.data || []);
          // Filter by user ID if backend doesn't do it automatically
          const userOrders = data.filter((o: Order) => o.userId === user.id);
          // Sort by newest first
          userOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(userOrders);
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat pesanan');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [role, user]);

  if (role !== 'user') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <p style={{ color: '#718096' }}>Memverifikasi akses...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '40px 20px 100px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0B2F35', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardList size={24} color="#D65A31" />
          Riwayat Pesanan
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#A0AEC0' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <p>Memuat pesanan...</p>
          </div>
        ) : errorMsg ? (
          <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertCircle size={20} color="#E53E3E" style={{ marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#C53030', margin: '0 0 4px' }}>Gagal Memuat Data</h3>
              <p style={{ fontSize: 14, color: '#E53E3E', margin: 0 }}>{errorMsg}</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 80, height: 80, background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={36} color="#A0AEC0" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A2E', marginBottom: 10 }}>Belum Ada Pesanan</h2>
            <p style={{ color: '#718096', marginBottom: 24 }}>Anda belum pernah melakukan pemesanan.</p>
            <Link
              href="/"
              style={{
                display: 'inline-flex', padding: '12px 24px', background: 'linear-gradient(135deg, #1E5260, #0B2F35)',
                color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
              }}
            >
              Mulai Eksplorasi
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => {
              const status = STATUS_MAP[order.status];
              const totalItems = order.items.reduce((acc, i) => acc + i.qty, 0);
              
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => router.push(`/orders/${order.id}`)}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A1A2E', margin: 0 }}>Order #{order.id.slice(-8).toUpperCase()}</h3>
                        <span style={{ background: status.bg, color: status.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#718096' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: '#718096', margin: '0 0 4px' }}>Total Belanja</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#D65A31', margin: 0 }}>Rp {order.totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #E2E8F0' }} />

                  {/* Summary Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#4A5568' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Package size={14} color="#A0AEC0" /> {totalItems} Item Menu
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
                        <FileText size={14} color="#A0AEC0" /> Pembayaran: {order.paymentMethod}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3182CE', fontSize: 13, fontWeight: 600 }}>
                      Lihat Detail <ChevronRight size={16} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
