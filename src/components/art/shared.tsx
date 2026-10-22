import type { ArtKind, ArtView, Tone } from "@/lib/types";

/**
 * Art contract. Every render draws into a 400×500 viewBox, transparent background,
 * horizontally centred on x=200, resting on the ground line GROUND_Y, lit from the upper left.
 * `uid` is unique per <svg>; prefix every gradient/filter/clip id with it.
 */
export type ArtRenderer = (props: { tone: Tone; view: ArtView; uid: string }) => React.ReactNode;
export type ArtMap = Partial<Record<ArtKind, ArtRenderer>>;

export const GROUND_Y = 462;

/** Base ramps per finish: hi = specular side, deep = core shadow. */
export const TONES: Record<Tone, { hi: string; mid: string; lo: string; deep: string }> = {
  steel: { hi: "#f6f6f4", mid: "#cbcccb", lo: "#909392", deep: "#5d6060" },
  obsidian: { hi: "#5c5a57", mid: "#2c2b2a", lo: "#1d1c1b", deep: "#0e0e0d" },
  stone: { hi: "#f4f0e9", mid: "#ddd6cb", lo: "#bfb6a8", deep: "#968c7e" },
  clear: { hi: "#ffffff", mid: "#e6ebea", lo: "#c7d0ce", deep: "#97a3a1" },
  smoke: { hi: "#f0eeeb", mid: "#aaa49c", lo: "#7a746c", deep: "#4e4943" },
};

/** Soft elliptical contact shadow where an object meets the ground. */
export function ContactShadow({
  id,
  cx = 200,
  cy = GROUND_Y,
  rx = 90,
  ry = 9,
  opacity = 0.3,
}: {
  id: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  opacity?: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#151413" stopOpacity={opacity} />
          <stop offset="0.6" stopColor="#151413" stopOpacity={opacity * 0.35} />
          <stop offset="1" stopColor="#151413" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="art-shadow" cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}
