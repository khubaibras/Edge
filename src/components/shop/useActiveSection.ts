"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

/** Which shop collection section is under the reading line (35% down the viewport); null above or below them. */
export function useActiveCollection() {
  const [active, setActive] = useState<Category | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let current: Category | null = null;
      for (const el of document.querySelectorAll<HTMLElement>("[data-collection]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = el.dataset.collection as Category;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return active;
}
