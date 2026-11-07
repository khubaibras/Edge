import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Scene } from "@/components/art/Scene";
import { Navbar } from "@/components/layout/Navbar";
import { Footer, OrderSteps } from "@/components/sections/Footer";
import { CollectionBar, CollectionProducts } from "@/components/shop/CollectionProducts";
import { CollectionHero } from "@/components/shop/CollectionHero";
import { GlassFeatures } from "@/components/shop/GlassFeatures";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { Reveal } from "@/components/ui/primitives";
import { COLLECTION_BY_SLUG, COLLECTIONS, collectionHref } from "@/lib/products";
import type { Category } from "@/lib/types";

/** The word behind each collection's poster hero. */
const HERO_MARKS: Record<Category, string> = {
  tea: "Tea Wares",
  drink: "Drink Wares",
  dinner: "Dinner Wares",
};

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[collection]">): Promise<Metadata> {
  const c = COLLECTION_BY_SLUG.get((await params).collection);
  return c ? { title: `${c.label} — EDGE GLASSWARE`, description: c.description } : {};
}

/** One collection's own page. The frame renders straight away; the part that depends on the URL streams in. */
export default function CollectionPage({ params }: PageProps<"/shop/[collection]">) {
  return (
    <>
      <Navbar variant="shop" />
      <CollectionBar />
      <main>
        <Suspense fallback={<ShopSkeleton variant="collection" />}>
          <CollectionContent params={params} />
        </Suspense>
        <section aria-label="How ordering works" className="border-t border-line py-16 sm:py-20">
          <div className="shell">
            <OrderSteps id="how-to-order" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** The collection named in the URL: a poster hero, what makes the range good, its products, then the other collections. */
async function CollectionContent({ params }: Pick<PageProps<"/shop/[collection]">, "params">) {
  const c = COLLECTION_BY_SLUG.get((await params).collection);
  if (!c) notFound();
  const others = COLLECTIONS.filter((o) => o.id !== c.id);

  return (
    <>
      <CollectionHero collection={c.id} mark={HERO_MARKS[c.id]} />
      <GlassFeatures collection={c.id} />
      <section aria-label={`${c.label} products`} className="pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
        <div className="shell">
          <Reveal>
            <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight font-bold tracking-[-0.02em]">
              Shop {c.label.toLowerCase()}
            </h2>
            <p className="mt-2 max-w-[52ch] text-[15px] text-mute">{c.description}</p>
          </Reveal>
          <CollectionProducts collection={c.id} className="mt-8" />
        </div>
      </section>

      <section aria-labelledby="more-title" className="border-t border-line py-16 sm:py-20">
        <div className="shell">
          <Reveal>
            <h2 id="more-title" className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]">
              More collections
            </h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {others.map((o, i) => (
              <li key={o.id}>
                <Reveal delay={i * 0.06}>
                  <Link href={collectionHref(o.id)} className="group block rounded-[4px] outline-offset-4">
                    <Scene
                      collection={o.id}
                      decorative
                      className="aspect-[4/3]"
                      artClassName="transition-transform duration-700 ease-quint group-hover:scale-[1.035]"
                    />
                    <span className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[15px] leading-snug font-medium">{o.label}</span>
                      <ArrowRight
                        aria-hidden
                        className="size-4 shrink-0 text-mute transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={2}
                      />
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-mute">{o.tagline}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
