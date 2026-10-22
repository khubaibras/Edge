"use client";

import { Check } from "lucide-react";
import { ProductArt } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { useAddFeedback } from "@/components/shop/ProductCard";
import { buttonClass, Reveal, SectionHeader } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/cart";
import { PRODUCT_BY_ID } from "@/lib/products";
import type { ArtView, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Piece {
  id: string;
  view?: ArtView;
  /** Horizontal centre, % of the scene width. */
  x: number;
}

interface Scene {
  word: string;
  title: string;
  /** Wall, table top and watermark colours. */
  wall: string;
  table: string;
  mark: string;
  pieces: Piece[];
}

// Each scene is a still life of real products standing on a table; the word is Urdu for the occasion.
const SCENES: Scene[] = [
  {
    word: "Chai",
    title: "Chai at breakfast",
    wall: "bg-brand",
    table: "bg-brand-2",
    mark: "text-white/[0.12]",
    pieces: [{ id: "table-jug", x: 33 }, { id: "glass-mug", view: "alt", x: 58 }, { id: "tea-cup-saucer", x: 78 }],
  },
  {
    word: "Dawat",
    title: "Dinner with guests",
    wall: "bg-paper-3",
    table: "bg-[#dad3c8]",
    mark: "text-ink/[0.06]",
    pieces: [{ id: "glass-dinner-plate", view: "alt", x: 27 }, { id: "glass-serving-bowl", x: 55 }, { id: "rib-tumbler", x: 79 }],
  },
  {
    word: "Safar",
    title: "Out for the day",
    wall: "bg-ink",
    table: "bg-[#24221f]",
    mark: "text-white/[0.07]",
    pieces: [{ id: "thermal-flask-750", x: 40 }, { id: "commuter-bottle", x: 63 }],
  },
  {
    word: "Paani",
    title: "Cold water on the table",
    wall: "bg-ice",
    table: "bg-[#d2daf3]",
    mark: "text-brand/[0.1]",
    pieces: [{ id: "pour-carafe", x: 40 }, { id: "double-wall-glass", x: 64 }],
  },
];

const productOf = (id: string): Product => {
  const p = PRODUCT_BY_ID.get(id);
  if (!p) throw new Error(`Unknown product: ${id}`);
  return p;
};

export function Lookbook() {
  return (
    <section id="lookbook" aria-labelledby="ideas-title" className="border-t border-line py-20 sm:py-28 lg:py-24">
      <div className="shell">
        <SectionHeader
          id="ideas-title"
          title="Ideas"
          italic="for chai, dawat, safar and paani"
          aside="Each idea is made from pieces in the shop. Add the whole set in one tap."
        />

        <ul className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mt-16 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-14 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {SCENES.map((scene, i) => (
            <li key={scene.word} className="w-[84vw] max-w-[26rem] shrink-0 snap-center md:w-auto md:max-w-none">
              <Reveal delay={(i % 2) * 0.1}>
                <SceneCard scene={scene} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SceneCard({ scene }: { scene: Scene }) {
  const { add } = useCart();
  const [added, flagAdded] = useAddFeedback();
  const products = scene.pieces.map((p) => productOf(p.id));
  const total = products.reduce((sum, p) => sum + p.price, 0);

  const addAll = () => {
    for (const p of products) add(p.id);
    flagAdded();
  };

  return (
    <article>
      <div className={cn("relative aspect-[5/4] overflow-hidden rounded-[4px]", scene.wall)}>
        <p aria-hidden className={cn("display absolute top-[3%] left-[4%] text-[min(31vw,10rem)] select-none md:text-[clamp(5rem,11vw,10.5rem)]", scene.mark)}>
          {scene.word}
        </p>
        <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[30%]", scene.table)} />
        {scene.pieces.map((piece, i) => (
          // Art ground line sits at 92.4% of its box, so shift down 7.6% to stand on the table at 88%.
          <div
            key={piece.id}
            className="absolute bottom-[12%] h-[66%]"
            style={{ left: `${piece.x}%`, aspectRatio: "4 / 5", transform: "translate(-50%, 7.6%)" }}
          >
            <ProductArt
              kind={products[i].kind}
              tone={products[i].tone}
              view={piece.view}
              title={products[i].name}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-[22px] leading-tight font-bold tracking-[-0.015em]">{scene.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-mute">{products.map((p) => p.name).join(" + ")}</p>
        </div>
        <button type="button" onClick={addAll} className={buttonClass(added ? "brand" : "secondary", "h-11 shrink-0 px-5")}>
          {added ? <Check aria-hidden className="size-4" strokeWidth={2.25} /> : null}
          {added ? "Added" : `Add all ${products.length} · ${formatPrice(total)}`}
        </button>
        <span className="sr-only" aria-live="polite">
          {added ? `${products.length} items added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
