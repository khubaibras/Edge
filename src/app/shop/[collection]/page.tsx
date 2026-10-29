import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Scene } from "@/components/art/Scene";
import { Navbar } from "@/components/layout/Navbar";
import { Footer, OrderSteps } from "@/components/sections/Footer";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CollectionBar, CollectionProducts } from "@/components/shop/CollectionProducts";
import { ScrollReset } from "@/components/shop/ScrollReset";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { Reveal } from "@/components/ui/primitives";
import { COLLECTION_BY_SLUG, COLLECTIONS, collectionHref } from "@/lib/products";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[collection]">): Promise<Metadata> {
  const c = COLLECTION_BY_SLUG.get((await params).collection);
  return c ? { title: `${c.label} — KROMA`, description: c.description } : {};
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

/** The collection named in the URL: its products, then the other collections. */
async function CollectionContent({ params }: Pick<PageProps<"/shop/[collection]">, "params">) {
  const c = COLLECTION_BY_SLUG.get((await params).collection);
  if (!c) notFound();
  const others = COLLECTIONS.filter((o) => o.id !== c.id);

  return (
    <>
      <ScrollReset />
      <section aria-labelledby="collection-title" className="pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
        <div className="shell">
          <Breadcrumbs trail={[{ label: "Shop", href: "/shop" }, { label: c.label }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <Reveal className="lg:col-span-5">
              <h1 id="collection-title" className="display text-[clamp(3rem,6.4vw,6rem)]">
                {c.label}
              </h1>
              <p className="mt-3 font-serif text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
                {c.tagline}
              </p>
              <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-mute">{c.description}</p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <Scene collection={c.id} className="aspect-[16/10]" />
            </Reveal>
          </div>

          <CollectionProducts collection={c.id} className="mt-16 lg:mt-20" />
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
