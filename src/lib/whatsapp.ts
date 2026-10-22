import { formatPrice } from "./cart.ts";
import type { CartLine } from "./types";

/** Orders go to this WhatsApp number (international format, digits only). */
export const WHATSAPP_NUMBER = "923070766667";
export const PAYMENT_METHOD = "Cash on delivery";

export interface OrderDetails {
  number: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}

/** Plain-text order for WhatsApp (*bold* is WhatsApp markup). */
export function orderMessage(
  o: OrderDetails,
  lines: CartLine[],
  totals: { subtotal: number; shipping: number; total: number },
) {
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  return [
    "Hello KROMA, I'd like to place an order.",
    "",
    `*Order ${o.number}*`,
    ...lines.map(
      (l, i) =>
        `${i + 1}. ${l.product.name} (${l.product.subtitle}) × ${l.qty} — ${formatPrice(l.product.price * l.qty)}`,
    ),
    "",
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    `Delivery: ${totals.shipping ? formatPrice(totals.shipping) : "Free"}`,
    `*Total: ${formatPrice(totals.total)}*`,
    `Payment: ${PAYMENT_METHOD}`,
    "",
    "*Deliver to*",
    `Name: ${clean(o.name)}`,
    `Phone: ${o.phone}`,
    `City: ${clean(o.city)}`,
    `Address: ${clean(o.address)}`,
    ...(clean(o.notes) ? [`Notes: ${clean(o.notes)}`] : []),
  ].join("\n");
}

/** wa.me deep link that opens a chat with the message pre-filled (app on phones, WhatsApp Web on desktop). */
export const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
