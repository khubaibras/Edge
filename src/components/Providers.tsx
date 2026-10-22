"use client";

import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/components/cart/CartProvider";
import { ShopFilterProvider } from "@/components/shop/ShopFilter";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <ShopFilterProvider>{children}</ShopFilterProvider>
      </CartProvider>
    </MotionConfig>
  );
}
