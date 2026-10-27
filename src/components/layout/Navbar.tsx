"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useActiveCollection } from "@/components/shop/useActiveSection";
import { buttonClass } from "@/components/ui/primitives";
import { CHAT_LINK } from "@/lib/contact";
import { EASE, SPRING, SPRING_SOFT } from "@/lib/motion";
import { COLLECTIONS, familiesIn } from "@/lib/products";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "home" is the brand page; "shop" is the order page, where the cart lives. */
export type NavVariant = "home" | "shop";

const PAGE_LINKS: Record<NavVariant, { href: string; label: string }[]> = {
  home: [
    { href: "#why", label: "Why us" },
    { href: "#top-selling", label: "Top selling" },
    { href: "#collections", label: "Our collections" },
    { href: "#about", label: "Questions" },
  ],
  shop: [
    { href: "/", label: "Home" },
    { href: "#how-to-order", label: "How ordering works" },
    { href: "/#about", label: "Questions" },
  ],
};

const LINK = "font-display text-[12px] font-semibold uppercase tracking-[0.07em]";

/** True while the cobalt hero is behind the bar, so the bar can wear the same colour. */
function useOverHero() {
  const [over, setOver] = useState(true);
  useEffect(() => {
    const hero = document.getElementById("top");
    const onScroll = () => setOver(!!hero && hero.getBoundingClientRect().bottom > 64);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return over;
}

/** Collection link: a same-page jump on the shop, a page change from home. */
function CollectionLink({
  variant,
  slug,
  className,
  onClick,
  current,
  children,
}: {
  variant: NavVariant;
  slug: string;
  className?: string;
  onClick?: () => void;
  current?: boolean;
  children: React.ReactNode;
}) {
  const props = { className, onClick, "aria-current": current ? ("true" as const) : undefined };
  return variant === "shop" ? (
    <a href={`#${slug}`} {...props}>
      {children}
    </a>
  ) : (
    <Link href={`/shop#${slug}`} {...props}>
      {children}
    </Link>
  );
}

export function Navbar({ variant = "home" }: { variant?: NavVariant }) {
  const { count, openCart } = useCart();
  const overHero = useOverHero();
  const active = useActiveCollection();
  const [menuOpen, setMenuOpen] = useState(false);
  const onBrand = overHero && !menuOpen;
  // Home is a brand page: it offers the shop, and only shows the cart once something is in it.
  const showCart = variant === "shop" || count > 0;

  // Open menu: Escape closes it and the page underneath can't scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const isActive = (id: Category) => variant === "shop" && active === id;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b transition-[background-color,color,border-color] duration-500 ease-quint",
        onBrand ? "border-transparent bg-brand text-white [&_:focus-visible]:outline-white" : "border-line bg-paper text-ink",
      )}
    >
      <div className="shell grid h-full grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href={variant === "home" ? "#top" : "/"}
          onClick={close}
          className="justify-self-start leading-none"
          aria-label={variant === "home" ? "KROMA, back to top" : "KROMA home"}
        >
          <span className="display block text-[23px] tracking-[-0.01em]">KROMA</span>
          <span className="mt-1 block font-mono text-[9.5px] tracking-[0.06em] whitespace-nowrap uppercase opacity-80">
            Tableware · Kettles · Flasks
          </span>
        </Link>

        <nav aria-label="Collections" className="hidden lg:block">
          <ul className="flex items-center">
            {COLLECTIONS.map((c) => {
              const on = isActive(c.id);
              return (
                <li key={c.id}>
                  <CollectionLink
                    variant={variant}
                    slug={c.slug}
                    current={on}
                    className={cn(
                      LINK,
                      "relative block px-2.5 py-2 whitespace-nowrap transition-opacity duration-300 xl:px-3.5",
                      on ? "opacity-100" : "opacity-75 hover:opacity-100",
                    )}
                  >
                    {c.label}
                    {on && (
                      <motion.span
                        layoutId="nav-collection"
                        className="absolute inset-x-2.5 bottom-0.5 h-[2px] bg-current xl:inset-x-3.5"
                        transition={SPRING}
                      />
                    )}
                  </CollectionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {showCart ? (
            <button
              type="button"
              onClick={() => {
                close();
                openCart();
              }}
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
              className={cn(
                LINK,
                "flex h-10 items-center gap-2.5 rounded-full pr-1.5 pl-4 transition-[background-color,color] duration-500 ease-quint active:scale-[0.97]",
                onBrand ? "bg-white text-brand focus-visible:outline-white" : "bg-ink text-paper",
              )}
            >
              Cart
              <motion.span
                key={count}
                initial={count ? { scale: 1.4 } : false}
                animate={{ scale: 1 }}
                transition={SPRING_SOFT}
                className={cn(
                  "grid h-7 min-w-7 place-items-center rounded-full px-1.5 font-mono text-[11px] tabular-nums transition-colors duration-500",
                  onBrand ? "bg-brand text-white" : "bg-paper text-ink",
                )}
              >
                {count}
              </motion.span>
            </button>
          ) : (
            <Link
              href="/shop"
              onClick={close}
              className={cn(
                LINK,
                "group hidden h-10 items-center gap-2 rounded-full px-4 transition-[background-color,color] duration-500 ease-quint active:scale-[0.97] sm:flex",
                onBrand ? "bg-white text-brand focus-visible:outline-white" : "bg-ink text-paper",
              )}
            >
              Shop now
              <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "-mr-1 grid size-10 place-items-center rounded-full border transition-colors lg:hidden",
              onBrand ? "border-white/45" : "border-line-2",
            )}
          >
            {menuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="scrim"
            aria-hidden
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 bottom-0 bg-ink/25 lg:hidden"
          />
        )}
        {menuOpen && (
          <motion.nav
            key="menu"
            id="mobile-nav"
            aria-label="Menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-line bg-paper text-ink shadow-soft lg:hidden"
          >
            <div className="shell pt-5 pb-8">
              <p className="eyebrow">Collections</p>
              <ul className="mt-1">
                {COLLECTIONS.map((c) => (
                  <li key={c.id} className="border-b border-line">
                    <CollectionLink
                      variant={variant}
                      slug={c.slug}
                      onClick={close}
                      current={isActive(c.id)}
                      className="flex items-baseline justify-between gap-4 py-3.5"
                    >
                      <span className="display text-[clamp(1.75rem,8.6vw,2.5rem)]">{c.label}</span>
                      <span className="eyebrow tabular-nums">{familiesIn(c.id).length}</span>
                    </CollectionLink>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 grid gap-0.5">
                {PAGE_LINKS[variant].map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} onClick={close} className="block py-2 text-[16px] text-ink-2">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-2">
                {variant === "home" && (
                  <Link href="/shop" onClick={close} className={buttonClass("primary", "w-full")}>
                    Shop now
                    <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                  </Link>
                )}
                <a href={CHAT_LINK} target="_blank" rel="noopener noreferrer" className={buttonClass("brand", "w-full")}>
                  <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
