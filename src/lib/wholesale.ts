import { normalizePhone } from "../components/cart/checkout.ts";

/** Field order here is the on-screen order (used to focus the first invalid field). */
export const EMPTY_WHOLESALE = {
  name: "",
  business: "",
  phone: "",
  city: "",
  quantity: "",
  message: "",
};

export type WholesaleValues = typeof EMPTY_WHOLESALE;
export type WholesaleField = keyof WholesaleValues | "collections";
export type WholesaleErrors = Partial<Record<WholesaleField, string>>;

const REQUIRED: (keyof WholesaleValues)[] = ["name", "phone", "city"];

/** `collections` holds the labels of the collections picked. */
export function validateWholesale(f: WholesaleValues, collections: string[]): WholesaleErrors {
  const e: WholesaleErrors = {};
  for (const k of REQUIRED) if (!f[k].trim()) e[k] = "Required";
  if (!e.phone && !normalizePhone(f.phone)) e.phone = "Enter a mobile number like 0300 1234567";
  if (!collections.length) e.collections = "Pick at least one collection";
  return e;
}

/** Plain-text wholesale query for WhatsApp (*bold* is WhatsApp markup). */
export function wholesaleMessage(f: WholesaleValues, collections: string[]) {
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  const optional = (label: string, value: string) => (clean(value) ? [`${label}: ${clean(value)}`] : []);
  return [
    "Hello EDGE GLASSWARE, I have a wholesale query.",
    "",
    "*Wholesale query*",
    `Name: ${clean(f.name)}`,
    ...optional("Business", f.business),
    `Phone: ${normalizePhone(f.phone) ?? clean(f.phone)}`,
    `City: ${clean(f.city)}`,
    `Interested in: ${collections.join(", ")}`,
    ...optional("Quantity", f.quantity),
    ...optional("Message", f.message),
  ].join("\n");
}
