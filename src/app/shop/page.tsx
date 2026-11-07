import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer, OrderSteps } from "@/components/sections/Footer";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const metadata: Metadata = {
  title: "Shop — EDGE GLASSWARE",
  description:
    "Tea, drink and dinner wares in glass. Pick a collection, add to cart and check out.",
};

/** Shop landing: every product below the collections; picking a collection filters the list. */
export default function ShopPage() {
  return (
    <>
      <Navbar variant="shop" />
      <main>
        <ShopBrowser />
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
