/** Field order here is the on-screen order (used to focus the first invalid field). */
export const EMPTY_FORM = {
  name: "",
  phone: "",
  city: "",
  address: "",
  notes: "",
};

export type CheckoutValues = typeof EMPTY_FORM;
export type FieldName = keyof CheckoutValues;
export type FormErrors = Partial<Record<FieldName, string>>;

export const FIELDS = Object.keys(EMPTY_FORM) as FieldName[];
const REQUIRED: FieldName[] = ["name", "phone", "city", "address"];

/** Pakistani mobile (0300 1234567 / +92 300 1234567 / 923001234567) → "+923001234567", else null. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  const local = d.startsWith("92") ? d.slice(2) : d.startsWith("0") ? d.slice(1) : d;
  return /^3\d{9}$/.test(local) ? `+92${local}` : null;
}

export function validateCheckout(f: CheckoutValues): FormErrors {
  const e: FormErrors = {};
  for (const k of REQUIRED) if (!f[k].trim()) e[k] = "Required";
  if (!e.phone && !normalizePhone(f.phone)) e.phone = "Enter a mobile number like 0300 1234567";
  return e;
}
