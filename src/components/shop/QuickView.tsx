"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/primitives";
import { formatPrice, MAX_QTY } from "@/lib/cart";
import { CATEGORIES } from "@/lib/products";
import { EASE } from "@/lib/motion";
import type { ArtView, Product } from "@/lib/types";

const VIEWS: { id: ArtView; label: string }[] = [
  { id: "front", label: "View 1" },
  { id: "alt", label: "View 2" },
];

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={product ? `${product.name} details` : "Product details"} className="max-w-[560px]">
      {/* Keyed so view and quantity reset per product. */}
      {product && <Details key={product.id} product={product} onClose={onClose} />}
    </Sheet>
  );
}

function Details({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add, openCart } = useCart();
  const [view, setView] = useState<ArtView>("front");
  const [qty, setQty] = useState(1);
  const category = CATEGORIES.find((c) => c.id === product.category)?.label;

  const addToCart = () => {
    add(product.id, qty);
    onClose();
    // Let the details panel slide out before the cart slides in.
    setTimeout(openCart, 280);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
        <p className="eyebrow">{category}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-2 grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <X aria-hidden className="size-5" strokeWidth={1.75} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-[5/4] bg-paper-2">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={view}
              className="absolute inset-[6%]"
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
                className="relative h-8 rounded-full px-3.5 font-mono text-[10.5px] font-medium tracking-[0.06em] uppercase transition-colors not-aria-pressed:text-mute hover:text-ink aria-pressed:text-paper"
              >
                {view === v.id && (
                  <motion.span layoutId="qv-view" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.4, ease: EASE }} />
                )}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pt-8 pb-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.02em]">{product.name}</h2>
              <p className="mt-2 text-[14px] text-mute">{product.subtitle}</p>
            </div>
            <p className="pt-1.5 font-display text-[19px] font-semibold tabular-nums">{formatPrice(product.price)}</p>
          </div>

          <p className="mt-6 text-[15px] leading-[1.7] text-ink-2">{product.description}</p>

          <ul className="mt-8 border-t border-line">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-3 border-b border-line py-3.5 text-[14px] leading-snug">
                <Check aria-hidden className="mt-px size-4 shrink-0 text-brand" strokeWidth={2.25} />
                {h}
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
            {product.specs.map((s) => (
              <div key={s.label}>
                <dt className="eyebrow">{s.label}</dt>
                <dd className="mt-1 text-[14px]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <footer className="flex shrink-0 gap-3 border-t border-line bg-paper p-4 sm:p-6">
        <div className="flex h-12 items-center rounded-full border border-line-2">
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
          Add to cart
          <span className="text-paper/50">·</span>
          <span className="tabular-nums">{formatPrice(product.price * qty)}</span>
        </button>
      </footer>
    </>
  );
}
