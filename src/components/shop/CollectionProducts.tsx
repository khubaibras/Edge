"use client";

import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/ui/primitives";
import { SPRING } from "@/lib/motion";
import { COLLECTIONS, collectionHref, familiesIn, familyKey, PRODUCT_BY_ID } from "@/lib/products";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A collection's products as a grid of cards, colours grouped per card. `exclude` drops one family (the product being viewed). */
export function CollectionProducts({
  collection,
  exclude,
  limit,
  className,
}: {
  collection: Category;
  exclude?: string;
  limit?: number;
  className?: string;
}) {
  // Picked colour per card (family key → product id); a card without an entry shows its first colour.
  const [picks, setPicks] = useState<Record<string, string>>({});
  const families = familiesIn(collection)
    .filter((f) => familyKey(f[0]) !== exclude)
    .slice(0, limit);

  const pickedIn = (items: Product[]) => PRODUCT_BY_ID.get(picks[familyKey(items[0])] ?? "") ?? items[0];
  const pick = (p: Product) => setPicks((prev) => ({ ...prev, [familyKey(p)]: p.id }));

  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-y-14", className)}>
      {families.map((items, n) => (
        <li key={familyKey(items[0])}>
          <Reveal delay={(n % 4) * 0.06}>
            <ProductCard items={items} product={pickedIn(items)} onPick={pick} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/** Phones and tablets: the collections as sticky pills under the bar (desktop has them in the nav). */
export function CollectionBar() {
  const pathname = usePathname();
  const row = useRef<HTMLDivElement>(null);
  const active = COLLECTIONS.find((c) => pathname.startsWith(collectionHref(c.id)))?.id;

  // Keep the current pill in view.
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-pill="${active}"]`);
    if (!el || !row.current) return;
    row.current.scrollTo({ left: el.offsetLeft - 20 });
  }, [active]);

  return (
    <nav aria-label="Collections" className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-md lg:hidden">
      <div ref={row} className="shell flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <LayoutGroup id="collection-bar">
          {COLLECTIONS.map((c) => {
            const on = active === c.id;
            return (
              <Link
                key={c.id}
                href={collectionHref(c.id)}
                data-pill={c.id}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-10 shrink-0 items-center rounded-full border px-4 font-display text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300",
                  on ? "border-ink text-paper" : "border-line-2 text-ink",
                )}
              >
                {on && <motion.span layoutId="collection-pill" className="absolute -inset-px rounded-full bg-ink" transition={SPRING} />}
                <span className="relative">{c.label}</span>
              </Link>
            );
          })}
        </LayoutGroup>
      </div>
    </nav>
  );
}
