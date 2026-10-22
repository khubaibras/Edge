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
import { ArrowLeft, ArrowRight, Check, MessageCircle, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { useAddFeedback } from "@/components/shop/ProductCard";
import { useShopFilter } from "@/components/shop/ShopFilter";
import { buttonClass } from "@/components/ui/primitives";
import { FREE_SHIPPING_FROM, formatPrice } from "@/lib/cart";
import { CHAT_LINK } from "@/lib/contact";
import { EASE } from "@/lib/motion";
import { CATEGORIES, PRODUCT_BY_ID, PRODUCTS } from "@/lib/products";
import type { ArtView, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Slide {
  product: Product;
  view: ArtView;
  /** Optical size on the stage: the fit crop enlarges squat pieces, so pull them back toward the flask's mass. */
  scale?: number;
  /** Display word + italic line either side of the product; together they read as one phrase. */
  left: [string, string];
  right: [string, string];
  note: string;
}

const slide = (id: string, s: Omit<Slide, "product">): Slide => {
  const product = PRODUCT_BY_ID.get(id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return { product, ...s };
};

// Every claim here comes from lib/products.
const SLIDES: Slide[] = [
  slide("thermal-flask-750", {
    view: "front",
    left: ["Hot", "chai for 12 hours"],
    right: ["Cold", "water for 24 hours"],
    note: "Double-wall vacuum steel with a leak-proof screw cap. The outside never sweats.",
  }),
  slide("glass-mug", {
    view: "alt",
    scale: 0.8,
    left: ["Doodh", "in a clear glass mug"],
    right: ["Patti", "takes boiling water"],
    note: "Borosilicate glass with a thick handle that stays cool. Microwave and dishwasher safe.",
  }),
  slide("rib-tumbler", {
    view: "front",
    scale: 0.88,
    left: ["Juice", "water or iced coffee"],
    right: ["Glass", "ribbed for a sure grip"],
    note: "Borosilicate glass for hot and cold drinks, with a thick, steady base. Dishwasher safe.",
  }),
  slide("glass-serving-bowl", {
    view: "front",
    scale: 0.78,
    left: ["Raita", "salad or fruit"],
    right: ["Bowl", "wide, clear, 1.4 litres"],
    note: "Thick-walled tempered glass, steady enough to pass around the table. Microwave safe.",
  }),
  slide("commuter-bottle", {
    view: "front",
    left: ["Slim", "420 ml, insulated"],
    right: ["Light", "260 g, with a carry loop"],
    note: "Cold for 18 hours, hot for 8. The wide mouth takes ice cubes and is easy to clean.",
  }),
  slide("tea-cup-saucer", {
    view: "alt",
    scale: 0.8,
    left: ["Green", "tea, or chai"],
    right: ["Tea", "see the colour of the brew"],
    note: "Clear borosilicate cups and saucers with a comfortable handle. Dishwasher safe.",
  }),
];

const SLIDE_MS = 6500;

const SHOP_BY = CATEGORIES.flatMap((c) => {
  const items = PRODUCTS.filter((p) => p.category === c.id);
  return items.length
    ? [{ id: c.id, label: c.label, count: items.length, from: Math.min(...items.map((p) => p.price)) }]
    : [];
});

const WORD: Variants = {
  enter: (d: number) => ({ y: d > 0 ? "104%" : "-104%" }),
  center: { y: "0%" },
  exit: (d: number) => ({ y: d > 0 ? "-104%" : "104%" }),
};

const PRODUCT: Variants = {
  enter: (d: number) => ({ x: `${d * 60}%`, rotate: d * 9, opacity: 0, scale: 0.9 }),
  center: { x: "0%", rotate: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: `${d * -60}%`, rotate: d * -9, opacity: 0, scale: 0.9 }),
};

/** Text that rolls through a mask when its key changes; direction follows the switcher.
 *  The mask clips vertically only, so long words can run wide without being cut. */
function Swap({
  k,
  dir,
  delay = 0,
  className,
  children,
}: {
  k: string;
  dir: number;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("relative block [clip-path:inset(0_-100vw_-0.2em)]", className)}>
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
  const { add, isOpen } = useCart();
  const { setFilter } = useShopFilter();
  const [added, flagAdded] = useAddFeedback();

  const [{ index, dir }, setSlide] = useState({ index: 0, dir: 1 });
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inView = useInView(ref, { amount: 0.35 });
  // `reduce` is null on the server, so it only gates behaviour here, never markup.
  const playing = !reduce && !paused && !hover && !keyboardFocus && !dragging && inView && !isOpen;
  const s = SLIDES[index];

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
  const rotateY = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);
  const wordsX = useTransform(sx, (v) => v * -22);
  const markX = useTransform(sx, (v) => v * 48);
  const markY = useTransform(sy, (v) => v * 20);

  // Drag the product sideways to switch; it leans into the drag.
  const dragX = useMotionValue(0);
  const lean = useTransform(dragX, [-240, 240], [-10, 10]);

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

  const addToCart = () => {
    add(s.product.id);
    flagAdded();
  };

  return (
    <section
      id="top"
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Featured products"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={(e) => e.target.matches(":focus-visible") && setKeyboardFocus(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKeyboardFocus(false)}
      className="relative isolate overflow-hidden bg-brand text-white [&_:focus-visible]:outline-white"
    >
      <h1 className="sr-only">KROMA: insulated steel flasks and glass tableware, delivered across Pakistan</h1>

      {/* Brand watermark: the one decorative layer, drifting against the pointer. */}
      <motion.p
        aria-hidden
        style={{ x: markX, y: markY }}
        className="display pointer-events-none absolute top-[44%] left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-[36vw] leading-none whitespace-nowrap text-white/[0.07] select-none lg:top-1/2 lg:text-[31vw]"
      >
        KROMA
      </motion.p>

      <div className="shell flex min-h-[calc(100svh-4rem)] flex-col pt-4 pb-6 lg:min-h-[max(40rem,calc(100svh-4rem))] lg:pt-6 lg:pb-7">
        <div className="flex items-start justify-between gap-4">
          <p className="hidden font-mono text-[11px] leading-4 tracking-[0.06em] text-white/85 uppercase sm:block">
            <span className="tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <span className="mx-2">—</span>
            {CATEGORIES.find((c) => c.id === s.product.category)?.label}
          </p>
          <p className="ml-auto rounded-full border border-white/40 px-3 py-1.5 font-mono text-[10.5px] leading-none font-medium tracking-[0.06em] uppercase">
            Free delivery from {formatPrice(FREE_SHIPPING_FROM)} · Cash on delivery
          </p>
        </div>

        <div
          aria-live={playing ? "off" : "polite"}
          className="grid flex-1 grid-cols-1 content-center items-center [grid-template-areas:'left'_'stage'_'right'_'ctrl'] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:[grid-template-areas:'left_stage_right'_'._ctrl_.']"
        >
          <motion.div style={{ x: wordsX }} className="relative [grid-area:left] lg:pb-10">
            <Swap k={`${s.product.id}-l`} dir={dir} className="display text-[clamp(5rem,8.6vw,9.5rem)]">
              {s.left[0]}
            </Swap>
            <Swap
              k={`${s.product.id}-li`}
              dir={dir}
              delay={0.08}
              className="mt-1 pr-[0.15em] font-serif text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] tracking-[-0.01em] italic"
            >
              {s.left[1]}
            </Swap>
            <Swap k={`${s.product.id}-n`} dir={dir} delay={0.14} className="mt-5 hidden max-w-[36ch] lg:block">
              <span className="block font-mono text-[12px] leading-[1.65] text-white/85">{s.note}</span>
            </Swap>
          </motion.div>

          {/* Stage: drag or swipe to switch, tilts toward the cursor. */}
          <div
            className="relative z-10 -my-8 justify-self-center [grid-area:stage] [perspective:1200px] lg:my-0"
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
              className="relative aspect-[4/5] w-[min(66vw,calc((100svh-29rem)*0.8),21rem)] cursor-grab active:cursor-grabbing lg:w-[min(31vw,calc((100svh-19rem)*0.8),30rem)]"
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={s.product.id}
                  custom={dir}
                  variants={PRODUCT}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
                  className="absolute inset-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${SLIDES.length}: ${s.product.name}`}
                >
                  <div className="size-full origin-[50%_84%]" style={{ transform: `scale(${s.scale ?? 1})` }}>
                    <ProductArt
                      kind={s.product.kind}
                      tone={s.product.tone}
                      view={s.view}
                      fit
                      title={`${s.product.name}, ${s.product.subtitle}`}
                      className="pointer-events-none"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div style={{ x: wordsX }} className="relative text-right [grid-area:right] lg:pb-10">
            <Swap k={`${s.product.id}-r`} dir={dir} delay={0.05} className="display text-[clamp(5rem,8.6vw,9.5rem)]">
              {s.right[0]}
            </Swap>
            <Swap
              k={`${s.product.id}-ri`}
              dir={dir}
              delay={0.12}
              className="mt-1 pr-[0.15em] font-serif text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.2] tracking-[-0.01em] italic"
            >
              {s.right[1]}
            </Swap>
            <div className="mt-5 flex items-center justify-between gap-4 text-left lg:justify-end lg:text-right">
              <Swap k={`${s.product.id}-p`} dir={dir} delay={0.16} className="min-w-0">
                <span className="block truncate font-mono text-[11px] leading-4 tracking-[0.04em] text-white/85 uppercase">
                  {s.product.name}
                </span>
                <span className="mt-1 block font-display text-[24px] leading-7 font-bold tabular-nums">
                  {formatPrice(s.product.price)}
                </span>
              </Swap>
              <button
                type="button"
                onClick={addToCart}
                aria-label={`Add ${s.product.name} to cart`}
                className={buttonClass("inverse", "h-11 shrink-0 px-5")}
              >
                {added ? <Check aria-hidden className="size-4" strokeWidth={2.25} /> : null}
                {added ? "Added" : "Add to cart"}
              </button>
              <span className="sr-only" aria-live="polite">
                {added ? `${s.product.name} added to cart` : ""}
              </span>
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
            <CtrlButton label="Previous product" onClick={() => go(-1)}>
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
            </CtrlButton>
            <div role="group" aria-label="Choose a product" className="flex items-center">
              {SLIDES.map((sl, i) => (
                <Dot
                  key={sl.product.id}
                  active={i === index}
                  label={`Show ${sl.product.name}`}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  progress={progress}
                  full={paused}
                />
              ))}
            </div>
            <CtrlButton label="Next product" onClick={() => go(1)}>
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

        <div className="mt-6 grid items-end gap-5 lg:mt-2 lg:grid-cols-[1fr_auto_1fr]">
          <dl className="hidden font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-white/85 uppercase xl:block">
            {SHOP_BY.map((c) => (
              <div key={c.id} className="flex gap-2 whitespace-nowrap">
                <dt>{c.label}</dt>
                <dd className="tabular-nums">from {formatPrice(c.from)}</dd>
              </div>
            ))}
          </dl>
          <nav
            aria-label="Shop by category"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:px-0 lg:col-start-2 [&::-webkit-scrollbar]:hidden"
          >
            {SHOP_BY.map((c) => (
              <a
                key={c.id}
                href="#shop-filters"
                onClick={() => setFilter(c.id)}
                className={buttonClass("outline-inverse", "h-11 shrink-0 px-5")}
              >
                Shop {c.label}
                <span className="font-mono font-medium text-white/80 tabular-nums">({c.count})</span>
              </a>
            ))}
          </nav>
          <ChatBadge className="hidden justify-self-end lg:col-start-3 lg:grid" />
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
