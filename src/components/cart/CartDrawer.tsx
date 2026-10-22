"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/Sheet";
import { FREE_SHIPPING_FROM, MAX_QTY, formatPrice } from "@/lib/cart";
import { EASE } from "@/lib/motion";
import { orderMessage, PAYMENT_METHOD, whatsappLink } from "@/lib/whatsapp";
import { CheckoutForm, Totals } from "./CheckoutForm";
import { EMPTY_FORM, normalizePhone } from "./checkout";

type Step = "bag" | "details" | "review" | "sent";

interface Order {
  number: string;
  total: number;
  message: string;
}

const TITLES: Record<Step, string> = {
  bag: "Cart",
  details: "Delivery details",
  review: "Review order",
  sent: "Order sent",
};

export function CartDrawer() {
  const { isOpen, closeCart, count, lines, subtotal, shipping, total, clear } = useCart();
  const [step, setStep] = useState<Step>("bag");
  const [form, setForm] = useState(EMPTY_FORM);
  const [order, setOrder] = useState<Order | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);

  // Back to the bag once the close animation is done.
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setStep("bag");
      setOrder(null);
    }, 500);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Move focus to the persistent title when the step changes, so it isn't lost with the old step.
  useEffect(() => {
    if (shownStep.current !== step && isOpen) title.current?.focus({ preventScroll: true });
    shownStep.current = step;
  }, [step, isOpen]);

  // Build the WhatsApp message from the validated form; the cart is cleared only once it is sent.
  const reviewOrder = () => {
    const number = `KR-${Math.floor(100000 + Math.random() * 900000)}`;
    const details = { ...form, number, phone: normalizePhone(form.phone) ?? form.phone };
    setOrder({ number, total, message: orderMessage(details, lines, { subtotal, shipping, total }) });
    setStep("review");
  };

  const markSent = () => {
    clear();
    setForm(EMPTY_FORM);
    setStep("sent");
  };

  const browse = () => {
    closeCart();
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ block: "start" }));
  };

  return (
    <Sheet open={isOpen} onClose={closeCart} label="Shopping cart">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
        <div className="flex items-baseline gap-3">
          <h2 ref={title} tabIndex={-1} className="display text-[26px] leading-none outline-none">
            {TITLES[step]}
          </h2>
          {step === "bag" && count > 0 && (
            <span className="eyebrow tabular-nums">
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={closeCart}
          aria-label="Close cart"
          className="-mr-2 grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink disabled:opacity-30"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </header>
      <p className="sr-only" aria-live="polite">
        {TITLES[step]}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {step === "bag" && <BagStep onCheckout={() => setStep("details")} onBrowse={browse} />}
          {step === "details" && (
            <CheckoutForm values={form} onChange={setForm} onBack={() => setStep("bag")} onSubmit={reviewOrder} />
          )}
          {step === "review" && order && <Review order={order} onEdit={() => setStep("details")} onSend={markSent} />}
          {step === "sent" && order && <Sent order={order} onDone={closeCart} />}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}

function BagStep({ onCheckout, onBrowse }: { onCheckout: () => void; onBrowse: () => void }) {
  const { lines, subtotal, shipping, total, setQty, remove } = useCart();

  if (!lines.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-16 text-center">
        <p className="eyebrow">Nothing here yet</p>
        <p className="mt-4 font-display text-[30px] leading-tight font-bold tracking-[-0.02em]">Your cart is empty.</p>
        <button type="button" onClick={onBrowse} className={buttonClass("primary", "mt-8")}>
          Browse the shop
        </button>
      </div>
    );
  }

  const remaining = FREE_SHIPPING_FROM - subtotal;
  return (
    <>
      <div className="shrink-0 border-b border-line px-6 py-4">
        <p className="text-[12px] text-ink-2" aria-live="polite">
          {remaining > 0 ? (
            <>
              <span className="tabular-nums">{formatPrice(remaining)}</span> away from free delivery
            </>
          ) : (
            "Free delivery unlocked"
          )}
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper-3">
          <motion.div
            className="h-full origin-left rounded-full bg-brand"
            initial={false}
            animate={{ scaleX: Math.min(1, subtotal / FREE_SHIPPING_FROM) }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6">
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map(({ product, qty }) => (
            <motion.li
              key={product.id}
              layout
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex gap-4 border-b border-line py-5 last:border-b-0"
            >
              <div className="h-[104px] w-[84px] shrink-0 rounded-[4px] bg-paper-2 px-1.5 pt-2">
                <ProductArt kind={product.kind} tone={product.tone} fit />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{product.name}</p>
                    <p className="mt-1 truncate text-[12px] text-mute">{product.subtitle}</p>
                  </div>
                  <p className="font-display text-[14px] font-semibold tabular-nums">{formatPrice(product.price * qty)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <QtyStepper name={product.name} qty={qty} onChange={(q) => setQty(product.id, q)} />
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="text-[12px] text-mute underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="shrink-0 border-t border-line px-6 pt-5 pb-6">
        <Totals subtotal={subtotal} shipping={shipping} total={total} />
        <button type="button" onClick={onCheckout} className={buttonClass("primary", "mt-5 w-full")}>
          Checkout
          <ArrowRight size={15} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}

const STEP_BUTTON =
  "grid h-full w-9 place-items-center rounded-full text-ink-2 transition-[color,background-color,transform] duration-200 hover:bg-paper-2 hover:text-ink active:scale-90 disabled:pointer-events-none disabled:opacity-30";

function QtyStepper({ name, qty, onChange }: { name: string; qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="flex h-9 items-center rounded-full border border-line-2">
      <button
        type="button"
        aria-label={`Decrease quantity of ${name}`}
        disabled={qty <= 1}
        onClick={() => onChange(qty - 1)}
        className={STEP_BUTTON}
      >
        <Minus size={13} strokeWidth={1.5} />
      </button>
      <span className="w-8 overflow-hidden text-center font-mono text-[13px] tabular-nums" aria-live="polite">
        <span className="sr-only">Quantity </span>
        <motion.span
          key={qty}
          className="inline-block"
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {qty}
        </motion.span>
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${name}`}
        disabled={qty >= MAX_QTY}
        onClick={() => onChange(qty + 1)}
        className={STEP_BUTTON}
      >
        <Plus size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}

/** WhatsApp markup → React: whole-line *bold* becomes <strong>. */
function MessageLine({ line }: { line: string }) {
  if (!line) return <br />;
  const bold = line.length > 2 && line.startsWith("*") && line.endsWith("*");
  return <p className={bold ? "font-semibold text-ink" : undefined}>{bold ? line.slice(1, -1) : line}</p>;
}

function Review({ order, onEdit, onSend }: { order: Order; onEdit: () => void; onSend: () => void }) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8">
        <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink-2">
          Your order is ready as a WhatsApp message. Send it to us and we&apos;ll reply to confirm delivery.{" "}
          {PAYMENT_METHOD}.
        </p>
        <div className="mt-6 rounded-[4px] bg-paper-2 p-5 text-[13px] leading-[1.6] text-ink-2 [overflow-wrap:anywhere]">
          {order.message.split("\n").map((line, i) => (
            <MessageLine key={i} line={line} />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-6 border-t border-line px-6 pt-4 pb-6">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-12 items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Edit details
        </button>
        <a
          href={whatsappLink(order.message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onSend}
          className={buttonClass("brand", "flex-1 sm:max-w-[260px]")}
        >
          <MessageCircle size={16} strokeWidth={2} aria-hidden />
          Send on WhatsApp
        </a>
      </div>
    </>
  );
}

function Sent({ order, onDone }: { order: Order; onDone: () => void }) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-10">
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
        <p className="eyebrow mt-8">
          Order {order.number} · <span className="tabular-nums">{formatPrice(order.total)}</span>
        </p>
        <h3 className="mt-3 font-display text-[40px] leading-[1.05] font-bold tracking-[-0.02em]">Thank you.</h3>
        <p className="mt-4 max-w-[36ch] text-[14px] leading-relaxed text-mute">
          We&apos;ll reply on WhatsApp to confirm your order and delivery time. Payment is cash on delivery.
        </p>
        <a
          href={whatsappLink(order.message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block text-[13px] text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
        >
          WhatsApp didn&apos;t open? Send the order again
        </a>
      </div>
      <div className="shrink-0 border-t border-line p-6">
        <button type="button" onClick={onDone} className={buttonClass("primary", "w-full")}>
          Continue shopping
        </button>
      </div>
    </>
  );
}
