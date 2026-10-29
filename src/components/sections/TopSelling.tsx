"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductArt } from "@/components/art/ProductArt";
import { Reveal } from "@/components/ui/primitives";
import { COLLECTION_BY_ID, productHref, TOP_SELLING } from "@/lib/products";
import type { Product } from "@/lib/types";

export function TopSelling() {
  return (
    <section id="top-selling" aria-labelledby="top-selling-title" className="border-y border-line bg-paper-2 py-20 sm:py-24">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <h2 id="top-selling-title">
            <span className="display block text-[clamp(3rem,6.4vw,6rem)]">Top Selling</span>
            <span className="mt-2 block font-serif text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
              what people order most
            </span>
          </h2>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.06em] text-brand uppercase"
          >
            View full catalog
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </Reveal>

        {/* Endless row: two copies slide left together, so the second takes over seamlessly.
            Pointing at it or tabbing into it holds it still. */}
        <Reveal delay={0.08} className="group/marquee -mx-5 mt-10 overflow-hidden sm:-mx-8 lg:-mx-12 lg:mt-12 motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
          <div className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-label={copy ? undefined : "Top selling products"}
                aria-hidden={copy ? true : undefined}
                inert={copy === 1}
                className="flex shrink-0 gap-4 pr-4 motion-reduce:last:hidden"
              >
                {TOP_SELLING.map((p, i) => (
                  <li key={p.id} className="w-[min(72vw,17rem)] shrink-0 sm:w-[17rem]">
                    <TopCard product={p} rank={i + 1} />
                  </li>
                ))}
              </ul>
            ))}
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
