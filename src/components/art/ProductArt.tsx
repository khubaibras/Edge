import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ArtKind, ArtView, Tone } from "@/lib/types";
import { GLASS_ART } from "./glass";
import { METAL_ART } from "./metal";
import { ContactShadow, GROUND_Y, TONES, type ArtMap, type ArtRenderer } from "./shared";

const ART: ArtMap = { ...METAL_ART, ...GLASS_ART };

// Studio crop for tiles: [scale from the ground line, vertical shift in viewBox units] so short
// pieces (plates, cups, tumblers) fill the frame like the tall ones instead of hugging the floor.
const FIT: Partial<Record<ArtKind, [number, number]>> = {
  plate: [1.2, -100],
  bowl: [1.4, -75],
  teacup: [1.35, -40],
  mug: [1.4, -40],
  tumbler: [1.2, -25],
  doublewall: [1.15, -20],
  coupe: [1.05, -5],
  bottle: [1.1, 0],
};

const Fallback: ArtRenderer = ({ tone, uid }) => (
  <>
    <ContactShadow id={`${uid}-fs`} rx={70} />
    <rect x={150} y={170} width={100} height={290} rx={20} fill={TONES[tone].mid} />
  </>
);

/** Transparent studio render of a product, drawn as SVG so it scales crisp at any size. */
export function ProductArt({
  kind,
  tone,
  view = "front",
  fit = false,
  title,
  className,
}: {
  kind: ArtKind;
  tone: Tone;
  view?: ArtView;
  /** Apply the per-kind studio crop (catalog tiles, thumbnails). */
  fit?: boolean;
  /** Accessible name; omit when the render is decorative. */
  title?: string;
  className?: string;
}) {
  const uid = "a" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const render = ART[kind] ?? Fallback;
  return (
    <svg
      viewBox="0 0 400 500"
      className={cn("block h-full w-full overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {fit && FIT[kind] ? (
        <g transform={`translate(0 ${FIT[kind][1]}) translate(200 ${GROUND_Y}) scale(${FIT[kind][0]}) translate(-200 -${GROUND_Y})`}>
          {render({ tone, view, uid })}
        </g>
      ) : (
        render({ tone, view, uid })
      )}
    </svg>
  );
}
