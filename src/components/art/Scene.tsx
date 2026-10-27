import { COLLECTION_BY_ID } from "@/lib/products";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GroupArt } from "./ProductArt";

/** Wall, table-top and watermark colours for each collection's group shot. */
export const SCENES: Record<Category, { wall: string; table: string; mark: string; word: string }> = {
  tea: { wall: "bg-[#ece6dc]", table: "bg-[#ddd4c6]", mark: "text-ink/[0.06]", word: "Chai" },
  drink: { wall: "bg-ice", table: "bg-[#d2daf3]", mark: "text-brand/[0.1]", word: "Paani" },
  dinner: { wall: "bg-brand", table: "bg-brand-2", mark: "text-white/[0.12]", word: "Dawat" },
  kettles: { wall: "bg-ink", table: "bg-[#24221f]", mark: "text-white/[0.07]", word: "Boil" },
  flasks: { wall: "bg-[#e6eae0]", table: "bg-[#d6dccc]", mark: "text-ink/[0.06]", word: "Safar" },
};

/** A collection's group shot standing on a table, with an Urdu or plain word for the occasion behind it. */
export function Scene({
  collection,
  className,
  artClassName,
  decorative = false,
}: {
  collection: Category;
  className?: string;
  artClassName?: string;
  decorative?: boolean;
}) {
  const sc = SCENES[collection];
  const c = COLLECTION_BY_ID.get(collection);
  return (
    <div className={cn("relative overflow-hidden rounded-[4px] [container-type:inline-size]", sc.wall, className)}>
      <p
        aria-hidden
        className={cn("display pointer-events-none absolute top-[5%] left-[4%] text-[22cqi] select-none", sc.mark)}
      >
        {sc.word}
      </p>
      <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[36%]", sc.table)} />
      {/* The front row stands well inside the table top; the back row's feet hide behind it. */}
      <div className={cn("absolute inset-x-[10%] top-[15%] bottom-[8%]", artClassName)}>
        <GroupArt collection={collection} align="xMidYMax" title={decorative ? undefined : `${c?.label}: ${c?.tagline}`} />
      </div>
    </div>
  );
}
