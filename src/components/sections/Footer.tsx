"use client";

import { MessageCircle, Plus } from "lucide-react";
import { buttonClass, Reveal } from "@/components/ui/primitives";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, formatPrice } from "@/lib/cart";
import { CHAT_LINK, PHONE_DISPLAY } from "@/lib/contact";
import { PRODUCTS } from "@/lib/products";
import { PAYMENT_METHOD } from "@/lib/whatsapp";

const STEPS = [
  { title: "Add to cart", body: `Pick what you like. Free delivery from ${formatPrice(FREE_SHIPPING_FROM)}.` },
  { title: "Add your details", body: "Name, mobile number, city and address." },
  { title: "Send it on WhatsApp", body: "Your order opens as a WhatsApp message. Press send." },
  { title: "Pay on delivery", body: "We confirm on WhatsApp. Pay cash when it arrives." },
];

const DELIVERY = [
  { label: "Where", value: "Anywhere in Pakistan" },
  { label: "Delivery charge", value: `${formatPrice(SHIPPING_FEE)} per order` },
  { label: "Free delivery", value: `On orders from ${formatPrice(FREE_SHIPPING_FROM)}` },
  { label: "Delivery time", value: "Confirmed on WhatsApp when we reply to your order" },
  { label: "Payment", value: PAYMENT_METHOD },
];

/** "A, B, C and D" */
const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0]);

const MICROWAVE_SAFE = PRODUCTS.filter((p) => p.highlights.some((h) => /microwave/i.test(h))).map((p) => p.name);

const FAQS = [
  {
    q: "Do I pay anything online?",
    a: "No. There is no online payment. You pay cash when your order is delivered.",
  },
  {
    q: "How long does delivery take?",
    a: "It depends on your city. We confirm the delivery time on WhatsApp when we reply to your order.",
  },
  {
    q: "Is your crockery really all glass?",
    a: "Yes. Our plates, bowls, tea cups and mugs are all glass, either tempered or borosilicate. We don't sell ceramic or stoneware.",
  },
  {
    q: "Which pieces can go in the microwave?",
    a: `The ${list(MICROWAVE_SAFE)}. Every product's details show how to wash it.`,
  },
  {
    q: "How long do the flasks keep drinks hot or cold?",
    a: "Thermal Flask and Thermal Flask Compact: cold for 24 hours, hot for 12. Table Jug: hot for 12 hours, cold for 24. Commuter Bottle: cold for 18 hours, hot for 8.",
  },
];

const LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "Inside the flask", href: "#craft" },
  { label: "Ideas", href: "#lookbook" },
  { label: "About & ordering", href: "#about" },
];

const SUBHEAD = "font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]";

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
              KROMA sells insulated steel flasks and glass tableware: drinking glasses, mugs, tea cups, plates and
              bowls.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="rounded-[4px] bg-brand p-6 text-white sm:p-8 [&_:focus-visible]:outline-white">
              <p className="font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-white/85 uppercase">
                WhatsApp · orders and questions
              </p>
              <p className="mt-5 font-display text-[clamp(1.875rem,3.2vw,2.75rem)] leading-none font-bold tracking-[-0.02em] whitespace-nowrap tabular-nums">
                {PHONE_DISPLAY}
              </p>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-white/85">
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

        <Reveal className="mt-16 lg:mt-20">
          <h3 id="how-to-order" className={`${SUBHEAD} scroll-mt-8`}>
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

        <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h3 className={SUBHEAD}>Delivery</h3>
            <dl className="mt-6 border-t border-line">
              {DELIVERY.map((d) => (
                <div key={d.label} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4 text-[15px]">
                  <dt className="eyebrow pt-[3px]">{d.label}</dt>
                  <dd className="text-ink">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <h3 className={SUBHEAD}>Questions</h3>
            <div className="mt-6 border-t border-line">
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

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <a href="#top" aria-label="KROMA, back to top" className="display text-[34px] leading-none">
          KROMA
        </a>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="underline-offset-4 transition-colors hover:text-ink hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-1 text-[14px] sm:flex-row sm:items-center sm:gap-8">
          <a
            href={CHAT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium tabular-nums underline-offset-4 hover:underline"
          >
            WhatsApp {PHONE_DISPLAY}
          </a>
          <p className="text-mute">© 2026 KROMA</p>
        </div>
      </div>
    </footer>
  );
}
