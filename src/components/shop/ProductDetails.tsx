"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { swatchOf } from "@/components/art/shared";
import { useCart } from "@/components/cart/CartProvider";
import { useAddFeedback } from "@/components/shop/ProductCard";
import { keepScrollFor } from "@/components/shop/ScrollReset";
import { buttonClass } from "@/components/ui/primitives";
import { formatPrice, MAX_QTY } from "@/lib/cart";
import { EASE } from "@/lib/motion";
import { COLLECTION_BY_ID, collectionHref, productHref } from "@/lib/products";
import type { ArtView, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEWS: { id: ArtView; label: string }[] = [
  { id: "front", label: "View 1" },
  { id: "alt", label: "View 2" },
];

/** A product's own page: large picture with two views on the left, everything about it on the right. */
export function ProductDetails({ product, items }: { product: Product; items: Product[] }) {
  const { add, openCart } = useCart();
  const [view, setView] = useState<ArtView>("front");
  const [qty, setQty] = useState(1);
  const [added, flagAdded] = useAddFeedback();
  const collection = COLLECTION_BY_ID.get(product.category);

  const addToCart = () => {
    add(product.id, qty);
    flagAdded();
    openCart();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <div className="relative aspect-square overflow-hidden rounded-[4px] bg-paper-2 lg:sticky lg:top-24 lg:aspect-[5/4]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={`${view}-${product.id}`}
              className="absolute inset-[7%]"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <ProductArt
                kind={product.kind}
                tone={product.tone}
                view={view}
                fit
                title={`${product.name}, ${view === "front" ? "first" : "second"} view`}
              />
            </motion.div>
          </AnimatePresence>
          <div role="group" aria-label="Choose a view" className="absolute bottom-4 left-4 flex gap-1 rounded-full bg-paper/80 p-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
                className="relative h-8 rounded-full px-3.5 font-mono text-[11px] font-medium tracking-[0.06em] uppercase transition-colors not-aria-pressed:text-mute hover:text-ink aria-pressed:text-paper"
              >
                {view === v.id && (
                  <motion.span layoutId="pd-view" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.4, ease: EASE }} />
                )}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        {collection && (
          <Link href={collectionHref(collection.id)} className="eyebrow transition-colors hover:text-ink">
            {collection.label}
          </Link>
        )}
        <h1 className="mt-3 font-display text-[clamp(2.25rem,3.6vw,3.5rem)] leading-[1] font-bold tracking-[-0.025em]">
          {product.name}
        </h1>
        <p className="mt-3 text-[15px] text-mute">{product.subtitle}</p>
        <p className="mt-5 font-display text-[24px] leading-none font-semibold tabular-nums">{formatPrice(product.price)}</p>

        {items.length > 1 && (
          <div className="mt-7">
            <p className="eyebrow">
              Colour: <span className="text-ink">{product.color}</span>
            </p>
            <ColourLinks items={items} picked={product} className="mt-2" />
          </div>
        )}

        <p className="mt-7 max-w-[52ch] text-[16px] leading-relaxed text-ink-2">{product.description}</p>

        <div className="mt-8 flex gap-3">
          <div className="flex h-12 shrink-0 items-center rounded-full border border-line-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="grid size-12 place-items-center transition-opacity disabled:opacity-30"
            >
              <Minus aria-hidden className="size-3.5" />
            </button>
            <output aria-live="polite" aria-label="Quantity" className="w-6 text-center font-mono text-[14px] tabular-nums">
              {qty}
            </output>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              disabled={qty >= MAX_QTY}
              aria-label="Increase quantity"
              className="grid size-12 place-items-center transition-opacity disabled:opacity-30"
            >
              <Plus aria-hidden className="size-3.5" />
            </button>
          </div>
          <button type="button" onClick={addToCart} className={buttonClass("primary", "flex-1")}>
            {added ? <Check aria-hidden className="size-4" strokeWidth={2.25} /> : null}
            {added ? "Added" : "Add to cart"}
            <span className="text-paper/50">·</span>
            <span className="tabular-nums">{formatPrice(product.price * qty)}</span>
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to cart` : ""}
        </span>

        <ul className="mt-10 border-t border-line">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-3 border-b border-line py-3.5 text-[15px] leading-snug">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.25} />
              {h}
            </li>
          ))}
        </ul>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
          {product.specs.map((s) => (
            <div key={s.label}>
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-1 text-[15px]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** Colour picker on the product page: each colour is its own page, so the dots are links. */
function ColourLinks({ items, picked, className }: { items: Product[]; picked: Product; className?: string }) {
  return (
    <nav aria-label={`${picked.name} colours`} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((p) => {
        const on = p.id === picked.id;
        return (
          <Link
            key={p.id}
            href={productHref(p)}
            replace
            scroll={false}
            onClick={() => keepScrollFor(productHref(p))}
            aria-current={on ? "page" : undefined}
            aria-label={p.color}
            title={p.color}
            className={cn(
              "grid size-9 place-items-center rounded-full ring-1 transition-[box-shadow,transform] duration-300 ease-quint ring-inset active:scale-90",
              on ? "ring-ink" : "ring-transparent hover:ring-line-2",
            )}
          >
            <span
              className="size-6 rounded-full shadow-[inset_0_0_0_1px_rgb(21_20_19/0.14)]"
              style={{ background: swatchOf(p.tone) }}
            />
          </Link>
        );
      })}
    </nav>
  );
}
