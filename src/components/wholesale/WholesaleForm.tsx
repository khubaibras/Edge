"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/primitives";
import { CHAT_LINK } from "@/lib/contact";
import { EASE } from "@/lib/motion";
import { COLLECTIONS } from "@/lib/products";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import {
  EMPTY_WHOLESALE,
  validateWholesale,
  wholesaleMessage,
  type WholesaleErrors,
  type WholesaleField,
  type WholesaleValues,
} from "@/lib/wholesale";

const ERROR = "#9b3b2f";
const FIELD_ORDER: WholesaleField[] = ["name", "business", "phone", "city", "collections", "quantity", "message"];

const control = (error?: string) =>
  cn(
    "mt-1 w-full rounded-none border-0 border-b bg-transparent text-[16px] text-ink outline-none transition-colors duration-300 placeholder:text-mute/50 focus:border-ink focus-visible:outline-none",
    error ? "border-[#9b3b2f]" : "border-line-2 hover:border-ink-2/40",
  );

function ErrorSlot({ name, error }: { name: WholesaleField; error?: string }) {
  // Fixed-height slot so errors never shift the layout.
  return (
    <p id={`wholesale-${name}-error`} className="mt-1 h-4 text-[11px] leading-4" style={{ color: ERROR }}>
      {error}
    </p>
  );
}

const STEPS = [
  { title: "Send your query", body: "Tell us which collections you need and roughly how many pieces." },
  { title: "Get a quote", body: "We reply with wholesale prices and stock." },
  { title: "Delivered to you", body: "Anywhere in Pakistan, on a date that suits you." },
];

/** Side card: how a wholesale query goes, and a direct line to chat. */
export function WholesaleInfo() {
  return (
    <div className="rounded-[4px] bg-brand p-6 text-white sm:p-8 [&_:focus-visible]:outline-white">
      <p className="font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-white/85 uppercase">
        How wholesale works
      </p>
      <ol className="mt-6 border-t border-white/20">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-5 border-b border-white/20 py-4">
            <span className="pt-[3px] font-mono text-[13px] font-medium tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[17px] font-semibold tracking-[-0.01em]">{s.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-white/85">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <a
        href={CHAT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("inverse", "mt-7 w-full sm:w-auto")}
      >
        <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
        Contact us
      </a>
    </div>
  );
}

/** Wholesale query: the details go to the shop as one chat message (WhatsApp), like an order. */
export function WholesaleForm() {
  const [values, setValues] = useState<WholesaleValues>(EMPTY_WHOLESALE);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<WholesaleErrors>({});
  const [announce, setAnnounce] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  // Picked collections in catalogue order, by label.
  const collections = COLLECTIONS.filter((c) => picked.includes(c.id)).map((c) => c.label);

  const set = (name: keyof WholesaleValues, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    if (errors.collections) setErrors((e) => ({ ...e, collections: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateWholesale(values, collections);
    const bad = FIELD_ORDER.filter((f) => next[f]);
    setErrors(next);
    if (bad.length) {
      setAnnounce(`Please check ${bad.length} ${bad.length === 1 ? "field" : "fields"}.`);
      form.current?.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus();
      return;
    }
    setAnnounce("");
    const message = wholesaleMessage(values, collections);
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    setSent(message);
  };

  const reset = () => {
    setValues(EMPTY_WHOLESALE);
    setPicked([]);
    setSent(null);
  };

  if (sent) {
    return (
      <div className="rounded-[4px] border border-line bg-paper p-6 sm:p-10" role="status">
        <svg viewBox="0 0 48 48" className="h-12 w-12 text-brand" aria-hidden>
          <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="1" />
          <motion.path
            d="M15 24.5l6 6 12-13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          />
        </svg>
        <h3 className="mt-8 font-display text-[40px] leading-[1.05] font-bold tracking-[-0.02em]">Thank you.</h3>
        <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
          Your query is ready in the chat. Press send there, and we&apos;ll reply with prices and delivery times.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            Send another query
          </button>
          <a
            href={whatsappLink(sent)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
          >
            Chat didn&apos;t open? Send it again
          </a>
        </div>
      </div>
    );
  }

  const input = (
    name: keyof WholesaleValues,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    wide = false,
  ) => {
    const error = errors[name];
    return (
      <div className={wide ? "sm:col-span-2" : undefined}>
        <label htmlFor={`wholesale-${name}`} className="block text-[12px] text-ink-2">
          {label}
        </label>
        <input
          id={`wholesale-${name}`}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `wholesale-${name}-error` : undefined}
          value={values[name]}
          onChange={(e) => set(name, e.target.value)}
          className={cn(control(error), "h-11")}
          {...props}
        />
        <ErrorSlot name={name} error={error} />
      </div>
    );
  };

  return (
    <form
      ref={form}
      noValidate
      onSubmit={submit}
      className="rounded-[4px] border border-line bg-paper p-6 sm:p-10"
      aria-labelledby="wholesale-form-title"
    >
      <h3 id="wholesale-form-title" className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]">
        Send a query
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-mute">Fields marked * are required.</p>

      <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {input("name", "Full name *", { autoComplete: "name", maxLength: 80 })}
        {input("business", "Business name", { autoComplete: "organization", placeholder: "Shop, café, hotel or office", maxLength: 80 })}
        {input("phone", "Mobile number *", {
          type: "tel",
          inputMode: "tel",
          autoComplete: "tel",
          placeholder: "0300 1234567",
          maxLength: 16,
        })}
        {input("city", "City *", { autoComplete: "address-level2", maxLength: 60 })}

        <fieldset
          className="sm:col-span-2"
          aria-invalid={errors.collections ? true : undefined}
          aria-describedby={errors.collections ? "wholesale-collections-error" : undefined}
        >
          <legend className="block text-[12px] text-ink-2">Collections you&apos;re interested in *</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLLECTIONS.map((c) => {
              const on = picked.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] transition-[background-color,color,border-color] duration-300 ease-quint has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink",
                    on ? "border-brand bg-brand text-white" : "border-line-2 text-ink hover:border-ink",
                  )}
                >
                  <input
                    type="checkbox"
                    name="collections"
                    value={c.id}
                    checked={on}
                    onChange={() => toggle(c.id)}
                    className="sr-only"
                  />
                  {on && <Check aria-hidden className="size-3.5" strokeWidth={2.5} />}
                  {c.label}
                </label>
              );
            })}
          </div>
          <ErrorSlot name="collections" error={errors.collections} />
        </fieldset>

        {input("quantity", "Approximate quantity", { placeholder: "e.g. 200 tea cups, 50 flasks", maxLength: 120 }, true)}

        <div className="sm:col-span-2">
          <label htmlFor="wholesale-message" className="block text-[12px] text-ink-2">
            Your query
          </label>
          <textarea
            id="wholesale-message"
            name="message"
            rows={3}
            maxLength={600}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Products, colours, delivery date or anything else"
            className={cn(control(), "resize-none py-2.5 leading-relaxed")}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[38ch] text-[13px] leading-relaxed text-mute">
          Your query opens in a chat with us, ready to send.
        </p>
        <button type="submit" className={buttonClass("brand", "shrink-0")}>
          Send query
        </button>
      </div>
      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
    </form>
  );
}
