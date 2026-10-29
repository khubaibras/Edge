"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GroupArt } from "@/components/art/ProductArt";
import { EASE } from "@/lib/motion";
import { COLLECTIONS, collectionHref } from "@/lib/products";
import { cn } from "@/lib/utils";

const CYCLE_MS = 4200;
const pad = (n: number) => String(n).padStart(2, "0");

/** Shop opener: the five collections as panels that open up on hover; each opens its collection page. */
export function ShopHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);

  // Slowly walks through the panels until someone points at one.
  useEffect(() => {
    if (reduce || hold || !inView) return;
    const t = setInterval(() => setActive((a) => (a + 1) % COLLECTIONS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce, hold, inView]);

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
              pick a collection to start
            </span>
          </motion.h1>
          <motion.div
            className="lg:col-span-5 lg:max-w-[26rem] lg:justify-self-end lg:pb-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          >
            <p className="text-[16px] leading-relaxed text-white/85">
              Pick a collection to see everything in it, add what you like to your cart and check out when you&apos;re
              ready.
            </p>
          </motion.div>
        </div>

        {/* Desktop: panels share the row; the active one opens wide. */}
        <ul
          className="mt-10 hidden min-h-[22rem] flex-1 gap-2 lg:flex"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
          onPointerLeave={() => setHold(false)}
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
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn(
                    "group absolute inset-0 overflow-hidden rounded-[4px] ring-1 transition-[background-color,box-shadow] duration-500 ring-inset",
                    on ? "bg-white/[0.1] ring-white/30" : "bg-white/[0.05] ring-white/15",
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

        {/* Phones and tablets: a swipeable row of the same panels. */}
        <ul className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
          {COLLECTIONS.map((c, i) => (
            <li key={c.id} className="w-[min(78vw,20rem)] shrink-0 snap-start">
              <Link
                href={collectionHref(c.id)}
                className="relative block aspect-[4/5] overflow-hidden rounded-[4px] bg-white/[0.08] ring-1 ring-white/20 ring-inset"
              >
                <span aria-hidden className="absolute inset-x-[4%] top-[12%] bottom-[24%]">
                  <GroupArt collection={c.id} />
                </span>
                <span className="absolute top-4 left-4 font-mono text-[11px] tracking-[0.06em] text-white/80 tabular-nums">
                  {pad(i + 1)}
                </span>
                <span className="absolute inset-x-4 bottom-4">
                  <span className="block font-display text-[24px] leading-tight font-bold tracking-[-0.02em]">{c.label.replace("& ", "& ")}</span>
                  <span className="mt-0.5 block font-serif text-[17px] text-white/85 italic">{c.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
