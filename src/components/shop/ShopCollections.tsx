"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Scene } from "@/components/art/Scene";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickView } from "@/components/shop/QuickView";
import { useActiveCollection } from "@/components/shop/useActiveSection";
import { Reveal } from "@/components/ui/primitives";
import { SPRING } from "@/lib/motion";
import { COLLECTIONS, familiesIn, familyKey, PRODUCT_BY_ID } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

// Built once: each collection's cards, colours grouped per card.
const SHELVES = COLLECTIONS.map((c) => ({ collection: c, families: familiesIn(c.id) }));
const FAMILY_OF = new Map(SHELVES.flatMap((s) => s.families.map((f) => [familyKey(f[0]), f] as const)));

/** Every collection as its own shelf, in the client's order. Colour picks are shared by card and details panel. */
export function ShopCollections() {
  // Picked colour per card (family key → product id); a card without an entry shows its first colour.
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [quickKey, setQuickKey] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const pickedIn = (items: Product[]) => PRODUCT_BY_ID.get(picks[familyKey(items[0])] ?? "") ?? items[0];
  const pick = (p: Product) => setPicks((prev) => ({ ...prev, [familyKey(p)]: p.id }));
  const openQuick = (key: string) => {
    setQuickKey(key);
    setQuickOpen(true);
  };

  // Arriving from another page: /shop#<collection> lands on that shelf, and /shop#p-<product id> lands on
  // that card with its colour picked and details open. (Jump, don't glide, past everything above it.)
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const product = id.startsWith("p-") ? PRODUCT_BY_ID.get(id.slice(2)) : undefined;
    if (!product) {
      const shelf = id ? document.getElementById(id) : null;
      if (!shelf) return;
      const raf = requestAnimationFrame(() => shelf.scrollIntoView({ block: "start", behavior: "instant" }));
      return () => cancelAnimationFrame(raf);
    }
    const key = familyKey(product);
    const t1 = setTimeout(() => {
      document.getElementById(`card-${key}`)?.scrollIntoView({ block: "center" });
      setPicks((prev) => ({ ...prev, [key]: product.id }));
    }, 60);
    const t2 = setTimeout(() => openQuick(key), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const quickItems = quickKey ? (FAMILY_OF.get(quickKey) ?? []) : [];

  return (
    <>
      <CollectionBar />
      {SHELVES.map(({ collection: c, families }, i) => (
        <section
          key={c.id}
          id={c.slug}
          data-collection={c.id}
          aria-labelledby={`${c.slug}-title`}
          className={cn("scroll-mt-16 py-16 sm:py-20 lg:scroll-mt-0 lg:py-24", i > 0 && "border-t border-line")}
        >
          <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <Reveal className="lg:sticky lg:top-24">
                <p className="eyebrow tabular-nums">
                  {pad(i + 1)} / {pad(SHELVES.length)} · {families.length} products
                </p>
                <h2 id={`${c.slug}-title`} className="display mt-3 text-[clamp(3rem,4.6vw,4.75rem)]">
                  {c.label}
                </h2>
                <p className="mt-2 font-serif text-[clamp(1.375rem,1.9vw,1.75rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
                  {c.tagline}
                </p>
                <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-mute">{c.description}</p>
                <Scene collection={c.id} className="mt-8 hidden aspect-[4/3] sm:block" />
              </Reveal>
            </div>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:col-span-8 xl:grid-cols-3 xl:gap-y-14">
              {families.map((items, n) => {
                const key = familyKey(items[0]);
                return (
                  <li key={key} id={`card-${key}`} className="scroll-mt-32">
                    <Reveal delay={(n % 3) * 0.06}>
                      <ProductCard
                        items={items}
                        product={pickedIn(items)}
                        onPick={pick}
                        onQuickView={() => openQuick(key)}
                      />
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      <QuickView
        items={quickItems}
        product={quickItems.length ? pickedIn(quickItems) : null}
        onPick={pick}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </>
  );
}

/** Phones and tablets: the collections as sticky pills under the bar (desktop has them in the nav). */
function CollectionBar() {
  const active = useActiveCollection();
  const row = useRef<HTMLDivElement>(null);

  // Keep the current pill in view as the page scrolls past each shelf.
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-pill="${active}"]`);
    if (!el || !row.current) return;
    row.current.scrollTo({ left: el.offsetLeft - 20, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Collections" className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md lg:hidden">
      <div ref={row} className="shell flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LayoutGroup id="collection-bar">
          {SHELVES.map(({ collection: c, families }) => {
            const on = active === c.id;
            return (
              <a
                key={c.id}
                href={`#${c.slug}`}
                data-pill={c.id}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "relative flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300",
                  on ? "border-ink text-paper" : "border-line-2 text-ink",
                )}
              >
                {on && <motion.span layoutId="collection-pill" className="absolute -inset-px rounded-full bg-ink" transition={SPRING} />}
                <span className="relative">{c.label}</span>
                <span
                  className={cn(
                    "relative font-mono text-[11px] font-medium tabular-nums transition-colors duration-300",
                    on ? "text-paper/70" : "text-mute",
                  )}
                >
                  {families.length}
                </span>
              </a>
            );
          })}
        </LayoutGroup>
      </div>
    </nav>
  );
}
