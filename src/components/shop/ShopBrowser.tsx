"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CollectionProducts } from "@/components/shop/CollectionProducts";
import { ShopHero } from "@/components/shop/ShopHero";
import { EASE } from "@/lib/motion";
import { COLLECTION_BY_ID, COLLECTION_BY_SLUG, collectionHref } from "@/lib/products";
import type { Category } from "@/lib/types";

/**
 * The shop landing: every product below the collection panels. Picking a panel narrows the list to that
 * collection without leaving the page; picking it again shows everything again. The
 * pick is kept in the address (#tea-wares) so a refresh or a shared link reopens it.
 */
export function ShopBrowser() {
  const [picked, setPicked] = useState<Category | null>(null);
  const [scroll, setScroll] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // A link to /shop#drink-wares opens with that collection showing.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const fromHash = COLLECTION_BY_SLUG.get(window.location.hash.slice(1))?.id;
      if (fromHash) {
        setPicked(fromHash);
        setScroll((n) => n + 1);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Bring the products into view after each pick, once they have rendered.
  useEffect(() => {
    if (!scroll) return;
    const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 60);
    return () => clearTimeout(t);
  }, [scroll, reduce]);

  const filter = (id: Category | null) => {
    setPicked(id);
    const slug = id ? COLLECTION_BY_ID.get(id)?.slug : undefined;
    window.history.replaceState(null, "", slug ? `#${slug}` : window.location.pathname);
  };
  // From the panels at the top: filter and bring the products into view. Picking the panel that is
  // already selected clears the filter, so every product shows again.
  const pick = (id: Category) => {
    filter(picked === id ? null : id);
    setScroll((n) => n + 1);
  };

  const c = picked ? COLLECTION_BY_ID.get(picked) : undefined;

  return (
    <>
      <ShopHero picked={picked} onPick={pick} />
      <section
        id="shop-products"
        ref={ref}
        aria-labelledby="shop-products-title"
        className="shell scroll-mt-16 border-b border-line pt-12 pb-16 sm:pt-16 sm:pb-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <h2 id="shop-products-title" className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight font-bold tracking-[-0.02em]">
              {c ? c.label : "All products"}
            </h2>
            <p className="mt-1 font-serif text-[clamp(1.125rem,1.6vw,1.375rem)] text-ink-2 italic">
              {c ? c.tagline : "everything we make, in one place"}
            </p>
          </div>
          {c && (
            <Link
              href={collectionHref(c.id)}
              className="group inline-flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.06em] text-brand uppercase"
            >
              See the full {c.label} page
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={picked ?? "all"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            aria-live="polite"
          >
            <CollectionProducts collection={picked ?? undefined} className="mt-8" />
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
}
