"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GroupArt } from "@/components/art/ProductArt";
import { EASE } from "@/lib/motion";
import { COLLECTIONS, collectionHref } from "@/lib/products";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const CYCLE_MS = 4200;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Shop opener: the collections as panels that open up on hover. With `onPick`, a plain click shows that
 * collection's products further down this page instead of leaving it (ctrl/cmd-click still opens the
 * collection page in a new tab).
 */
export function ShopHero({ picked, onPick }: { picked?: Category | null; onPick?: (id: Category) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);

  const pickedIndex = picked ? COLLECTIONS.findIndex((c) => c.id === picked) : -1;
  // Slowly walks through the panels until someone points at or picks one.
  useEffect(() => {
    if (reduce || hold || !inView || pickedIndex >= 0) return;
    const t = setInterval(() => setActive((a) => (a + 1) % COLLECTIONS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce, hold, inView, pickedIndex]);

  const click = (id: Category) => (e: React.MouseEvent) => {
    if (!onPick || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onPick(id);
  };

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="shop-title"
      className="relative isolate overflow-hidden bg-brand text-white [&_:focus-visible]:outline-white"
    >
      <div className="shell flex flex-col pt-8 pb-10 lg:min-h-[max(40rem,calc(100svh-4rem))] lg:pt-10 lg:pb-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <motion.h1
            id="shop-title"
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <span className="display block text-[clamp(4rem,9vw,8.5rem)]">Order</span>
            <span className="mt-2 block font-serif text-[clamp(1.5rem,2.6vw,2.375rem)] leading-[1.15] tracking-[-0.01em] italic">
              select a collection to filter
            </span>
          </motion.h1>
        </div>

        {/* Desktop: panels share the row; the active one opens wide. */}
        <ul
          className="mt-10 hidden min-h-[22rem] flex-1 gap-2 lg:flex"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
          onPointerLeave={() => {
            setHold(false);
            if (pickedIndex >= 0) setActive(pickedIndex);
          }}
          onFocus={() => setHold(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHold(false)}
        >
          {COLLECTIONS.map((c, i) => {
            const on = i === active;
            return (
              <motion.li
                key={c.id}
                className="relative min-w-0 basis-0"
                initial={false}
                animate={{ flexGrow: on ? 3.3 : 1 }}
                transition={{ duration: 0.75, ease: EASE }}
              >
                <Link
                  href={collectionHref(c.id)}
                  onClick={click(c.id)}
                  aria-controls={onPick ? "shop-products" : undefined}
                  aria-current={picked === c.id ? "true" : undefined}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    "group absolute inset-0 overflow-hidden rounded-[4px] ring-1 transition-[background-color,box-shadow] duration-500 ring-inset",
                    on ? "bg-white/[0.1] ring-white/30" : "bg-white/[0.05] ring-white/15",
                    picked === c.id && "ring-2 ring-white",
                  )}
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute top-[9%] bottom-[25%] left-1/2 aspect-[640/500] -translate-x-1/2"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.82, scale: on ? 1 : 0.86 }}
                    transition={{ duration: 0.75, ease: EASE }}
                  >
                    <GroupArt collection={c.id} />
                  </motion.span>
                  <span className="absolute top-4 left-5 font-mono text-[11px] tracking-[0.06em] text-white/80 tabular-nums">
                    {pad(i + 1)}
                  </span>
                  <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block font-display text-[clamp(1.125rem,1.5vw,1.625rem)] leading-[1.05] font-bold tracking-[-0.02em] [text-wrap:balance]">
                        {c.label.replace("& ", "& ")}
                      </span>
                      <motion.span
                        className="mt-1.5 block truncate font-serif text-[17px] text-white/85 italic"
                        initial={false}
                        animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
                        transition={{ duration: 0.45, ease: EASE, delay: on ? 0.2 : 0 }}
                      >
                        {c.tagline}
                      </motion.span>
                    </span>
                    <motion.span
                      aria-hidden
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
                      transition={{ duration: 0.4, ease: EASE, delay: on ? 0.15 : 0 }}
                    >
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </motion.span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Phones and tablets: compact tiles, all three on screen at once. */}
        <ul className="mt-8 grid gap-3 sm:grid-cols-3 lg:hidden">
          {COLLECTIONS.map((c, i) => (
            <li key={c.id}>
              <Link
                href={collectionHref(c.id)}
                onClick={click(c.id)}
                aria-controls={onPick ? "shop-products" : undefined}
                aria-current={picked === c.id ? "true" : undefined}
                className={cn(
                  "relative flex h-32 items-center overflow-hidden rounded-[10px] ring-inset transition-[background-color,box-shadow] duration-300 sm:h-auto sm:aspect-[4/5] sm:flex-col sm:items-stretch",
                  picked === c.id ? "bg-white/[0.16] ring-2 ring-white" : "bg-white/[0.08] ring-1 ring-white/20",
                )}
              >
                <span className="relative z-10 min-w-0 flex-1 px-4 sm:absolute sm:inset-x-4 sm:bottom-4 sm:px-0">
                  <span className="block font-mono text-[11px] tracking-[0.06em] text-white/80 tabular-nums">{pad(i + 1)}</span>
                  <span className="mt-1 block font-display text-[21px] leading-tight font-bold tracking-[-0.02em]">{c.label}</span>
                  <span className="mt-0.5 block font-serif text-[15px] text-white/85 italic">{c.tagline}</span>
                </span>
                <span aria-hidden className="relative h-full w-[46%] shrink-0 py-3 pr-3 sm:absolute sm:inset-x-[4%] sm:top-[10%] sm:bottom-[30%] sm:h-auto sm:w-auto sm:p-0">
                  <GroupArt collection={c.id} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
