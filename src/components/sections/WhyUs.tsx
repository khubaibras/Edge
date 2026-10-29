"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { CheckCheck } from "lucide-react";
import { useRef, useState } from "react";
import { GroupArt } from "@/components/art/ProductArt";
import { Reveal } from "@/components/ui/primitives";
import { cartTotals, FREE_SHIPPING_FROM, formatPrice } from "@/lib/cart";
import { EASE } from "@/lib/motion";
import { PRODUCT_BY_ID } from "@/lib/products";
import type { CartLine } from "@/lib/types";
import { PAYMENT_METHOD } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Visual = "glass" | "flasks" | "whatsapp" | "cash";

const REASONS: { title: string; body: string; caption: string; visual: Visual }[] = [
  {
    title: "Glass crockery, no ceramics",
    body: "Every plate, bowl, cup, mug and teapot we sell is tempered or borosilicate glass. It takes hot food and boiling water, and you can see what's inside.",
    caption: "Tempered and borosilicate glass",
    visual: "glass",
  },
  {
    title: "Hot for 12, cold for 24",
    body: "Our double-wall vacuum flasks keep chai hot for 12 hours and water cold for 24, and the outside never sweats.",
    caption: "Double-wall vacuum steel",
    visual: "flasks",
  },
  {
    title: "Order in one message",
    body: "Your cart comes to us as one message. No account and no sign-up. We reply to confirm your order and when it will arrive.",
    caption: "Ordered in one message",
    visual: "whatsapp",
  },
  {
    title: "Pay when it arrives",
    body: `Cash on delivery anywhere in Pakistan. Nothing to pay online, and delivery is free on orders from ${formatPrice(FREE_SHIPPING_FROM)}.`,
    caption: "Cash on delivery",
    visual: "cash",
  },
];

const STEP_MS = 7000;

// A sample order made of real products and prices, totalled the way the cart totals it.
const SAMPLE: CartLine[] = [
  ["thermal-flask-750", 1],
  ["glass-mug", 2],
].flatMap(([id, qty]) => {
  const product = PRODUCT_BY_ID.get(id as string);
  return product ? [{ product, qty: qty as number }] : [];
});
const SAMPLE_TOTALS = cartTotals(SAMPLE);
const SAMPLE_NUMBER = "KR-385832";

export function WhyUs() {
  const ref = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.45 });
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const progress = useMotionValue(0);
  const reason = REASONS[index];

  const pick = (n: number, focus = false) => {
    const next = (n + REASONS.length) % REASONS.length;
    progress.set(0);
    setIndex(next);
    if (focus) tabs.current[next]?.focus();
  };

  // Steps through the reasons while in view; hovering or focusing the section holds it.
  useAnimationFrame((_, delta) => {
    if (reduce || hold || !inView) return;
    const p = progress.get() + delta / STEP_MS;
    if (p < 1) progress.set(p);
    else pick(index + 1);
  });

  return (
    <section
      id="why"
      ref={ref}
      aria-labelledby="why-title"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHold(false)}
      className="py-20 sm:py-28 lg:py-24"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <Reveal className="lg:col-span-5">
          <h2 id="why-title" className="display text-[clamp(3rem,6.4vw,6rem)]">
            Why us?
          </h2>

          <div
            role="tablist"
            aria-label="Reasons to order from KROMA"
            className="mt-8 flex gap-2"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") pick(index + 1, true);
              if (e.key === "ArrowLeft") pick(index - 1, true);
            }}
          >
            {REASONS.map((r, n) => {
              const on = n === index;
              return (
                <button
                  key={r.title}
                  ref={(el) => {
                    tabs.current[n] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`why-tab-${n}`}
                  aria-selected={on}
                  aria-controls="why-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(n)}
                  className={cn(
                    "relative grid size-12 place-items-center rounded-full border font-display text-[15px] font-semibold tabular-nums transition-[background-color,color,border-color] duration-300 ease-quint",
                    on ? "border-brand bg-brand text-white" : "border-line-2 text-ink hover:border-ink",
                  )}
                >
                  {n + 1}
                  {on && (
                    // Time left on this reason, drawn round the active number.
                    <svg aria-hidden viewBox="0 0 52 52" className="absolute -inset-[5px] -rotate-90 motion-reduce:hidden">
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="24.5"
                        fill="none"
                        stroke="var(--color-brand)"
                        strokeWidth="1.5"
                        style={{ pathLength: progress }}
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-7 h-px bg-ink" />

          <div id="why-panel" role="tabpanel" aria-labelledby={`why-tab-${index}`} className="mt-7 min-h-[9.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]">
                  {reason.title}
                </h3>
                <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-ink-2">{reason.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[4px] bg-brand text-white [container-type:inline-size]">
            <p
              aria-hidden
              className="display pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30cqi] whitespace-nowrap text-white/[0.07] select-none"
            >
              KROMA
            </p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={reason.visual}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <ReasonVisual visual={reason.visual} />
              </motion.div>
            </AnimatePresence>
            <p className="absolute bottom-5 left-5 font-display text-[15px] font-semibold sm:bottom-6 sm:left-6">{reason.caption}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReasonVisual({ visual }: { visual: Visual }) {
  if (visual === "glass" || visual === "flasks") {
    return (
      <div className="absolute inset-x-[12%] top-[12%] bottom-[16%]">
        <GroupArt collection={visual === "glass" ? "dinner" : "flasks"} />
      </div>
    );
  }
  return visual === "whatsapp" ? <ChatMock /> : <Receipt />;
}

const BUBBLE = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

/** The order as it lands in the shop's WhatsApp, and the shop's reply. */
function ChatMock() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center p-[6%]">
      <div className="flex w-full max-w-[27rem] flex-col gap-3">
        <motion.div
          {...BUBBLE}
          transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="ml-auto w-[88%] rounded-[14px] rounded-br-[4px] bg-white p-4 font-mono text-[12px] leading-[1.65] text-ink shadow-lift"
        >
          <p className="font-semibold">Order {SAMPLE_NUMBER}</p>
          {SAMPLE.map((l, i) => (
            <p key={l.product.id} className="flex justify-between gap-3">
              <span className="truncate">
                {i + 1}. {l.product.name} × {l.qty}
              </span>
              <span className="tabular-nums">{formatPrice(l.product.price * l.qty)}</span>
            </p>
          ))}
          <p className="mt-1 flex justify-between gap-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(SAMPLE_TOTALS.total)}</span>
          </p>
          <p className="text-mute">Payment: {PAYMENT_METHOD}</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-mute">
            10:42 <CheckCheck className="size-3.5 text-brand" strokeWidth={2} />
          </p>
        </motion.div>
        <motion.div
          {...BUBBLE}
          transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
          className="w-[72%] rounded-[14px] rounded-bl-[4px] bg-white/15 px-4 py-3 text-[13px] leading-snug text-white ring-1 ring-white/20 ring-inset"
        >
          Thank you! Order {SAMPLE_NUMBER} is confirmed. You pay in cash when it arrives.
        </motion.div>
      </div>
    </div>
  );
}

/** A delivery slip: nothing paid yet, cash on the doorstep. */
function Receipt() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center p-[6%]">
      <motion.div
        initial={{ rotate: -6, y: 20 }}
        animate={{ rotate: -3, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative w-[min(62%,20rem)] bg-paper px-5 pt-5 pb-14 font-mono text-[11px] leading-[1.7] text-ink-2 shadow-lift"
      >
        <p className="display text-[22px] text-ink">KROMA</p>
        <p className="mt-1 uppercase">Delivery slip · {SAMPLE_NUMBER}</p>
        <div className="my-3 border-t border-dashed border-line-2" />
        {SAMPLE.map((l) => (
          <p key={l.product.id} className="flex justify-between gap-3">
            <span className="truncate">
              {l.product.name} × {l.qty}
            </span>
            <span className="tabular-nums">{formatPrice(l.product.price * l.qty)}</span>
          </p>
        ))}
        <p className="flex justify-between gap-3">
          <span>Delivery</span>
          <span>{SAMPLE_TOTALS.shipping ? formatPrice(SAMPLE_TOTALS.shipping) : "Free"}</span>
        </p>
        <div className="my-3 border-t border-dashed border-line-2" />
        <p className="flex justify-between gap-3 text-[13px] font-medium text-ink">
          <span>To pay at the door</span>
          <span className="tabular-nums">{formatPrice(SAMPLE_TOTALS.total)}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span>Paid online</span>
          <span className="tabular-nums">{formatPrice(0)}</span>
        </p>
        <motion.p
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.5 }}
          className="absolute -right-6 bottom-2 rotate-[-8deg] rounded-[4px] border-2 border-brand bg-paper/90 px-3 py-1.5 font-display text-[15px] font-bold tracking-[0.04em] text-brand uppercase"
        >
          Cash on delivery
        </motion.p>
      </motion.div>
    </div>
  );
}
