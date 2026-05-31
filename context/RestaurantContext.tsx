'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Restaurant, type Review } from '@/lib/data';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

// ─── Context Value Interface ──────────────────────────────────────────────────
interface RestaurantContextValue {
  restaurants: Restaurant[];
  loading: boolean;
  apiError: string | null;
  refetch: () => Promise<void>;
  addRestaurant: (data: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive' | 'category' | 'ambiance' | 'menu'>) => Promise<void>;
  updateRestaurant: (id: string, updatedFields: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  addReview: (restaurantId: string, reviewData: Omit<Review, 'id' | 'date' | 'userAvatar'>) => Promise<void>;
}

// ─── API Response Shape ───────────────────────────────────────────────────────
// Backend may return paginated or plain array — handle both
interface CulinaryListResponse {
  data?: Restaurant[];
  items?: Restaurant[];
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ─── Load Restaurants ──────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Backend may return { data: [...] } (paginated) or plain array
      const raw = await apiGet<Restaurant[] | CulinaryListResponse>('/culinary');
      let list: Restaurant[];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray((raw as CulinaryListResponse).data)) {
        list = (raw as CulinaryListResponse).data!;
      } else if (Array.isArray((raw as CulinaryListResponse).items)) {
        list = (raw as CulinaryListResponse).items!;
      } else {
        list = [];
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
    refetch();
  }, [refetch]);

  // ─── Add Restaurant (ADMIN) ───────────────────────────────────────────────
  const addRestaurant = useCallback(
    async (data: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive' | 'category' | 'ambiance' | 'menu'>) => {
      const created = await apiPost<Restaurant>('/culinary', data);
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
      const updated = await apiPatch<Restaurant>(`/culinary/${id}`, safeFields);
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
