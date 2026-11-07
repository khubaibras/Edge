"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// A page that should open where the reader already is (another colour of the same product): its path,
// the scroll position at the click, and when the click happened.
let keep: { path: string; y: number; at: number } | null = null;

/** Call from a link's onClick when the page it opens should keep the current scroll position. */
export const keepScrollFor = (path: string) => {
  keep = { path, y: window.scrollY, at: Date.now() };
};

// Set by the browser's back and forward buttons, which should return to where the reader was.
let poppedAt = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (poppedAt = Date.now()));

/**
 * Mounted once in the root layout, so every page (home, shop, wholesale, collections, products) opens
 * at its top, with its header in view, instead of keeping the scroll position of the page it came from.
 * A shop product opens on its details (picture, name, price).
 * Without it the page can land part-way down: Next scrolls before the streamed content has its height,
 * and the site-wide smooth scrolling can stop short. Links to an #anchor keep their target.
 * A page opened with keepScrollFor goes back to the exact spot of the click instead (the browser can
 * drift while the new page streams in).
 */
export function ScrollReset() {
  const pathname = usePathname();
  const first = useRef(pathname);
  // Runs on every page change. The first page load and back/forward are left to the browser, which
  // restores the reader's position.
  useEffect(() => {
    if (first.current === pathname) return;
    first.current = "";
    if (Date.now() - poppedAt < 1000) return;
    if (keep && keep.path === pathname && Date.now() - keep.at < 3000) {
      window.scrollTo({ top: keep.y, left: 0, behavior: "instant" });
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
