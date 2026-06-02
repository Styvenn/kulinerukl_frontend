'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPatch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { type Order, STATUS_MAP } from '@/app/orders/page';
import {
  ShieldAlert, ClipboardList, Search, Eye, CheckCircle2,
  XCircle, Filter, Banknote, CreditCard, Loader2
} from 'lucide-react';

type FilterStatus = 'all' | Order['status'];

export default function AdminOrdersPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeProofUrl, setActiveProofUrl] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [activeOrderId, setActiveOrderId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res: any = await apiGet('/orders');
      const data = Array.isArray(res) ? res : (res?.data || []);
      // Sort newest first
      data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
    } catch (err) {
      error('Gagal', 'Tidak dapat memuat data pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'guest') router.push('/sign-in');
    if (role === 'admin') fetchOrders();
  }, [role, router]);

  // Derived state
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.userId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  if (role !== 'admin') {
    return (
      <div style={{ background: '#F8F9FA', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 460, width: '100%', background: '#fff', borderRadius: 24, padding: '48px 36px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E', margin: '0 auto 20px' }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B2F35', marginBottom: 10 }}>Akses Ditolak</h1>
          <p style={{ fontSize: 14, color: '#718096', lineHeight: 1.6, marginBottom: 28 }}>
            Halaman ini hanya dapat diakses oleh Administrator.
          </p>
          <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #0B2F35, #1E5260)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async (id: string, newStatus: Order['status'], note?: string) => {
    setActionLoading(true);
    try {
      await apiPatch(`/orders/${id}`, { status: newStatus, rejectionNote: note });
      success('Berhasil', `Status pesanan diperbarui menjadi ${STATUS_MAP[newStatus].label}.`);
      setRejectModalOpen(false);
      setRejectNote('');
      fetchOrders();
    } catch (err) {
      error('Gagal', err instanceof Error ? err.message : 'Gagal memperbarui status.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id: string) => {
    setActiveOrderId(id);
    setRejectNote('');
    setRejectModalOpen(true);
  };

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 20, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B2F35', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ClipboardList size={28} color="#D65A31" /> Kelola Pesanan
            </h1>
            <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Pantau dan validasi pesanan dari pelanggan.</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 280, flexGrow: 1, maxWidth: 400 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            <input
              type="text"
              placeholder="Cari ID Pesanan atau User ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', background: '#F8F9FA', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            <Filter size={16} color="#718096" />
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: statusFilter === 'all' ? 'none' : '1px solid #E2E8F0', background: statusFilter === 'all' ? '#0B2F35' : '#fff', color: statusFilter === 'all' ? '#fff' : '#4A5568' }}
            >
              Semua
            </button>
            <button
              onClick={() => { setStatusFilter('pending_validation'); setCurrentPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: statusFilter === 'pending_validation' ? 'none' : '1px solid #E2E8F0', background: statusFilter === 'pending_validation' ? '#D69E2E' : '#fff', color: statusFilter === 'pending_validation' ? '#fff' : '#4A5568', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {orders.filter(o => o.status === 'pending_validation').length > 0 && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusFilter === 'pending_validation' ? '#fff' : '#D69E2E' }} />
              )}
              Perlu Validasi
            </button>
            <button
              onClick={() => { setStatusFilter('confirmed'); setCurrentPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: statusFilter === 'confirmed' ? 'none' : '1px solid #E2E8F0', background: statusFilter === 'confirmed' ? '#38A169' : '#fff', color: statusFilter === 'confirmed' ? '#fff' : '#4A5568' }}
            >
              Dikonfirmasi
            </button>
            <button
              onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
              style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: statusFilter === 'completed' ? 'none' : '1px solid #E2E8F0', background: statusFilter === 'completed' ? '#3182CE' : '#fff', color: statusFilter === 'completed' ? '#fff' : '#4A5568' }}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#A0AEC0' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              Memuat data pesanan...
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 1000 }}>
                  <thead>
                    <tr style={{ background: '#FAFBFB', borderBottom: '1px solid #F1F5F9' }}>
                      <th style={thStyle}>ID Pesanan</th>
                      <th style={thStyle}>Tgl & Waktu</th>
                      <th style={thStyle}>Metode</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}>Bukti Transfer</th>
                      <th style={thStyle}>Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0', fontSize: 13 }}>
                          Tidak ada pesanan ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o) => {
                        const status = STATUS_MAP[o.status];
                        return (
                          <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                            <td style={{ ...tdStyle, fontWeight: 700, color: '#1A1A2E' }}>
                              #{o.id.slice(-8).toUpperCase()}
                            </td>
                            <td style={tdStyle}>
                              <div style={{ fontSize: 13, color: '#4A5568' }}>
                                {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div style={{ fontSize: 11, color: '#A0AEC0' }}>
                                {new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                {o.paymentMethod === 'cash' ? <Banknote size={14} color="#D65A31" /> : <CreditCard size={14} color="#3182CE" />}
                                {o.paymentMethod === 'cash' ? 'Cash' : 'Transfer'}
                              </div>
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: '#D65A31' }}>
                              Rp {o.totalPrice.toLocaleString('id-ID')}
                            </td>
                            <td style={tdStyle}>
                              {o.transferProofUrl ? (
                                <button
                                  onClick={() => { setActiveProofUrl(o.transferProofUrl!); setProofModalOpen(true); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF8FF', color: '#3182CE', border: '1px solid #BEE3F8', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                                >
                                  <Eye size={12} /> Lihat Bukti
                                </button>
                              ) : (
                                <span style={{ color: '#A0AEC0', fontSize: 12 }}>-</span>
                              )}
                            </td>
                            <td style={tdStyle}>
                              <span style={{ background: status.bg, color: status.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {status.label}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                {o.status === 'pending_validation' && (
                                  <>
                                    <button onClick={() => handleUpdateStatus(o.id, 'confirmed')} disabled={actionLoading} title="Konfirmasi" style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', color: '#15803d', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <CheckCircle2 size={16} />
                                    </button>
                                    <button onClick={() => openRejectModal(o.id)} disabled={actionLoading} title="Tolak" style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF2F2', color: '#b91c1c', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                {o.status === 'confirmed' && (
                                  <button onClick={() => handleUpdateStatus(o.id, 'completed')} disabled={actionLoading} style={{ padding: '6px 12px', borderRadius: 8, background: '#EBF8FF', color: '#2B6CB0', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                                    Selesaikan
                                  </button>
                                )}
                                {(o.status === 'completed' || o.status === 'rejected' || o.status === 'pending_payment') && (
                                  <span style={{ fontSize: 11, color: '#A0AEC0' }}>-</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 24px' }}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Proof Modal */}
      <Modal isOpen={proofModalOpen} onClose={() => setProofModalOpen(false)} title="Bukti Transfer" size="md">
        <div style={{ textAlign: 'center' }}>
          {activeProofUrl ? (
            <img src={activeProofUrl} alt="Bukti Transfer Full" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <p>Bukti tidak tersedia</p>
          )}
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Tolak Pesanan" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#4A5568', margin: 0 }}>Silakan masukkan alasan penolakan pesanan ini:</p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Contoh: Bukti transfer tidak valid/buram."
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={() => setRejectModalOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#F1F5F9', color: '#4A5568', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
            <button onClick={() => handleUpdateStatus(activeOrderId, 'rejected', rejectNote)} disabled={!rejectNote.trim() || actionLoading} style={{ flex: 1, padding: '10px', borderRadius: 8, background: !rejectNote.trim() || actionLoading ? '#FC8181' : '#E53E3E', color: '#fff', border: 'none', fontWeight: 700, cursor: !rejectNote.trim() || actionLoading ? 'not-allowed' : 'pointer' }}>
              Tolak Pesanan
            </button>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #F1F5F9',
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px', fontSize: 13, color: '#4A5568', verticalAlign: 'middle',
};
