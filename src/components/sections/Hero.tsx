"use client";

import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { GroupArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/primitives";
import { CHAT_LINK } from "@/lib/contact";
import { EASE } from "@/lib/motion";
import { COLLECTION_BY_ID, collectionHref, type Collection } from "@/lib/products";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Slide {
  collection: Collection;
  /** Display word + italic line either side of the group; together they name the collection. */
  left: [string, string];
  right: [string, string];
}

const slide = (id: Category, left: [string, string], right: [string, string]): Slide => {
  const collection = COLLECTION_BY_ID.get(id);
  if (!collection) throw new Error(`Unknown collection: ${id}`);
  return { collection, left, right };
};

// One slide per collection, in the client's order. Every claim here comes from lib/products.
const SLIDES: Slide[] = [
  slide("tea", ["Tea", "cups, saucers and teapots"], ["Wares", "in clear, heat-proof glass"]),
  slide("drink", ["Drink", "water, juice or lemonade"], ["Wares", "tumblers, carafes, coupes"]),
  slide("dinner", ["Dinner", "for the whole dawat"], ["Wares", "plates, bowls and full sets"]),
  slide("kettles", ["Chai", "starts with a whistle"], ["Kettles", "in steel and five colours"]),
  slide("flasks", ["Flasks", "chai hot for 12 hours"], ["Bottles", "in five colours"]),
];

const SLIDE_MS = 6500;

/**
 * Type sizes for a slide: as big as the clamps allow, but never wider than the column (a size container),
 * and the same on both sides so the two poster words share a baseline.
 */
const typeSizes = (s: Slide) => {
  const letters = Math.max(s.left[0].length, s.right[0].length);
  const chars = Math.max(s.left[1].length, s.right[1].length);
  return {
    word: { fontSize: `min(clamp(5rem, 8.6vw, 9.5rem), calc(100cqi / ${(letters * 0.68).toFixed(2)}))` },
    line: { fontSize: `min(clamp(1.375rem, 2.6vw, 2.5rem), calc(100cqi / ${(chars * 0.45).toFixed(2)}))` },
  };
};

const WORD: Variants = {
  enter: (d: number) => ({ y: d > 0 ? "104%" : "-104%" }),
  center: { y: "0%" },
  exit: (d: number) => ({ y: d > 0 ? "-104%" : "104%" }),
};

const GROUP: Variants = {
  enter: (d: number) => ({ x: `${d * 50}%`, rotate: d * 4, opacity: 0, scale: 0.92 }),
  center: { x: "0%", rotate: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: `${d * -50}%`, rotate: d * -4, opacity: 0, scale: 0.92 }),
};

/** Text that rolls through a mask when its key changes; direction follows the switcher.
 *  The mask clips vertically only, so long words can run wide without being cut. */
function Swap({
  k,
  dir,
  delay = 0,
  className,
  style,
  children,
}: {
  k: string;
  dir: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("relative block [clip-path:inset(0_-100vw_-0.2em)]", className)} style={style}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.span
          key={k}
          custom={dir}
          variants={WORD}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: EASE, delay }}
          className="block"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { isOpen } = useCart();

  const [{ index, dir }, setSlide] = useState({ index: 0, dir: 1 });
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inView = useInView(ref, { amount: 0.35 });
  // `reduce` is null on the server, so it only gates behaviour here, never markup.
  const playing = !reduce && !paused && !hover && !keyboardFocus && !dragging && inView && !isOpen;
  const s = SLIDES[index];
  const c = s.collection;
  const size = typeSizes(s);

  // Autoplay progress (0..1) drives the active dot and pauses mid-way instead of restarting.
  const progress = useMotionValue(0);
  const goTo = (next: number, d: number) => {
    progress.set(0);
    setSlide({ index: (next + SLIDES.length) % SLIDES.length, dir: d });
  };
  const go = (d: 1 | -1) => goTo(index + d, d);
  useAnimationFrame((_, delta) => {
    if (!playing) return;
    const p = progress.get() + delta / SLIDE_MS;
    if (p < 1) progress.set(p);
    else go(1);
  });

  // Pointer offset from centre (-0.5..0.5), spring-smoothed: tilt the stage, drift the type and watermark.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 70, damping: 18, mass: 0.7 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const wordsX = useTransform(sx, (v) => v * -22);
  const markX = useTransform(sx, (v) => v * 48);
  const markY = useTransform(sy, (v) => v * 20);

  // Drag the group sideways to switch; it leans into the drag.
  const dragX = useMotionValue(0);
  const lean = useTransform(dragX, [-240, 240], [-6, 6]);

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
  const holdOnMouse = (on: boolean) => (e: React.PointerEvent) => e.pointerType === "mouse" && setHover(on);

  return (
    <section
      id="top"
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Collections"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={(e) => e.target.matches(":focus-visible") && setKeyboardFocus(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKeyboardFocus(false)}
      className="relative isolate overflow-hidden bg-brand text-white [&_:focus-visible]:outline-white"
    >
      <h1 className="sr-only">
        KROMA: glass tea, drink and dinner wares, kettles, flasks and bottles, delivered across Pakistan
      </h1>

      {/* Brand watermark: the one decorative layer, drifting against the pointer. */}
      <motion.p
        aria-hidden
        style={{ x: markX, y: markY }}
        className="display pointer-events-none absolute top-[44%] left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-[36vw] leading-none whitespace-nowrap text-white/[0.07] select-none lg:top-1/2 lg:text-[31vw]"
      >
        KROMA
      </motion.p>

      <div className="shell flex min-h-[calc(100svh-4rem)] flex-col pt-6 pb-6 lg:min-h-[max(38rem,calc(100svh-4rem))] lg:pb-7">
        <div
          aria-live={playing ? "off" : "polite"}
          className="grid flex-1 grid-cols-1 content-center items-center [grid-template-areas:'left'_'stage'_'right'_'ctrl'] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:[grid-template-areas:'left_stage_right'_'._ctrl_.']"
        >
          <motion.div style={{ x: wordsX }} className="relative [container-type:inline-size] [grid-area:left] lg:pb-10">
            <Swap k={`${c.id}-l`} dir={dir} className="display" style={size.word}>
              {s.left[0]}
            </Swap>
            <Swap
              k={`${c.id}-li`}
              dir={dir}
              delay={0.08}
              className="mt-1 pr-[0.15em] font-serif leading-[1.2] tracking-[-0.01em] whitespace-nowrap italic"
              style={size.line}
            >
              {s.left[1]}
            </Swap>
          </motion.div>

          {/* Stage: drag or swipe to switch, tilts toward the cursor. */}
          <div
            className="relative z-10 -my-4 justify-self-center [grid-area:stage] [perspective:1400px] lg:my-0"
            onPointerEnter={holdOnMouse(true)}
            onPointerLeave={holdOnMouse(false)}
          >
            <motion.div
              drag="x"
              dragSnapToOrigin
              dragElastic={0.2}
              onDragStart={() => setDragging(true)}
              onDragEnd={(_, info) => {
                setDragging(false);
                const swipe = info.offset.x + info.velocity.x * 0.2;
                if (swipe < -70) go(1);
                else if (swipe > 70) go(-1);
              }}
              style={{ x: dragX, rotate: lean, rotateX, rotateY }}
              className="relative aspect-[13/10] w-[min(92vw,calc((100svh-25rem)*1.3),30rem)] cursor-grab active:cursor-grabbing lg:w-[min(40vw,calc((100svh-15rem)*1.3),46rem)]"
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={c.id}
                  custom={dir}
                  variants={GROUP}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
                  className="absolute inset-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${SLIDES.length}: ${c.label}`}
                >
                  <GroupArt collection={c.id} title={`${c.label}: ${c.tagline}`} className="pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            style={{ x: wordsX }}
            className="relative text-right [container-type:inline-size] [grid-area:right] lg:pb-10"
          >
            <Swap k={`${c.id}-r`} dir={dir} delay={0.05} className="display" style={size.word}>
              {s.right[0]}
            </Swap>
            <Swap
              k={`${c.id}-ri`}
              dir={dir}
              delay={0.12}
              className="mt-1 pr-[0.15em] font-serif leading-[1.2] tracking-[-0.01em] whitespace-nowrap italic"
              style={size.line}
            >
              {s.right[1]}
            </Swap>
            {/* On desktop the button hangs below the line, so both poster words sit on the same baseline. */}
            <div className="mt-6 flex justify-end lg:absolute lg:top-[calc(100%-2.5rem)] lg:right-0">
              <Link href={collectionHref(c.id)} className={buttonClass("inverse", "group h-11 shrink-0 px-5")}>
                Shop {c.label}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </motion.div>

          {/* Switcher controls */}
          <div
            className="mt-6 flex items-center justify-center gap-2 [grid-area:ctrl] lg:mt-2"
            onPointerEnter={holdOnMouse(true)}
            onPointerLeave={holdOnMouse(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
          >
            <CtrlButton label="Previous collection" onClick={() => go(-1)}>
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
            </CtrlButton>
            <div role="group" aria-label="Choose a collection" className="flex items-center">
              {SLIDES.map((sl, i) => (
                <Dot
                  key={sl.collection.id}
                  active={i === index}
                  label={`Show ${sl.collection.label}`}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  progress={progress}
                  full={paused}
                />
              ))}
            </div>
            <CtrlButton label="Next collection" onClick={() => go(1)}>
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </CtrlButton>
            <CtrlButton
              label={paused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setPaused((p) => !p)}
              quiet
              className="motion-reduce:hidden"
            >
              {paused ? (
                <Play aria-hidden className="size-3.5" fill="currentColor" strokeWidth={0} />
              ) : (
                <Pause aria-hidden className="size-3.5" fill="currentColor" strokeWidth={0} />
              )}
            </CtrlButton>
          </div>
        </div>

        {/* Floats over the bottom-right corner so it doesn't push the stage up. */}
        <div className="pointer-events-none relative hidden h-0 lg:block">
          <ChatBadge className="pointer-events-auto absolute right-0 bottom-0 grid" />
        </div>
      </div>
    </section>
  );
}

function CtrlButton({
  label,
  onClick,
  quiet,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  quiet?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,color,border-color,transform] duration-300 ease-quint active:scale-90",
        quiet ? "text-white/85 hover:text-white" : "border border-white/45 hover:border-white hover:bg-white hover:text-brand",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Dot({
  active,
  label,
  onClick,
  progress,
  full,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  progress: MotionValue<number>;
  full: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className="group grid h-11 place-items-center px-[5px]"
    >
      <span
        className={cn(
          "block h-1.5 overflow-hidden rounded-full bg-white/35 transition-[width,background-color] duration-500 ease-quint",
          active ? "w-9" : "w-1.5 group-hover:bg-white/70",
        )}
      >
        {active && (
          <motion.span
            className="block h-full origin-left rounded-full bg-white motion-reduce:![transform:none]"
            style={{ scaleX: full ? 1 : progress }}
          />
        )}
      </span>
    </button>
  );
}

/** Rotating "order on WhatsApp" badge: a real click-to-chat link. */
function ChatBadge({ className }: { className?: string }) {
  return (
    <a
      href={CHAT_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with KROMA on WhatsApp"
      className={cn("group relative size-[112px] place-items-center", className)}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full motion-safe:animate-spin-slow">
        <defs>
          <path id="chat-badge-ring" d="M50 50m-39 0a39 39 0 1 1 78 0a39 39 0 1 1 -78 0" />
        </defs>
        <text className="fill-white font-mono text-[8.6px] font-medium uppercase">
          <textPath href="#chat-badge-ring" textLength="244" lengthAdjust="spacing">
            Order on WhatsApp · Cash on delivery ·
          </textPath>
        </text>
      </svg>
      <span className="grid size-12 place-items-center rounded-full bg-white text-brand transition-transform duration-300 ease-quint group-hover:scale-110">
        <MessageCircle aria-hidden className="size-5" strokeWidth={2} />
      </span>
    </a>
  );
}
