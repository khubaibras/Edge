import { Navbar } from "@/components/layout/Navbar";
import { Collections } from "@/components/sections/Collections";
// Inside section is switched off for now; uncomment here and below to bring it back.
// import { Craft } from "@/components/sections/Craft";
import { About, Footer, OrderCta } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { TopSelling } from "@/components/sections/TopSelling";
import { WhyUs } from "@/components/sections/WhyUs";

/** Brand page: the collections and the reasons to buy. Ordering happens on /shop. */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyUs />
        <TopSelling />
        <Collections />
        {/* <Craft /> */}
        <About />
        <OrderCta />
      </main>
      <Footer className="border-t-0" />
    </>
  );
}
