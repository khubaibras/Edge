import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { CollectionBar, CollectionProducts } from "@/components/shop/CollectionProducts";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { Reveal } from "@/components/ui/primitives";
import {
  COLLECTION_BY_ID,
  COLLECTION_BY_SLUG,
  collectionHref,
  familyKey,
  familyOf,
  PRODUCT_BY_ID,
  PRODUCTS,
} from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ collection: COLLECTION_BY_ID.get(p.category)?.slug ?? "", product: p.id }));
}

/** The product, only if it lives in the collection named in the URL. */
async function find(params: PageProps<"/shop/[collection]/[product]">["params"]) {
  const { collection, product } = await params;
  const p = PRODUCT_BY_ID.get(product);
  const c = COLLECTION_BY_SLUG.get(collection);
  return p && c && p.category === c.id ? { p, c } : null;
}

export async function generateMetadata({ params }: PageProps<"/shop/[collection]/[product]">): Promise<Metadata> {
  const found = await find(params);
  return found ? { title: `${found.p.name} — EDGE GLASSWARE`, description: found.p.description } : {};
}

/** A product's own page. The frame renders straight away; the part that depends on the URL streams in. */
export default function ProductPage({ params }: PageProps<"/shop/[collection]/[product]">) {
  return (
    <>
      <Navbar variant="shop" />
      <CollectionBar />
      <main>
        <Suspense fallback={<ShopSkeleton variant="product" />}>
          <ProductContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

/** The product named in the URL, with the rest of its collection underneath. */
async function ProductContent({ params }: Pick<PageProps<"/shop/[collection]/[product]">, "params">) {
  const found = await find(params);
  if (!found) notFound();
  const { p, c } = found;

  return (
    <>
      <section aria-label={p.name} className="pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pb-24">
        <div className="shell">
          <Breadcrumbs
            trail={[{ label: "Shop", href: "/shop" }, { label: c.label, href: collectionHref(c.id) }, { label: p.name }]}
          />
          <div className="mt-8">
            <ProductDetails product={p} items={familyOf(p)} />
          </div>
        </div>
      </section>

      <section aria-labelledby="related-title" className="border-t border-line py-16 sm:py-20">
        <div className="shell">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 id="related-title" className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-bold tracking-[-0.02em]">
              More {c.label}
            </h2>
            <Link
              href={collectionHref(c.id)}
              className="group inline-flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.06em] text-brand uppercase"
            >
              View all
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </Reveal>
          <CollectionProducts collection={c.id} exclude={familyKey(p)} limit={4} className="mt-8" />
        </div>
      </section>
    </>
  );
}
