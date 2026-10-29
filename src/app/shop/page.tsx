import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer, OrderSteps } from "@/components/sections/Footer";
import { ShopHero } from "@/components/shop/ShopHero";

export const metadata: Metadata = {
  title: "Shop — KROMA",
  description:
    "Tea, drink and dinner wares in glass, kettles, flasks and bottles. Pick a collection, add to cart and check out.",
};

/** Shop landing: the five collections, each opening its own page. */
export default function ShopPage() {
  return (
    <>
      <Navbar variant="shop" />
      <main>
        <ShopHero />
        <section aria-label="How ordering works" className="py-16 sm:py-20">
          <div className="shell">
            <OrderSteps id="how-to-order" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
