"use client";

import { ArrowRight, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { buttonClass, Reveal } from "@/components/ui/primitives";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, formatPrice } from "@/lib/cart";
import { CHAT_LINK } from "@/lib/contact";
import { PRODUCTS } from "@/lib/products";
import { PAYMENT_METHOD } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Add to cart", body: `Pick what you like in the shop. Free delivery from ${formatPrice(FREE_SHIPPING_FROM)}.` },
  { title: "Add your details", body: "Name, mobile number, city and address." },
  { title: "Check out", body: "Review your order and place it. We reply to confirm." },
  { title: "Pay on delivery", body: "Pay cash when your order arrives." },
];

/** "A, B, C and D" */
const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]);
const namesWhere = (test: (p: (typeof PRODUCTS)[number]) => boolean) => [...new Set(PRODUCTS.filter(test).map((p) => p.name))];

const MICROWAVE_SAFE = namesWhere((p) => p.highlights.some((h) => /microwave/i.test(h)));
const KETTLES = namesWhere((p) => p.category === "kettles");

// Delivery answers live here (they used to be a separate table), next to payment and care.
const FAQS = [
  {
    q: "Where do you deliver?",
    a: "Anywhere in Pakistan. We confirm the delivery time for your city when we reply to your order.",
  },
  {
    q: "How much is delivery?",
    a: `${formatPrice(SHIPPING_FEE)} per order, and free on orders from ${formatPrice(FREE_SHIPPING_FROM)}.`,
  },
  {
    q: "How do I pay? Do I pay anything online?",
    a: `${PAYMENT_METHOD}. There is no online payment: you pay in cash when your order arrives.`,
  },
  {
    q: "How long does delivery take?",
    a: "It depends on your city. We confirm the delivery time when we reply to your order.",
  },
  {
    q: "Is your crockery really all glass?",
    a: "Yes. Our plates, bowls, cups, mugs and teapots are all glass, either tempered or borosilicate. We don't sell ceramic or stoneware.",
  },
  {
    q: "Which pieces can go in the microwave?",
    a: `The ${list(MICROWAVE_SAFE)}. Every product's details show how to wash it.`,
  },
  {
    q: "Do the kettles work on induction?",
    a: `Yes. The ${list(KETTLES)} all have thick bases for gas, electric and induction hobs.`,
  },
  {
    q: "How long do the flasks keep drinks hot or cold?",
    a: "Thermal Flask and Thermal Flask Compact: cold for 24 hours, hot for 12. Table Jug: hot for 12 hours, cold for 24. Commuter Bottle: cold for 18 hours, hot for 8.",
  },
];

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Why us", href: "/#why" },
  { label: "Top selling", href: "/#top-selling" },
  { label: "Collections", href: "/#collections" },
  // { label: "Inside the flask", href: "/#craft" }, // Inside section is switched off for now.
  { label: "Wholesale", href: "/wholesale" },
  { label: "Questions", href: "/#about" },
];

const SUBHEAD = "font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]";

/** The four ordering steps; shown in About on the home page and at the foot of the shop. */
export function OrderSteps({ id, className }: { id?: string; className?: string }) {
  return (
    <Reveal className={className}>
      <h3 id={id} className={`${SUBHEAD} scroll-mt-24`}>
        How to order
      </h3>
      <ol className="mt-6 border-t border-line lg:grid lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-5 border-b border-line py-4 lg:flex-col lg:gap-3 lg:border-b-0 lg:border-l lg:px-6 lg:py-6 lg:first:border-l-0 lg:first:pl-0"
          >
            <span className="pt-[3px] font-mono text-[13px] font-medium text-brand tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-[17px] font-semibold tracking-[-0.01em]">{s.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line py-20 sm:py-28 lg:py-24">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 id="about-title">
              <span className="display block text-[clamp(3.25rem,7.4vw,7rem)]">About</span>
              <span className="mt-2 block font-serif text-[clamp(1.5rem,2.6vw,2.375rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
                KROMA, and how ordering works
              </span>
            </h2>
            <p className="mt-8 max-w-[38rem] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-[1.6] text-ink">
              KROMA sells tea, drink and dinner wares in glass, stovetop kettles, and insulated steel flasks and
              bottles.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="rounded-[4px] bg-brand p-6 text-white sm:p-8 [&_:focus-visible]:outline-white">
              <p className="font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-white/85 uppercase">
                WhatsApp · orders and questions
              </p>
              <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-white/85">
                Message us about a product, an order, or delivery to your city.
              </p>
              <a
                href={CHAT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("inverse", "mt-7 w-full sm:w-auto")}
              >
                <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
                Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>

        <OrderSteps id="how-to-order" className="mt-16 lg:mt-20" />

        <div className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h3 className={SUBHEAD}>Questions</h3>
            <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-mute">
              Delivery, payment and care. Anything else, ask us on WhatsApp.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="border-t border-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group border-b border-line">
                  <summary className="flex list-none items-center justify-between gap-6 py-4 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus
                      aria-hidden
                      className="size-4 shrink-0 text-mute transition-transform duration-300 ease-quint group-open:rotate-45"
                      strokeWidth={2}
                    />
                  </summary>
                  <p className="max-w-[60ch] pb-5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Closing band after the questions: one push to the shop, one to contact us. */
export function OrderCta() {
  return (
    <section
      aria-labelledby="order-cta-title"
      className="relative isolate overflow-hidden bg-brand text-white [&_:focus-visible]:outline-white"
    >
      <div
        aria-hidden
        className="absolute top-1/2 right-[-12rem] -z-10 size-[46rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.16),transparent)]"
      />
      <p
        aria-hidden
        className="display pointer-events-none absolute -bottom-[0.18em] left-1/2 -z-10 -translate-x-1/2 text-[24vw] leading-none whitespace-nowrap text-white/[0.06] select-none"
      >
        KROMA
      </p>
      <div className="shell grid gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:items-center lg:py-28">
        <Reveal className="lg:col-span-7">
          <h2 id="order-cta-title">
            <span className="display block text-[clamp(3rem,6.6vw,6.25rem)]">Order today,</span>
            <span className="mt-2 block font-serif text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.1] tracking-[-0.01em] italic">
              pay when it arrives.
            </span>
          </h2>
          <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-white/85">
            Cash on delivery to every city in Pakistan. We confirm your order before we send it, and
            delivery is free from {formatPrice(FREE_SHIPPING_FROM)}.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
          <Link href="/shop" className={buttonClass("inverse", "group")}>
            Shop the range
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
          <a href={CHAT_LINK} target="_blank" rel="noopener noreferrer" className={buttonClass("outline-inverse")}>
            <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
            Contact us
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-line", className)}>
      <div className="shell flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <Link href="/" aria-label="KROMA home" className="display text-[34px] leading-none">
          KROMA
        </Link>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-4 transition-colors hover:text-ink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-start gap-4 text-[14px] sm:flex-row sm:items-center sm:gap-8">
          <a href={CHAT_LINK} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "h-10 px-5")}>
            <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
            Contact us
          </a>
          <p className="text-mute">© 2026 KROMA</p>
        </div>
      </div>
    </footer>
  );
}
