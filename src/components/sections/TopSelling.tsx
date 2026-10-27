"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Reveal } from "@/components/ui/primitives";
import { COLLECTION_BY_ID, productHref, TOP_SELLING } from "@/lib/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TopSelling() {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  // Scrollbar thumb: its width is the visible share of the row, its position the scroll progress.
  const share = useMotionValue(0.4);
  const pos = useMotionValue(0);
  const smooth = useSpring(pos, { stiffness: 260, damping: 34 });
  const left = useTransform([smooth, share], ([p, s]: number[]) => `${p * (1 - s) * 100}%`);
  const width = useTransform(share, (s) => `${s * 100}%`);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      share.set(Math.min(1, el.clientWidth / el.scrollWidth));
      pos.set(max > 0 ? el.scrollLeft / max : 0);
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft > max - 4 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [share, pos]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16) * 2, behavior: "smooth" });
  };

  return (
    <section id="top-selling" aria-labelledby="top-selling-title" className="border-y border-line bg-paper-2 py-20 sm:py-24">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <h2 id="top-selling-title">
            <span className="display block text-[clamp(3.25rem,6.4vw,6rem)]">Top Selling</span>
            <span className="mt-2 block font-serif text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
              what people order most
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="group mr-2 inline-flex items-center gap-2 font-display text-[12.5px] font-semibold tracking-[0.06em] text-brand uppercase"
            >
              View full catalog
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <PageButton label="Scroll back" disabled={edges.start} onClick={() => page(-1)}>
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
            </PageButton>
            <PageButton label="Scroll forward" disabled={edges.end} onClick={() => page(1)}>
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </PageButton>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ul
            ref={track}
            aria-label="Top selling products"
            className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-12 lg:mt-12 lg:scroll-px-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
          >
            {TOP_SELLING.map((p, i) => (
              <li key={p.id} className="w-[min(72vw,17rem)] shrink-0 snap-start sm:w-[17rem]">
                <TopCard product={p} rank={i + 1} />
              </li>
            ))}
          </ul>
          <div aria-hidden className="relative mt-8 h-[3px] overflow-hidden rounded-full bg-line-2">
            <motion.div className="absolute inset-y-0 rounded-full bg-ink" style={{ left, width }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TopCard({ product: p, rank }: { product: Product; rank: number }) {
  const collection = COLLECTION_BY_ID.get(p.category)?.label;
  return (
    <Link
      href={productHref(p)}
      className="group block overflow-hidden rounded-[4px] border border-line bg-paper transition-[border-color,box-shadow] duration-500 ease-quint hover:border-line-2 hover:shadow-soft"
    >
      <div className="relative aspect-square">
        <span className="absolute inset-[7%] transition-[opacity,scale] duration-700 ease-quint group-hover:scale-[0.97] group-hover:opacity-0">
          <ProductArt kind={p.kind} tone={p.tone} fit title={p.name} />
        </span>
        <span className="absolute inset-[7%] scale-[1.03] opacity-0 transition-[opacity,scale] duration-700 ease-quint group-hover:scale-100 group-hover:opacity-100">
          <ProductArt kind={p.kind} tone={p.tone} view="alt" fit />
        </span>
        <span className="eyebrow absolute top-3 left-3 tabular-nums">{String(rank).padStart(2, "0")}</span>
      </div>
      <div className="border-t border-line px-4 pt-3.5 pb-4">
        <h3 className="truncate text-[15px] leading-snug font-medium">{p.name}</h3>
        <p className="mt-0.5 truncate text-[13px] leading-snug text-mute">
          {collection}
          {p.color ? ` · ${p.color}` : ""}
        </p>
      </div>
    </Link>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "hidden size-11 place-items-center rounded-full border border-line-2 text-ink transition-[background-color,color,border-color,opacity,transform] duration-300 ease-quint hover:border-ink hover:bg-ink hover:text-paper active:scale-90 disabled:pointer-events-none disabled:opacity-35 sm:grid",
      )}
    >
      {children}
    </button>
  );
}
