"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD } from "@/lib/whatsapp";
import { FIELDS, validateCheckout, type CheckoutValues, type FieldName, type FormErrors } from "./checkout";

const ERROR = "#9b3b2f";
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Hyderabad", "Gujranwala"];

const control = (error?: string) =>
  cn(
    "mt-1 h-11 w-full rounded-none border-0 border-b bg-transparent text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-mute/50 focus:border-ink focus-visible:outline-none",
    error ? "border-[#9b3b2f]" : "border-line-2 hover:border-ink-2/40",
  );

/** Subtotal / delivery / total rows, shared by the cart and checkout steps. */
export function Totals({
  subtotal,
  shipping,
  total,
  className,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  className?: string;
}) {
  return (
    <dl className={cn("space-y-2 text-[13px] text-ink-2", className)}>
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Delivery</dt>
        <dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 font-display text-[16px] font-semibold text-ink">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

function FieldShell({
  name,
  label,
  error,
  children,
}: {
  name: FieldName;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-2">
      <label htmlFor={`checkout-${name}`} className="block text-[12px] text-ink-2">
        {label}
      </label>
      {children}
      {/* Fixed-height slot so errors never shift the layout. */}
      <p id={`checkout-${name}-error`} className="mt-1 h-4 text-[11px] leading-4" style={{ color: ERROR }}>
        {error}
      </p>
    </div>
  );
}

export function CheckoutForm({
  values,
  onChange,
  onBack,
  onSubmit,
}: {
  values: CheckoutValues;
  onChange: React.Dispatch<React.SetStateAction<CheckoutValues>>;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { lines, count, subtotal, shipping, total } = useCart();
  const [errors, setErrors] = useState<FormErrors>({});
  const [announce, setAnnounce] = useState("");
  const form = useRef<HTMLFormElement>(null);

  const set = (name: FieldName, value: string) => {
    onChange((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateCheckout(values);
    const bad = FIELDS.filter((f) => next[f]);
    setErrors(next);
    if (bad.length) {
      setAnnounce(`Please check ${bad.length} ${bad.length === 1 ? "field" : "fields"}.`);
      form.current?.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus();
      return;
    }
    setAnnounce("");
    onSubmit();
  };

  const input = (
    name: FieldName,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => {
    const error = errors[name];
    return (
      <FieldShell name={name} label={label} error={error}>
        <input
          id={`checkout-${name}`}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `checkout-${name}-error` : undefined}
          value={values[name]}
          onChange={(e) => set(name, e.target.value)}
          className={control(error)}
          {...props}
        />
      </FieldShell>
    );
  };

  return (
    <form ref={form} noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8">
        <details className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[13px] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 text-ink-2">
              Order summary
              <span className="text-mute">
                · {count} {count === 1 ? "item" : "items"}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className="text-mute transition-transform duration-300 group-open:rotate-180"
              />
            </span>
            <span className="font-medium tabular-nums">{formatPrice(total)}</span>
          </summary>
          <div className="pb-5">
            <ul className="space-y-2">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-4 text-[13px]">
                  <span className="truncate text-ink-2">
                    {product.name} <span className="text-mute">× {qty}</span>
                  </span>
                  <span className="tabular-nums">{formatPrice(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <Totals subtotal={subtotal} shipping={shipping} total={total} className="mt-4 border-t border-line pt-4" />
          </div>
        </details>

        <fieldset className="mt-8 grid grid-cols-2 gap-x-5 gap-y-3">
          <legend className="mb-4 font-display text-[18px] font-bold tracking-[-0.01em] text-ink">Deliver to</legend>
          {input("name", "Full name", { autoComplete: "name", maxLength: 80 })}
          {input("phone", "Mobile number", {
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            placeholder: "0300 1234567",
            maxLength: 16,
          })}
          {input("city", "City", { autoComplete: "address-level2", list: "checkout-cities", maxLength: 60 })}
          {input("address", "Address", {
            autoComplete: "street-address",
            placeholder: "House, street, area",
            maxLength: 200,
          })}
          {input("notes", "Notes (optional)", { placeholder: "Landmark or best time to deliver", maxLength: 200 })}
          <datalist id="checkout-cities">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </fieldset>

        <p className="mt-6 rounded-[4px] bg-paper-2 px-4 py-3 text-[13px] leading-relaxed text-ink-2">
          Payment: <span className="text-ink">{PAYMENT_METHOD}</span>. Next you&apos;ll review your order before
          you place it.
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-6 border-t border-line px-6 pt-4 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to cart
        </button>
        <button type="submit" className={buttonClass("primary", "flex-1 sm:max-w-[240px]")}>
          Review order
        </button>
      </div>
      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
    </form>
  );
}
