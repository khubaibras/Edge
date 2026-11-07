"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { GroupArt } from "@/components/art/ProductArt";
import { COLLECTION_BY_ID } from "@/lib/products";
import type { Category } from "@/lib/types";

/**
 * A collection page's opener in the home hero's style: cobalt poster, the collection's group shot in the
 * middle, and its name as a large watermark behind. No other text; the page heading is for screen readers.
 */
export function CollectionHero({
  collection,
  mark,
}: {
  collection: Category;
  mark: string;
}) {
  const c = COLLECTION_BY_ID.get(collection);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Pointer offset from centre (-0.5..0.5), spring-smoothed: tilt the group, drift the watermark.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 70, damping: 18, mass: 0.7 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const markX = useTransform(sx, (v) => v * 48);
  const markY = useTransform(sy, (v) => v * 20);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };
  // Slides to whatever section follows the hero.
  const scrollOn = () =>
    ref.current?.nextElementSibling?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <section
      ref={ref}
      aria-labelledby="collection-title"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate overflow-hidden bg-brand text-white"
    >
      <h1 id="collection-title" className="sr-only">
        {c?.label}: {c?.tagline}
      </h1>

      <motion.p
        aria-hidden
        style={{ x: markX, y: markY }}
        className="display pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-center text-[19vw] leading-[2.9] whitespace-nowrap text-white/[0.07] uppercase select-none lg:text-[11.5vw] lg:leading-none"
      >
        {/* Phones put one word above the group and one below; desktop runs them on one line like the home watermark. */}
        {mark.split(" ").map((w, i) => (
          <span key={i} className="block lg:inline">
            {i > 0 && <span className="hidden lg:inline"> </span>}
            {w}
          </span>
        ))}
      </motion.p>

      <div className="shell grid min-h-[min(calc(100svh-8rem),34rem)] place-items-center py-10 lg:min-h-[max(34rem,calc(100svh-4rem))]">
        <div className="[perspective:1400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 20,
              mass: 0.9,
            }}
            style={{ rotateX, rotateY }}
            className="aspect-[13/10] w-[min(92vw,calc((100svh-12rem)*1.3),34rem)] lg:w-[min(48vw,calc((100svh-12rem)*1.3),52rem)]"
          >
            <GroupArt
              collection={collection}
              title={`${c?.label}: ${c?.tagline}`}
              className="pointer-events-none"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll cue: the hero has no text, so show there is more below. */}
      <button
        type="button"
        onClick={scrollOn}
        className="group absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full px-3 py-1 text-white/80 transition-colors duration-300 hover:text-white lg:bottom-7"
      >
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase">Scroll to explore</span>
        <span className="grid size-10 place-items-center rounded-full ring-1 ring-white/40 transition-colors duration-300 group-hover:bg-white group-hover:text-brand">
          <motion.span
            animate={reduce ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown aria-hidden className="size-4" strokeWidth={2} />
          </motion.span>
        </span>
      </button>
    </section>
  );
}
