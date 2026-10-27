"use client";

import { MotionConfig } from "framer-motion";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";

/** Shared by every page, so the cart (and its drawer) carries over between home and shop. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </MotionConfig>
  );
}
