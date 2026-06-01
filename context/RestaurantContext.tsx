'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Restaurant, type Review } from '@/lib/data';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

// ─── Context Value Interface ──────────────────────────────────────────────────
interface RestaurantContextValue {
  restaurants: Restaurant[];
  meta: PaginationMeta | null;
  loading: boolean;
  apiError: string | null;
  refetch: (params?: Record<string, any>) => Promise<void>;
  addRestaurant: (data: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive' | 'category' | 'menu'>) => Promise<void>;
  updateRestaurant: (id: string, updatedFields: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  addReview: (restaurantId: string, reviewData: Omit<Review, 'id' | 'date' | 'userAvatar'>) => Promise<void>;
}
// ─── API Response Shape ───────────────────────────────────────────────────────
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend may return paginated or plain array — handle both
interface CulinaryListResponse {
  data?: Restaurant[];
  items?: Restaurant[];
  meta?: PaginationMeta;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ─── Load Restaurants ──────────────────────────────────────────────────────
  const refetch = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setApiError(null);
    try {
      const queryString = params ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined && v !== 'all' && v !== '').map(([k, v]) => [k, String(v)])).toString() : '?limit=100'; // Default limit 100 for global fetching if no params
      const raw = await apiGet<Restaurant[] | CulinaryListResponse>(`/culinary${queryString}`);
      let list: Restaurant[];
      if (Array.isArray(raw)) {
        list = raw;
        setMeta(null);
      } else if (Array.isArray((raw as CulinaryListResponse).data)) {
        list = (raw as CulinaryListResponse).data!;
        setMeta((raw as CulinaryListResponse).meta || null);
      } else if (Array.isArray((raw as CulinaryListResponse).items)) {
        list = (raw as CulinaryListResponse).items!;
        setMeta((raw as CulinaryListResponse).meta || null);
      } else {
        list = [];
        setMeta(null);
      }
      setRestaurants(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data restoran.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(); // Initial fetch gets limit=100
  }, [refetch]);

  // ─── Add Restaurant (ADMIN) ───────────────────────────────────────────────
  const addRestaurant = useCallback(
    async (data: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive' | 'category' | 'menu'>) => {
      const res: any = await apiPost<Restaurant>('/culinary', data);
      const created = res.data || res;
      setRestaurants((prev) => [created, ...prev]);
    },
    []
  );

  // ─── Update Restaurant (ADMIN) ────────────────────────────────────────────
  const updateRestaurant = useCallback(
    async (id: string, fields: Partial<Restaurant>) => {
      // Hanya kirim field yang diterima backend
      const { id: _id, slug: _slug, rating: _rating, reviewCount: _rc,
        reviews: _rev, isActive: _ia, category: _cat,
        ambiance: _amb, menu: _menu, ...safeFields } = fields as any;
      const res: any = await apiPatch<Restaurant>(`/culinary/${id}`, safeFields);
      const updated = res.data || res;
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
    },
    []
  );

  // ─── Delete Restaurant (ADMIN) ────────────────────────────────────────────
  const deleteRestaurant = useCallback(async (id: string) => {
    await apiDelete(`/culinary/${id}`);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ─── Add Review ───────────────────────────────────────────────────────────
  const addReview = useCallback(
    async (restaurantId: string, reviewData: Omit<Review, 'id' | 'date' | 'userAvatar'>) => {
      await apiPost('/reviews', {
        culinaryPlaceId: restaurantId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      // Refetch the full list so ratings/reviewCount are recalculated by backend
      await refetch();
    },
    [refetch]
  );

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        meta,
        loading,
        apiError,
        refetch,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        addReview,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
