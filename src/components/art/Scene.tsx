import { COLLECTION_BY_ID } from "@/lib/products";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GroupArt } from "./ProductArt";

/** Wall and table-top colours for each collection's group shot: three soft, light rooms. */
export const SCENES: Record<Category, { wall: string; table: string }> = {
  tea: { wall: "bg-[#e9e4dc]", table: "bg-[#d9d1c5]" },
  drink: { wall: "bg-[#e6e8ee]", table: "bg-[#d3d7e0]" },
  dinner: { wall: "bg-[#e6eae0]", table: "bg-[#d6dccc]" },
};

/** A collection's group shot standing on a table. */
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
      <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[36%]", sc.table)} />
      {/* The front row stands well inside the table top; the back row's feet hide behind it. */}
      <div className={cn("absolute inset-x-[10%] top-[15%] bottom-[8%]", artClassName)}>
        <GroupArt collection={collection} align="xMidYMax" title={decorative ? undefined : `${c?.label}: ${c?.tagline}`} />
      </div>
    </div>
  );
}
