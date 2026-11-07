"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Scene } from "@/components/art/Scene";
import { buttonClass, Reveal, SectionHeader } from "@/components/ui/primitives";
import { COLLECTIONS, collectionHref } from "@/lib/products";
import { cn } from "@/lib/utils";

export function Collections() {
  return (
    <section id="collections" aria-labelledby="collections-title" className="py-20 sm:py-28 lg:py-24">
      <div className="shell">
        <SectionHeader
          id="collections-title"
          title="Our Collections"
          italic="three ranges for the table"
          aside="Each collection opens in the shop, where you can pick colours, add to your cart and order."
        />

        <ol className="mt-12 grid gap-14 sm:mt-16 lg:gap-10">
          {COLLECTIONS.map((c, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={c.id} className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
                <Reveal className={cn("lg:col-span-7", flip && "lg:order-2")}>
                  <Link
                    href={collectionHref(c.id)}
                    aria-label={`View ${c.label}`}
                    className="group block rounded-[4px] outline-offset-4"
                  >
                    <Scene
                      collection={c.id}
                      decorative
                      className="aspect-[16/10]"
                      artClassName="transition-transform duration-700 ease-quint group-hover:scale-[1.035]"
                    />
                  </Link>
                </Reveal>

                <Reveal delay={0.08} className={cn("lg:col-span-5", flip ? "lg:order-1 lg:pr-4" : "lg:pl-4")}>
                  <h3 className="font-display text-[clamp(2.125rem,3.6vw,3.5rem)] leading-[1] font-bold tracking-[-0.025em]">
                    {c.label}
                  </h3>
                  <span aria-hidden className="mt-4 block h-[3px] w-14 bg-brand" />
                  <p className="mt-5 font-serif text-[clamp(1.25rem,1.8vw,1.625rem)] leading-[1.2] text-ink-2 italic">
                    {c.tagline}
                  </p>
                  <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-mute">{c.description}</p>
                  <Link href={collectionHref(c.id)} className={buttonClass("secondary", "group mt-7 h-11 px-5")}>
                    View collection
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
