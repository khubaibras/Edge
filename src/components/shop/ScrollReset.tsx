"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// A page that should open where the reader already is (another colour of the same product): its path,
// the scroll position at the click, and when the click happened.
let keep: { path: string; y: number; at: number } | null = null;

/** Call from a link's onClick when the page it opens should keep the current scroll position. */
export const keepScrollFor = (path: string) => {
  keep = { path, y: window.scrollY, at: Date.now() };
};

/**
 * Puts a newly opened shop page at its top, so a product opens on its details (picture, name, price).
 * Without it the page can land part-way down: Next scrolls before the streamed content has its height,
 * and the site-wide smooth scrolling can stop short. Links to an #anchor keep their target.
 * A page opened with keepScrollFor goes back to the exact spot of the click instead (the browser can
 * drift while the new page streams in).
 */
export function ScrollReset() {
  const pathname = usePathname();
  // Runs on every page change, whether React reuses this component or mounts a new one. The check has no
  // side effects, so it gives the same answer when React runs it twice in development.
  useEffect(() => {
    if (keep && keep.path === pathname && Date.now() - keep.at < 3000) {
      window.scrollTo({ top: keep.y, left: 0, behavior: "instant" });
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
