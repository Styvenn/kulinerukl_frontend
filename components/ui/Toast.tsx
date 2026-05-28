'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config per type ──────────────────────────────────────────────────────────
const CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; iconColor: string; titleColor: string }
> = {
  success: {
    icon: CheckCircle,
    bg: 'rgba(240, 255, 244, 0.97)',
    border: '#68D391',
    iconColor: '#38A169',
    titleColor: '#276749',
  },
  error: {
    icon: XCircle,
    bg: 'rgba(255, 245, 245, 0.97)',
    border: '#FC8181',
    iconColor: '#E53E3E',
    titleColor: '#9B2C2C',
  },
  warning: {
    icon: AlertCircle,
    bg: 'rgba(255, 255, 240, 0.97)',
    border: '#F6E05E',
    iconColor: '#D69E2E',
    titleColor: '#744210',
  },
  info: {
    icon: Info,
    bg: 'rgba(235, 248, 255, 0.97)',
    border: '#63B3ED',
    iconColor: '#3182CE',
    titleColor: '#1A365D',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastCard({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const cfg = CONFIG[item.type];
  const Icon = cfg.icon;

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(item.id), 280);
  }, [item.id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(handleClose, item.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [handleClose, item.duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minWidth: 300,
        maxWidth: 380,
        pointerEvents: 'all',
        animation: exiting
          ? 'slideOutRight 0.28s ease forwards'
          : 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      <Icon size={20} style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: cfg.titleColor,
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </p>
        {item.message && (
          <p style={{ fontSize: 13, color: '#4A5568', marginTop: 2, lineHeight: 1.5 }}>
            {item.message}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        aria-label="Tutup notifikasi"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#A0AEC0',
          padding: '2px',
          flexShrink: 0,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#4A5568')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#A0AEC0')}
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) => toast({ type: 'success', title, message }),
    [toast]
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ type: 'error', title, message }),
    [toast]
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ type: 'warning', title, message }),
    [toast]
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ type: 'info', title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Portal-like container */}
      <div id="toast-container">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
