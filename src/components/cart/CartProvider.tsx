"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cartTotals, clampQty } from "@/lib/cart";
import { PRODUCT_BY_ID } from "@/lib/products";
import type { CartLine } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

type Entry = { id: string; qty: number };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isOpen, setOpen] = useState(false);

  const add = useCallback((id: string, qty = 1) => {
    if (!PRODUCT_BY_ID.has(id)) return;
    setEntries((prev) =>
      prev.some((e) => e.id === id)
        ? prev.map((e) => (e.id === id ? { ...e, qty: clampQty(e.qty + qty) } : e))
        : [...prev, { id, qty: clampQty(qty) }],
    );
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const q = clampQty(qty);
    setEntries((prev) =>
      q === 0 ? prev.filter((e) => e.id !== id) : prev.map((e) => (e.id === id ? { ...e, qty: q } : e)),
    );
  }, []);

  const remove = useCallback((id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)), []);
  const clear = useCallback(() => setEntries([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(() => {
    const lines = entries.flatMap((e) => {
      const product = PRODUCT_BY_ID.get(e.id);
      return product ? [{ product, qty: e.qty }] : [];
    });
    return { lines, ...cartTotals(lines), add, setQty, remove, clear, isOpen, openCart, closeCart };
  }, [entries, isOpen, add, setQty, remove, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
