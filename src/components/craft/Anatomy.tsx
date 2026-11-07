"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { buttonClass } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/cart";
import { EASE } from "@/lib/motion";
import { PRODUCT_BY_ID, productHref } from "@/lib/products";
import { cn } from "@/lib/utils";
import { STUDIES } from "./data";
import { GlassSection, VIEW_H, VIEW_W } from "./drawings";

const STUDY_PRODUCTS = STUDIES.map((s) => {
  const p = PRODUCT_BY_ID.get(s.productId);
  if (!p) throw new Error(`Unknown product: ${s.productId}`);
  return p;
});

/** Tabbed cutaway drawings with numbered hotspots that isolate each part. */
export function Anatomy({ className }: { className?: string }) {
  const uid = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [studyIndex, setStudyIndex] = useState(0);
  const [activeId, setActiveId] = useState(STUDIES[0].features[0].id);
  const study = STUDIES[studyIndex];
  const product = STUDY_PRODUCTS[studyIndex];
  const active = study.features.find((f) => f.id === activeId) ?? study.features[0];

  const selectStudy = (i: number) => {
    setStudyIndex(i);
    setActiveId(STUDIES[i].features[0].id);
  };
  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (studyIndex + (e.key === "ArrowRight" ? 1 : -1) + STUDIES.length) % STUDIES.length;
    selectStudy(next);
    document.getElementById(`${uid}-tab-${STUDIES[next].id}`)?.focus();
  };
  // Hover previews on mouse only; touch relies on tap so it doesn't fight scrolling.
  const hover = (id: string) => (e: React.PointerEvent) => e.pointerType === "mouse" && setActiveId(id);

  return (
    <div className={className}>
      <div role="tablist" aria-label="Choose a product" className="flex gap-2" onKeyDown={onTabKey}>
        {STUDIES.map((s, i) => {
          const selected = i === studyIndex;
          return (
            <button
              key={s.id}
              id={`${uid}-tab-${s.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectStudy(i)}
              className={cn(
                "relative h-10 rounded-full border px-4 font-display text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300",
                selected ? "border-ink text-paper" : "border-line-2 text-ink hover:border-ink",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-tab`}
                  className="absolute -inset-px rounded-full bg-ink"
                  transition={{ duration: 0.45, ease: EASE }}
                />
              )}
              <span className="relative">{STUDY_PRODUCTS[i].name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={study.id}
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${study.id}`}
          className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {/* Drawing */}
          <figure className="relative rounded-[4px] bg-paper-2 px-3 pt-14 pb-5 sm:px-8 sm:pb-12 lg:col-span-7">
            <figcaption className="eyebrow absolute top-5 left-5 sm:top-6 sm:left-6">{study.caption}</figcaption>
            {/* Capped on phones so the drawing and the active part's text fit on one screen. */}
            <div className="relative mx-auto aspect-[420/560] w-full max-w-[280px] sm:max-w-[480px]">
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="absolute inset-0 size-full overflow-visible [&_:is(path,line)]:[vector-effect:non-scaling-stroke]"
                aria-hidden
              >
                <GlassSection active={active.id} uid={uid} />
                {study.features.map((f) => {
                  const [tx, ty] = f.target;
                  const [cx, cy] = f.callout;
                  const dir = cx > tx ? -1 : 1;
                  const on = f.id === active.id;
                  return (
                    <motion.g key={f.id} initial={false} animate={{ opacity: on ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
                      <path
                        d={`M${tx} ${ty}L${cx + dir * 40} ${cy}L${cx + dir * 15} ${cy}`}
                        fill="none"
                        stroke={on ? "#2341d6" : "#151413"}
                        strokeWidth={on ? 1.25 : 0.75}
                      />
                      <circle cx={tx} cy={ty} r="2.5" fill={on ? "#2341d6" : "#151413"} />
                    </motion.g>
                  );
                })}
              </svg>
              {study.features.map((f, i) => {
                const on = f.id === active.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-label={`${i + 1}: ${f.title}`}
                    aria-pressed={on}
                    onClick={() => setActiveId(f.id)}
                    onFocus={() => setActiveId(f.id)}
                    onPointerEnter={hover(f.id)}
                    style={{ left: `${(f.callout[0] / VIEW_W) * 100}%`, top: `${(f.callout[1] / VIEW_H) * 100}%` }}
                    className={cn(
                      "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-[12px] font-medium tabular-nums transition-[background-color,color,border-color,transform] duration-300 ease-quint before:absolute before:-inset-2 active:scale-95",
                      on ? "scale-110 border-brand bg-brand text-white" : "border-line-2 bg-paper text-ink hover:border-ink",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 px-2 sm:absolute sm:bottom-5 sm:left-6 sm:mt-0 sm:px-0">
              {study.legend.map((l) => (
                <li key={l.label} className="eyebrow flex items-center gap-2">
                  <span className="size-2.5 rounded-full border border-line-2" style={{ background: l.swatch }} />
                  {l.label}
                </li>
              ))}
            </ul>
          </figure>

          {/* Detail, index and the product itself */}
          <div className="flex flex-col lg:col-span-5 lg:pt-2">
            {/* Every detail shares one grid cell, so the tallest sets the height: no layout shift. */}
            <div className="grid" aria-live="polite">
              {study.features.map((f, i) => {
                const on = f.id === active.id;
                return (
                  <div
                    key={f.id}
                    aria-hidden={!on}
                    className={cn(
                      "[grid-area:1/1] transition-[opacity,transform,visibility] duration-500 ease-quint",
                      on ? "visible opacity-100" : "invisible translate-y-2 opacity-0",
                    )}
                  >
                    <p className="eyebrow">
                      <span className="text-brand">{i + 1}</span> of {study.features.length}
                    </p>
                    <h3 className="mt-4 font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.05] font-bold tracking-[-0.02em]">
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-2">{f.body}</p>
                  </div>
                );
              })}
            </div>

            <ol className="mt-8 border-t border-line">
              {study.features.map((f, i) => {
                const on = f.id === active.id;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActiveId(f.id)}
                      onFocus={() => setActiveId(f.id)}
                      onPointerEnter={hover(f.id)}
                      className="group flex w-full items-center gap-4 border-b border-line py-3.5 text-left"
                    >
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px] tabular-nums transition-colors duration-300",
                          on ? "bg-brand text-white" : "bg-paper-2 text-mute",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className={cn("flex-1 text-[15px] transition-colors duration-300", on ? "text-ink" : "text-mute group-hover:text-ink")}>
                        {f.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 rounded-[4px] border border-line p-5 lg:mt-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium">{product.name}</p>
                  <p className="mt-0.5 text-[13px] text-mute">{product.subtitle}</p>
                </div>
                <p className="font-display text-[17px] font-semibold tabular-nums">{formatPrice(product.price)}</p>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
                {product.specs.slice(0, 4).map((s) => (
                  <div key={s.label}>
                    <dt className="eyebrow">{s.label}</dt>
                    <dd className="mt-0.5 text-[14px]">{s.value}</dd>
                  </div>
                ))}
              </dl>
              {/* Ordering happens in the shop; this opens the product there. */}
              <Link href={productHref(product)} className={buttonClass("primary", "group mt-5 w-full")}>
                View in shop
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
