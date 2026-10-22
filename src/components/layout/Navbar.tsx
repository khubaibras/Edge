"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useShopFilter, type Filter } from "@/components/shop/ShopFilter";
import { buttonClass } from "@/components/ui/primitives";
import { CHAT_LINK } from "@/lib/contact";
import { EASE, SPRING, SPRING_SOFT } from "@/lib/motion";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "#craft", label: "Inside the flask" },
  { href: "#lookbook", label: "Ideas" },
  { href: "#about", label: "About & ordering" },
];

const LINK = "font-display text-[12px] font-semibold uppercase tracking-[0.07em]";

const countFor = (id: Filter) => (id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length);

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

export function Navbar() {
  const { count, openCart } = useCart();
  const { filter, setFilter } = useShopFilter();
  const overHero = useOverHero();
  const [menuOpen, setMenuOpen] = useState(false);
  const onBrand = overHero && !menuOpen;

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

  const pick = (id: Filter) => {
    setFilter(id);
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b transition-[background-color,color,border-color] duration-500 ease-quint",
        onBrand ? "border-transparent bg-brand text-white [&_:focus-visible]:outline-white" : "border-line bg-paper text-ink",
      )}
    >
      <div className="shell grid h-full grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <a
          href="#top"
          onClick={() => setMenuOpen(false)}
          className="justify-self-start leading-none"
          aria-label="KROMA, back to top"
        >
          <span className="display block text-[23px] tracking-[-0.01em]">KROMA</span>
          <span className="mt-1 block font-mono text-[9.5px] tracking-[0.06em] whitespace-nowrap uppercase opacity-80">
            Flasks &amp; glass tableware
          </span>
        </a>

        <nav aria-label="Shop categories" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {CATEGORIES.map((c) => {
              const active = filter === c.id;
              return (
                <li key={c.id}>
                  <a
                    href="#shop-filters"
                    onClick={() => pick(c.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      LINK,
                      "relative block px-3.5 py-2 transition-opacity duration-300",
                      active ? "opacity-100" : "opacity-75 hover:opacity-100",
                    )}
                  >
                    {c.label}
                    {active && (
                      <motion.span
                        layoutId="nav-filter"
                        className="absolute inset-x-3.5 bottom-0.5 h-[2px] bg-current"
                        transition={SPRING}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <a
            href="#how-to-order"
            className={cn(LINK, "hidden px-3 py-2 opacity-75 transition-opacity hover:opacity-100 xl:block")}
          >
            How to order
          </a>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
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
            onClick={() => setMenuOpen(false)}
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
              <p className="eyebrow">Shop</p>
              <ul className="mt-1">
                {CATEGORIES.map((c) => (
                  <li key={c.id} className="border-b border-line">
                    <a
                      href="#shop-filters"
                      onClick={() => pick(c.id)}
                      aria-current={filter === c.id ? "true" : undefined}
                      className="flex items-baseline justify-between gap-4 py-3.5"
                    >
                      <span className="display text-[clamp(1.75rem,8.6vw,2.5rem)]">{c.label}</span>
                      <span className="eyebrow tabular-nums">{countFor(c.id)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 grid gap-0.5">
                {SECTIONS.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} onClick={() => setMenuOpen(false)} className="block py-2 text-[16px] text-ink-2">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a href={CHAT_LINK} target="_blank" rel="noopener noreferrer" className={buttonClass("brand", "mt-6 w-full")}>
                <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
                Chat on WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
