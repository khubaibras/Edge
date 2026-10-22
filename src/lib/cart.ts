import type { CartLine } from "./types";

/** Rupees. Delivery is free from this subtotal, otherwise a flat fee. */
export const FREE_SHIPPING_FROM = 5000;
export const SHIPPING_FEE = 250;
export const MAX_QTY = 10;

/** "Rs 4,500". Hand-rolled instead of Intl so server and browser always render identical text. */
export const formatPrice = (amount: number) =>
  `Rs ${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export function cartTotals(lines: CartLine[]) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  return { count, subtotal, shipping, total: subtotal + shipping };
}

export const clampQty = (qty: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
