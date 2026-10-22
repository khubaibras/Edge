"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useEffectEvent, useRef } from "react";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";

// Shared scroll lock so stacked overlays don't unlock each other.
let locks = 0;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Right-hand slide-over panel: backdrop, spring slide, Escape to close, focus trap, scroll lock. */
export function Sheet({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  // Effect event: callers may pass inline closures without re-running the open/close effect.
  const onEscape = useEffectEvent((e: KeyboardEvent) => e.key === "Escape" && onClose());

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    if (locks++ === 0) root.style.overflow = "hidden";
    const restore = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => panel.current?.focus());
    const onKey = (e: KeyboardEvent) => onEscape(e);
    window.addEventListener("keydown", onKey);
    return () => {
      if (--locks === 0) root.style.overflow = "";
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      restore?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const items = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-50">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={trapFocus}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-paper shadow-panel outline-none",
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
