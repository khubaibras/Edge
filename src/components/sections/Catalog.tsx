"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickView } from "@/components/shop/QuickView";
import { useShopFilter, type Filter } from "@/components/shop/ShopFilter";
import { SectionHeader } from "@/components/ui/primitives";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, formatPrice } from "@/lib/cart";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { EASE, SPRING } from "@/lib/motion";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const countFor = (id: Filter) => (id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length);

export function Catalog() {
  const { filter, setFilter } = useShopFilter();
  const [quick, setQuick] = useState<Product | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const visible = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  const openQuick = (p: Product) => {
    setQuick(p);
    setQuickOpen(true);
  };

  return (
    <section id="shop" aria-labelledby="shop-title" className="py-20 sm:py-28 lg:py-24">
      <div className="shell">
        <SectionHeader
          id="shop-title"
          title="Shop"
          italic="Steel flasks, glassware and glass crockery"
          aside={
            <>
              All prices in rupees. Delivery is {formatPrice(SHIPPING_FEE)} anywhere in Pakistan and free on orders
              from {formatPrice(FREE_SHIPPING_FROM)}. You pay cash when your order arrives.
            </>
          }
        />

        {/* Category links from the nav and hero land here, so products are in view straight away. */}
        <div id="shop-filters" className="mt-12 flex scroll-mt-4 items-center justify-between gap-6 sm:mt-16">
          <div role="group" aria-label="Filter products" className="flex flex-wrap gap-2">
            <LayoutGroup id="catalog-filter">
              {CATEGORIES.map((c) => {
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    aria-controls="catalog-grid"
                    onClick={() => setFilter(c.id)}
                    className={cn(
                      "relative flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-display text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300",
                      active ? "border-ink text-paper" : "border-line-2 text-ink hover:border-ink",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="catalog-filter-pill" className="absolute -inset-px rounded-full bg-ink" transition={SPRING} />
                    )}
                    <span className="relative">{c.label}</span>
                    <span
                      className={cn(
                        "relative font-mono text-[11px] font-medium tabular-nums transition-colors duration-300",
                        active ? "text-paper/70" : "text-mute",
                      )}
                    >
                      {countFor(c.id)}
                    </span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
          <p className="eyebrow hidden shrink-0 tabular-nums md:block" aria-live="polite">
            {visible.length} of {PRODUCTS.length} products
          </p>
        </div>

        <ul
          id="catalog-grid"
          className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 xl:gap-y-14"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 7) * 0.04 }}
              >
                <ProductCard product={p} onQuickView={() => openQuick(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      <QuickView product={quick} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </section>
  );
}
