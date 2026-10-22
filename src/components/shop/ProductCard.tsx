"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/cart";
import { EASE } from "@/lib/motion";
import type { Product } from "@/lib/types";

/** Shows a brief "Added" confirmation after add(); shared with the hero and lookbook. */
export function useAddFeedback(ms = 1600) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), ms);
    return () => clearTimeout(t);
  }, [added, ms]);
  return [added, () => setAdded(true)] as const;
}

const PILL = "h-10 rounded-full font-display text-[11.5px] font-semibold tracking-[0.06em] uppercase";

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView: () => void }) {
  const { add } = useCart();
  const [added, flagAdded] = useAddFeedback();

  const addToCart = () => {
    add(product.id);
    flagAdded();
  };

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-paper-2">
        <button
          type="button"
          onClick={onQuickView}
          aria-label={`Details: ${product.name}`}
          className="absolute inset-0 rounded-[4px] outline-offset-[-2px]"
        >
          <span className="absolute inset-[6%] transition-[opacity,scale] duration-700 ease-quint group-hover:scale-[0.97] group-hover:opacity-0">
            <ProductArt kind={product.kind} tone={product.tone} fit />
          </span>
          <span className="absolute inset-[6%] scale-[1.03] opacity-0 transition-[opacity,scale] duration-700 ease-quint group-hover:scale-100 group-hover:opacity-100">
            <ProductArt kind={product.kind} tone={product.tone} view="alt" fit />
          </span>
        </button>

        {/* Hover actions on pointer devices; always-on add button on touch. */}
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-2 transition-[translate,opacity] duration-500 ease-quint max-[64rem]:hidden [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          <button
            type="button"
            onClick={onQuickView}
            className={`${PILL} border border-line-2 bg-paper/95 transition-colors duration-300 hover:border-ink`}
          >
            Details
          </button>
          <AddButton added={added} onClick={addToCart} name={product.name} />
        </div>
        <button
          type="button"
          onClick={addToCart}
          aria-label={`Add ${product.name} to cart`}
          className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-ink text-paper active:scale-95 min-[64rem]:hidden"
        >
          <SwapIcon added={added} />
        </button>
      </div>

      {/* Announced from here so it works for both the hover pill and the touch button. */}
      <span className="sr-only" aria-live="polite">
        {added ? `${product.name} added to cart` : ""}
      </span>

      <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-[15px] leading-snug font-medium">{product.name}</h3>
          <p className="mt-1 text-[13px] leading-snug text-mute">{product.subtitle}</p>
        </div>
        <p className="shrink-0 font-display text-[15px] leading-snug font-semibold tabular-nums">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}

function AddButton({ added, onClick, name }: { added: boolean; onClick: () => void; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${name} to cart`}
      className={`${PILL} relative overflow-hidden bg-ink text-paper transition-colors duration-300 hover:bg-ink-2`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={added ? "added" : "add"}
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "-120%" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center gap-1.5"
        >
          {added ? <Check aria-hidden className="size-3.5" strokeWidth={2.25} /> : null}
          {added ? "Added" : "Add to cart"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function SwapIcon({ added }: { added: boolean }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={added ? "y" : "n"}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {added ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      </motion.span>
    </AnimatePresence>
  );
}
