import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer, OrderSteps } from "@/components/sections/Footer";
import { ShopCollections } from "@/components/shop/ShopCollections";
import { ShopHero } from "@/components/shop/ShopHero";

export const metadata: Metadata = {
  title: "Shop — KROMA",
  description:
    "Tea, drink and dinner wares in glass, stovetop kettles, flasks and bottles. Add to cart and order on WhatsApp, cash on delivery across Pakistan.",
};

/** Order page: every product, shelved by collection. The cart lives here. */
export default function ShopPage() {
  return (
    <>
      <Navbar variant="shop" />
      <main>
        <ShopHero />
        <ShopCollections />
        <section aria-label="How ordering works" className="border-t border-line py-20 sm:py-24">
          <div className="shell">
            <OrderSteps id="how-to-order" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
