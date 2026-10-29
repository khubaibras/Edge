import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Reveal, SectionHeader } from "@/components/ui/primitives";
import { WholesaleForm, WholesaleInfo } from "@/components/wholesale/WholesaleForm";

export const metadata: Metadata = {
  title: "Wholesale — KROMA",
  description:
    "Bulk orders of glass tableware, kettles, flasks and bottles for shops, cafés, hotels and offices. Send a query and we reply with prices.",
};

/** Wholesale page: a query form that goes to the shop as a chat message. */
export default function WholesalePage() {
  return (
    <>
      <Navbar variant="wholesale" />
      <main>
        <section aria-labelledby="wholesale-title" className="py-16 sm:py-20 lg:py-24">
          <div className="shell">
            <SectionHeader
              id="wholesale-title"
              title="Wholesale"
              italic="bulk orders for shops, cafés, hotels and offices"
              aside="Buying in bulk? Send us a query and we'll reply with prices and delivery times."
            />

            <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start lg:gap-16">
              <Reveal className="lg:col-span-7">
                <WholesaleForm />
              </Reveal>

              <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:col-span-5">
                <WholesaleInfo />
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
