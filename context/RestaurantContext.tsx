'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_RESTAURANTS, type Restaurant, type Review } from '@/lib/data';

interface RestaurantContextValue {
  restaurants: Restaurant[];
  addRestaurant: (restaurantData: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive'>) => void;
  updateRestaurant: (id: string, updatedFields: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  addReview: (restaurantId: string, reviewData: Omit<Review, 'id' | 'date' | 'userAvatar'>) => void;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Load from localStorage or mock data
  useEffect(() => {
    const saved = localStorage.getItem('lth_restaurants');
    if (saved) {
      try {
        setRestaurants(JSON.parse(saved));
      } catch (e) {
        setRestaurants(MOCK_RESTAURANTS);
      }
    } else {
      setRestaurants(MOCK_RESTAURANTS);
      localStorage.setItem('lth_restaurants', JSON.stringify(MOCK_RESTAURANTS));
    }
  }, []);

  // Sync to localStorage helper
  const saveAndSet = (list: Restaurant[]) => {
    setRestaurants(list);
    localStorage.setItem('lth_restaurants', JSON.stringify(list));
  };

  const addRestaurant = (data: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'slug' | 'isActive'>) => {
    const id = `rest-${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newRest: Restaurant = {
      ...data,
      id,
      slug,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      isActive: true,
    };
    saveAndSet([newRest, ...restaurants]);
  };

  const updateRestaurant = (id: string, fields: Partial<Restaurant>) => {
    const updated = restaurants.map((r) => {
      if (r.id === id) {
        const next = { ...r, ...fields };
        if (fields.name) {
          next.slug = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        return next;
      }
      return r;
    });
    saveAndSet(updated);
  };

  const deleteRestaurant = (id: string) => {
    const filtered = restaurants.filter((r) => r.id !== id);
    saveAndSet(filtered);
  };

  const addReview = (restaurantId: string, reviewData: Omit<Review, 'id' | 'date' | 'userAvatar'>) => {
    const id = `rev-${Date.now()}`;
    const date = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        const newReview: Review = {
          ...reviewData,
          id,
          date,
          userAvatar: '', // default
        };
        const nextReviews = [newReview, ...r.reviews];
        const sum = nextReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const nextRating = nextReviews.length > 0 ? sum / nextReviews.length : 0;
        return {
          ...r,
          reviews: nextReviews,
          reviewCount: nextReviews.length,
          rating: parseFloat(nextRating.toFixed(1)),
        };
      }
      return r;
    });
    saveAndSet(updated);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
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
