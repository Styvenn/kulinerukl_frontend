'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  menuId: string;
  menuName: string;
  menuImage?: string;
  price: number;
  qty: number;
  stock: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (menuId: string) => void;
  updateQty: (menuId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('lth_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuId === item.menuId);
      let newItems;
      if (existing) {
        if (existing.qty >= existing.stock) return prev;
        newItems = prev.map((i) =>
          i.menuId === item.menuId ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        if (item.stock < 1) return prev;
        newItems = [...prev, { ...item, qty: 1 }];
      }
      localStorage.setItem('lth_cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeItem = useCallback((menuId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.menuId !== menuId);
      localStorage.setItem('lth_cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const updateQty = useCallback((menuId: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.menuId === menuId);
      if (existing && qty > existing.stock) return prev;
      
      const newItems = prev.map((i) =>
        i.menuId === menuId ? { ...i, qty } : i
      );
      localStorage.setItem('lth_cart', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('lth_cart');
  }, []);

  // Avoid hydration mismatch by only calculating totals on client if possible, or just default to 0 on server
  const totalItems = mounted ? items.reduce((acc, i) => acc + i.qty, 0) : 0;
  const totalPrice = mounted ? items.reduce((acc, i) => acc + (i.price * i.qty), 0) : 0;

  return (
    <CartContext.Provider
      value={{
        items: mounted ? items : [],
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
