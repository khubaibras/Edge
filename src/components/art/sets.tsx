import type { ArtKind, ArtView, Category, Tone } from "@/lib/types";
import { GLASS_ART } from "./glass";
import { METAL_ART, r2 } from "./metal";
import { GROUND_Y, type ArtMap, type ArtRenderer } from "./shared";

/** One render placed in a group: centred on `x`, standing on ground line `g`, scaled by `s`. */
export interface Piece {
  kind: ArtKind;
  tone: Tone;
  view?: ArtView;
  x: number;
  g?: number;
  s?: number;
}

const SINGLES: ArtMap = { ...METAL_ART, ...GLASS_ART };

/** Draws pieces in array order, so list the back row first. */
export function Pieces({ pieces, uid }: { pieces: Piece[]; uid: string }) {
  return pieces.map((p, i) => {
    const render = SINGLES[p.kind];
    if (!render) return null;
    const s = p.s ?? 1;
    const g = p.g ?? GROUND_Y;
    return (
      <g key={i} transform={`translate(${r2(p.x - 200 * s)} ${r2(g - GROUND_Y * s)}) scale(${s})`}>
        {render({ tone: p.tone, view: p.view ?? "front", uid: `${uid}p${i}` })}
      </g>
    );
  });
}

function group(front: Piece[], alt: Piece[]): ArtRenderer {
  return function SetArt({ view, uid }) {
    return <Pieces pieces={view === "alt" ? alt : front} uid={uid} />;
  };
}

const G = "clear" as const;

/* Set products, drawn inside the usual 400×500 frame so they work anywhere a single product does. */
export const SET_ART: ArtMap = {
  dessertbowl: group(
    [
      { kind: "bowl", tone: G, x: 128, g: 448, s: 0.6 },
      { kind: "bowl", tone: G, x: 272, g: 448, s: 0.6 },
      { kind: "bowl", tone: G, x: 200, g: 472, s: 0.6 },
    ],
    [
      { kind: "bowl", tone: G, x: 200, g: 462, s: 0.72 },
      { kind: "bowl", tone: G, x: 200, g: 446, s: 0.72 },
      { kind: "bowl", tone: G, x: 200, g: 430, s: 0.72 },
    ],
  ),
  teaset: group(
    [
      { kind: "teapot", tone: G, x: 206, g: 430, s: 0.8 },
      { kind: "teacup", tone: G, x: 96, g: 468, s: 0.52 },
      { kind: "teacup", tone: G, x: 306, g: 474, s: 0.52 },
    ],
    [
      { kind: "teapot", tone: G, view: "alt", x: 206, g: 430, s: 0.8 },
      { kind: "teacup", tone: G, view: "alt", x: 96, g: 468, s: 0.52 },
      { kind: "teacup", tone: G, view: "alt", x: 306, g: 474, s: 0.52 },
    ],
  ),
  waterset: group(
    [
      { kind: "tumbler", tone: G, x: 108, g: 430, s: 0.5 },
      { kind: "tumbler", tone: G, x: 296, g: 430, s: 0.5 },
      { kind: "carafe", tone: G, x: 200, g: 448, s: 0.86 },
      { kind: "tumbler", tone: G, x: 70, g: 474, s: 0.56 },
      { kind: "tumbler", tone: G, x: 326, g: 474, s: 0.56 },
    ],
    [
      { kind: "tumbler", tone: G, view: "alt", x: 108, g: 430, s: 0.5 },
      { kind: "tumbler", tone: G, view: "alt", x: 296, g: 430, s: 0.5 },
      { kind: "carafe", tone: G, view: "alt", x: 222, g: 448, s: 0.86 },
      { kind: "tumbler", tone: G, view: "alt", x: 70, g: 474, s: 0.56 },
      { kind: "tumbler", tone: G, view: "alt", x: 326, g: 474, s: 0.56 },
    ],
  ),
  dinnerset: group(
    [
      { kind: "platestand", tone: G, x: 200, g: 416, s: 0.7 },
      { kind: "plate", tone: G, view: "alt", x: 200, g: 470, s: 0.8 },
      { kind: "sideplate", tone: G, x: 92, g: 486, s: 0.5 },
      { kind: "bowl", tone: G, x: 316, g: 488, s: 0.42 },
    ],
    [
      { kind: "platestand", tone: G, x: 140, g: 420, s: 0.6 },
      { kind: "platestand", tone: G, x: 262, g: 424, s: 0.6 },
      { kind: "sideplate", tone: G, x: 200, g: 482, s: 0.66 },
      { kind: "bowl", tone: G, x: 200, g: 452, s: 0.44 },
    ],
  ),
};

/** Wide group shots, one per collection: hero, collection banners and the shop. */
export interface Ensemble {
  /** Pieces are placed on a 640×500 stage; tight frame around the drawn pieces [x, y, width, height], measured in the browser, so every group fills its box alike. */
  box: [number, number, number, number];
  pieces: Piece[];
}

export const ENSEMBLES: Record<Category, Ensemble> = {
  tea: {
    box: [54, 172, 551, 329],
    pieces: [
      { kind: "mug", tone: G, view: "alt", x: 528, g: 408, s: 0.62 },
      { kind: "teapot", tone: G, x: 290, g: 410, s: 0.98 },
      { kind: "teacup", tone: G, view: "alt", x: 140, g: 466, s: 0.72 },
      { kind: "teacup", tone: G, x: 420, g: 482, s: 0.72 },
    ],
  },
  drink: {
    box: [85, 82, 494, 415],
    pieces: [
      { kind: "coupe", tone: "smoke", view: "alt", x: 446, g: 404, s: 0.76 },
      { kind: "carafe", tone: G, view: "alt", x: 264, g: 410, s: 0.98 },
      { kind: "tumbler", tone: G, view: "alt", x: 150, g: 470, s: 0.68 },
      { kind: "doublewall", tone: G, view: "alt", x: 360, g: 478, s: 0.7 },
      { kind: "tumbler", tone: G, x: 520, g: 466, s: 0.6 },
    ],
  },
  dinner: {
    box: [35, 145, 549, 361],
    pieces: [
      { kind: "platestand", tone: G, x: 232, g: 396, s: 0.78 },
      { kind: "platestand", tone: G, x: 410, g: 404, s: 0.66 },
      { kind: "sideplate", tone: G, x: 506, g: 470, s: 0.54 },
      { kind: "plate", tone: G, view: "alt", x: 284, g: 482, s: 0.84 },
      { kind: "bowl", tone: G, x: 120, g: 474, s: 0.6 },
      { kind: "bowl", tone: G, x: 448, g: 488, s: 0.42 },
    ],
  },
  kettles: {
    box: [55, 195, 530, 315],
    pieces: [
      { kind: "kettle", tone: "sage", view: "alt", x: 236, g: 360, s: 0.5 },
      { kind: "kettle", tone: "obsidian", x: 404, g: 362, s: 0.5 },
      { kind: "kettle", tone: "stone", view: "alt", x: 150, g: 470, s: 0.6 },
      { kind: "kettle", tone: "steel", x: 490, g: 472, s: 0.6 },
      { kind: "kettle", tone: "terracotta", x: 320, g: 500, s: 0.7 },
    ],
  },
  flasks: {
    box: [162, 97, 318, 397],
    pieces: [
      { kind: "bottle", tone: "sand", x: 206, g: 414, s: 0.84 },
      { kind: "flask", tone: "steel", x: 320, g: 400, s: 0.86 },
      { kind: "bottle", tone: "sage", x: 436, g: 414, s: 0.84 },
      { kind: "bottle", tone: "terracotta", x: 266, g: 474, s: 0.92 },
      { kind: "bottle", tone: "stone", x: 380, g: 478, s: 0.92 },
    ],
  },
};
