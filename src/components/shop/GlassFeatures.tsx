"use client";

import {
  Droplets,
  Eye,
  Flame,
  GlassWater,
  Hand,
  Layers,
  Leaf,
  Microwave,
  Refrigerator,
  ShieldCheck,
  Snowflake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ProductArt } from "@/components/art/ProductArt";
import { Reveal } from "@/components/ui/primitives";
import type { ArtKind, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface FeatureSet {
  title: string;
  italic: string;
  /** The piece drawn in the middle. */
  art: { kind: ArtKind; title: string };
  left: Feature[];
  right: Feature[];
}

// Every claim here comes from the product details in lib/products.
const FEATURES: Record<Category, FeatureSet> = {
  tea: {
    title: "Made for the brew",
    italic: "clear glass, so you can see the colour",
    art: { kind: "teapot", title: "Glass Teapot with its steel infuser" },
    left: [
      {
        icon: Flame,
        title: "Takes boiling water",
        body: "Heat-resistant borosilicate glass, so chai and green tea can go in straight off the boil.",
      },
      {
        icon: Eye,
        title: "See the colour of the brew",
        body: "Clear glass shows how strong your chai is before you pour.",
      },
    ],
    right: [
      {
        icon: Leaf,
        title: "Leaves stay in the pot",
        body: "The teapot's removable steel infuser keeps loose leaves out of the cup.",
      },
      {
        icon: Hand,
        title: "A handle that stays cool",
        body: "The glass mug's thick handle stays cool, and the mug goes in the microwave and the dishwasher.",
      },
    ],
  },
  drink: {
    title: "One glass, hot or cold",
    italic: "for chai in the morning and iced coffee after",
    art: { kind: "carafe", title: "Pour Carafe with its cork stopper" },
    left: [
      {
        icon: Snowflake,
        title: "Hot and cold drinks",
        body: "Borosilicate glass takes both, so the same tumbler works for chai or iced coffee.",
      },
      {
        icon: Droplets,
        title: "No sweat rings",
        body: "The double-wall glass doesn't fog up on the outside and stays cool to hold.",
      },
    ],
    right: [
      {
        icon: Refrigerator,
        title: "Fits the fridge door",
        body: "The slim carafe slides into the door, and its natural cork stopper keeps dust out.",
      },
      {
        icon: GlassWater,
        title: "Thick, steady base",
        body: "The ribbed tumblers sit firmly on the table and go straight in the dishwasher.",
      },
    ],
  },
  dinner: {
    title: "Glass for every meal",
    italic: "tempered, so it takes the heat",
    art: { kind: "dinnerset", title: "Glass Dinner Set: plates, quarter plates and dessert bowls" },
    left: [
      {
        icon: ShieldCheck,
        title: "Resists chips and heat",
        body: "Tempered glass for hot food and everyday knocks, at family meals and dawats alike.",
      },
      {
        icon: Microwave,
        title: "Microwave safe",
        body: "Warm leftovers on the same plate or bowl you serve them in.",
      },
    ],
    right: [
      {
        icon: Layers,
        title: "Stacks and nests",
        body: "Plates stack and bowls nest inside each other, so they take little cupboard space.",
      },
      {
        icon: Sparkles,
        title: "Dishwasher safe",
        body: "Every plate and bowl can go straight in the dishwasher.",
      },
    ],
  },
};

function Point({ f, align, delay }: { f: Feature; align: "left" | "right"; delay: number }) {
  const Icon = f.icon;
  return (
    <Reveal delay={delay}>
      <div className={cn("flex items-start gap-4", align === "right" && "lg:flex-row-reverse lg:text-right")}>
        <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-white text-brand shadow-lift">
          <Icon aria-hidden className="size-6" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-[19px] leading-tight font-bold tracking-[-0.01em]">{f.title}</h3>
          <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-mute lg:inline-block">{f.body}</p>
        </div>
      </div>
    </Reveal>
  );
}

/** A collection page's "why this range" section: four points around one of its pieces. */
export function GlassFeatures({ collection }: { collection: Category }) {
  const set = FEATURES[collection];
  return (
    <section aria-labelledby="inside-title" className="overflow-hidden border-b border-line py-20 sm:py-24">
      <div className="shell">
        <Reveal className="text-center">
          <h2 id="inside-title" className="display text-[clamp(2.25rem,4.6vw,4rem)]">
            {set.title}
          </h2>
          <p className="mx-auto mt-3 max-w-[36ch] font-serif text-[clamp(1.125rem,1.6vw,1.375rem)] text-ink-2 italic">
            {set.italic}
          </p>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-[1fr_minmax(0,26rem)_1fr] lg:gap-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-14">
            {set.left.map((f, i) => (
              <Point key={f.title} f={f} align="right" delay={i * 0.08} />
            ))}
          </div>

          <Reveal delay={0.1} className="relative mx-auto w-full max-w-[26rem] lg:order-2">
            <span
              aria-hidden
              className="absolute top-[56%] left-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10"
            />
            <span className="relative block aspect-[4/5] w-full">
              <ProductArt kind={set.art.kind} tone="clear" title={set.art.title} fit />
            </span>
          </Reveal>

          <div className="grid gap-10 sm:grid-cols-2 lg:order-3 lg:grid-cols-1 lg:gap-14">
            {set.right.map((f, i) => (
              <Point key={f.title} f={f} align="left" delay={0.16 + i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
