import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Catalog } from "@/components/sections/Catalog";
import { Craft } from "@/components/sections/Craft";
import { About, Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Lookbook } from "@/components/sections/Lookbook";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Catalog />
        <Craft />
        <Lookbook />
        <About />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
