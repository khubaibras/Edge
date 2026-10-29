import type { Tone } from "@/lib/types";
import { ContactShadow, GROUND_Y, TONES, type ArtMap, type ArtRenderer } from "./shared";

/* ---------- Drawing helpers ---------- */

export type Ramp = { hi: string; mid: string; lo: string; deep: string };
export type Stop = readonly [offset: number, color: string, opacity?: number];

/** Linear gradient from [offset, colour, opacity?] stops; left→right across the shape by default. */
export function Grad({
  id,
  stops,
  x1 = 0,
  y1 = 0,
  x2 = 1,
  y2 = 0,
}: {
  id: string;
  stops: readonly Stop[];
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map(([o, c, a = 1], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
      ))}
    </linearGradient>
  );
}

export function Radial({
  id,
  stops,
  cx = 0.5,
  cy = 0.5,
  r = 0.5,
}: {
  id: string;
  stops: readonly Stop[];
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stops.map(([o, c, a = 1], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
      ))}
    </radialGradient>
  );
}

/** Deterministic PRNG so server and client renders match. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Ellipse depth for round edges seen from just above eye level. */
const ry = (rx: number) => r2(rx * 0.19);

/** Round SVG coordinates so server and browser markup match exactly. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** Cylinder side: straight top edge (hidden by the top face), curved front bottom edge. */
export const side = (cx: number, rx: number, y1: number, y2: number, e = ry(rx)) =>
  `M${cx - rx},${y1} L${cx - rx},${y2} A${rx},${r2(e)} 0 0 0 ${cx + rx},${y2} L${cx + rx},${y1} Z`;

/** Band around a cylinder between two heights (both edges curved). */
export const band = (cx: number, rx: number, y1: number, y2: number, e = ry(rx)) =>
  `M${cx - rx},${y1} L${cx - rx},${y2} A${rx},${r2(e)} 0 0 0 ${cx + rx},${y2} L${cx + rx},${y1} A${rx},${r2(e)} 0 0 1 ${cx - rx},${y1} Z`;

/** Front half of an ellipse, left to right (a groove or seam line). */
export const frontArc = (cx: number, rx: number, y: number, e = ry(rx)) =>
  `M${cx - rx},${y} A${rx},${r2(e)} 0 0 0 ${cx + rx},${y}`;

/** Back half of an ellipse, left to right. */
export const backArc = (cx: number, rx: number, y: number, e = ry(rx)) =>
  `M${cx - rx},${y} A${rx},${r2(e)} 0 0 1 ${cx + rx},${y}`;

/** Brushed steel: crisp window reflection ~27% in, secondary reflection, core shadow, rim light. */
export const brushed = (t: Ramp): Stop[] => [
  [0, t.lo],
  [0.05, t.mid],
  [0.15, t.hi],
  [0.25, "#ffffff"],
  [0.31, t.hi],
  [0.4, t.mid],
  [0.5, t.lo],
  [0.58, t.mid],
  [0.66, t.lo],
  [0.8, t.deep],
  [0.9, t.lo],
  [0.96, t.mid],
  [1, t.lo],
];

/** Matte coat or satin glaze: one broad soft highlight, gentle core shadow, faint rim light. */
export const matte = (t: Ramp): Stop[] => [
  [0, t.lo],
  [0.1, t.mid],
  [0.28, t.hi],
  [0.45, t.mid],
  [0.66, t.lo],
  [0.84, t.deep],
  [0.95, t.lo],
  [1, t.lo],
];

const STEEL = TONES.steel;
const OAK: Ramp = { hi: "#dcbb92", mid: "#b98e60", lo: "#8f6640", deep: "#5e4129" };
// Obsidian gets a lifted highlight so the black coat still reads as a cylinder.
const ramp = (tone: Tone): Ramp => (tone === "obsidian" ? { ...TONES.obsidian, hi: "#76736e" } : TONES[tone]);
const finish = (tone: Tone) => (tone === "steel" ? brushed(STEEL) : matte(ramp(tone)));
const topFace = (t: Ramp): Stop[] => [
  [0, t.hi],
  [0.55, t.mid],
  [1, t.lo],
];
const INNER: Stop[] = [
  [0, "#8c8f8e"],
  [0.4, "#3b3d3d"],
  [1, "#0f1010"],
];
const AO: Stop[] = [
  [0, "#000", 0],
  [0.8, "#000", 0],
  [1, "#000", 0.22],
];

/** Fine vertical grain for brushed steel, blended softly over the gradient. */
function BrushGrain({ id }: { id: string }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.8 0.006" numOctaves={1} seed={7} />
      <feColorMatrix
        type="matrix"
        values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
      />
    </filter>
  );
}

/** Knurled grip: grooves spaced by angle so they bunch up toward the silhouette. */
function Knurl({ cx, rx, y1, y2, n = 52 }: { cx: number; rx: number; y1: number; y2: number; n?: number }) {
  const e = ry(rx);
  return (
    <g fill="#000" opacity={0.2}>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + ((i + 0.5) / n) * Math.PI;
        const w = 0.25 + 1.1 * Math.cos(a);
        return (
          <rect
            key={i}
            x={r2(cx + rx * Math.sin(a) - w / 2)}
            y={r2(y1 + e * Math.cos(a))}
            width={r2(w)}
            height={y2 - y1}
          />
        );
      })}
    </g>
  );
}

/** Small laser-etched wordmark. */
function Wordmark({ cx, y, tone }: { cx: number; y: number; tone: Tone }) {
  return (
    <text
      x={cx + 1.6}
      y={y}
      textAnchor="middle"
      fontSize={7.5}
      fontWeight={600}
      letterSpacing={3.2}
      fill={tone === "obsidian" ? "#9a9894" : TONES[tone].deep}
      opacity={tone === "steel" ? 0.6 : 0.55}
      style={{ fontFamily: "var(--font-inter), ui-sans-serif, sans-serif" }}
    >
      KROMA
    </text>
  );
}

/* ---------- Flask & bottle: one vessel, two sets of proportions ---------- */

interface Dims {
  cx: number;
  /** Centre of the cap's top face. */
  c: number;
  /** Body, neck and cap radii. */
  R: number;
  N: number;
  C: number;
  capH: number;
  shoulder: number;
  grip: "knurl" | "grooves";
  logoY?: number;
}

function Vessel({ uid, tone, d, open }: { uid: string; tone: Tone; d: Dims; open?: boolean }) {
  const { cx, c, R, N, capH, shoulder } = d;
  const t = TONES[tone];
  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;
  const ringTop = c + capH;
  const s0 = ringTop + 6;
  const s1 = s0 + shoulder;
  const bot = GROUND_Y - 1 - ry(R);
  const body =
    `M${cx - N},${s0} C${cx - N - (R - N) * 0.7},${s0} ${cx - R},${s0 + shoulder * 0.35} ${cx - R},${s1} ` +
    `L${cx - R},${bot} A${R},${ry(R)} 0 0 0 ${cx + R},${bot} L${cx + R},${s1} ` +
    `C${cx + R},${s0 + shoulder * 0.35} ${cx + N + (R - N) * 0.7},${s0} ${cx + N},${s0} Z`;
  const neckR = N - 4;
  const lip = c + capH * 0.42;

  return (
    <g>
      <defs>
        <Grad id={id("fin")} stops={finish(tone)} />
        <Grad id={id("steel")} stops={brushed(STEEL)} />
        <Grad id={id("top")} x2={1} y2={1} stops={topFace(t)} />
        <Grad id={id("stop")} x2={1} y2={1} stops={topFace(STEEL)} />
        <Grad id={id("in")} x2={0} y2={1} stops={INNER} />
        <Grad id={id("ao")} x2={0} y2={1} stops={AO} />
        <Radial id={id("hl")} stops={[[0, "#fff", tone === "obsidian" ? 0.22 : 0.6], [1, "#fff", 0]]} />
        <clipPath id={id("clip")}>
          <path d={body} />
        </clipPath>
        {tone === "steel" && <BrushGrain id={id("grain")} />}
      </defs>

      <ContactShadow id={id("cs")} cx={cx} rx={R * 1.45} ry={9} opacity={0.26} />
      <ContactShadow id={id("cs2")} cx={cx} cy={GROUND_Y - 0.5} rx={R * 0.95} ry={3} opacity={0.5} />

      <path d={body} fill={url("fin")} />
      <g clipPath={url("clip")}>
        {tone === "steel" && (
          <rect
            x={cx - R}
            y={s0}
            width={2 * R}
            height={GROUND_Y - s0}
            filter={url("grain")}
            opacity={0.16}
            style={{ mixBlendMode: "overlay" }}
          />
        )}
        <rect x={cx - R} y={s0} width={2 * R} height={GROUND_Y - s0} fill={url("ao")} />
        <ellipse cx={cx - R * 0.42} cy={s0 + shoulder * 0.45} rx={R * 0.5} ry={shoulder * 0.42} fill={url("hl")} />
        <path d={frontArc(cx, R, bot - 12)} fill="none" stroke="#000" strokeOpacity={0.14} />
        <path d={frontArc(cx, R, bot - 11)} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.08 : 0.35} />
      </g>
      {d.logoY && !open && <Wordmark cx={cx} y={d.logoY} tone={tone} />}

      {/* Bare steel ring where cap meets body. */}
      <path d={band(cx, N, ringTop, s0)} fill={url("steel")} />

      {open ? (
        <g>
          <path d={side(cx, neckR, lip, ringTop + 2)} fill={url("steel")} />
          {[0.3, 0.55, 0.8].map((k) => {
            const y = lip + (ringTop - lip) * k;
            const q = `M${cx - neckR},${y} Q${cx},${y + ry(neckR) * 2 + 3} ${cx + neckR},${y + 3}`;
            return (
              <g key={k} fill="none">
                <path d={q} stroke="#fff" strokeOpacity={0.75} strokeWidth={1.4} />
                <path d={q} transform="translate(0 1.8)" stroke="#000" strokeOpacity={0.3} />
              </g>
            );
          })}
          <ellipse cx={cx} cy={lip} rx={neckR} ry={ry(neckR)} fill={url("stop")} />
          <ellipse cx={cx} cy={lip + 0.6} rx={neckR - 4} ry={ry(neckR - 4)} fill={url("in")} />
        </g>
      ) : (
        <Cap d={d} tone={tone} url={url} />
      )}
    </g>
  );
}

function Cap({
  d,
  tone,
  url,
  at,
  inverted,
}: {
  d: Dims;
  tone: Tone;
  url: (k: string) => string;
  /** Override cap centre (for the cap resting beside an open flask). */
  at?: { cx: number; top: number };
  inverted?: boolean;
}) {
  const cx = at?.cx ?? d.cx;
  const top = at?.top ?? d.c;
  const { C, capH } = d;
  const e = ry(C);
  const g1 = inverted ? top + capH - 36 : top + 8;
  const g2 = inverted ? top + capH - 8 : top + 36;
  return (
    <g>
      <path d={side(cx, C, top, top + capH)} fill={url("fin")} />
      <path d={side(cx, C, top, top + capH)} fill={url("ao")} opacity={0.6} />
      {d.grip === "knurl" ? (
        <Knurl cx={cx} rx={C} y1={g1} y2={g2} />
      ) : (
        <g fill="none" stroke="#000" strokeOpacity={0.22}>
          <path d={frontArc(cx, C, top + 9)} />
          <path d={frontArc(cx, C, top + 12)} />
        </g>
      )}
      <path d={frontArc(cx, C, top + capH)} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={1.1} />
      {inverted ? (
        <g>
          <ellipse cx={cx} cy={top} rx={C} ry={e} fill={url("top")} />
          <ellipse cx={cx} cy={top + 0.5} rx={C - 3.5} ry={ry(C - 3.5)} fill={url("in")} />
          {/* Silicone seal seen inside the cap. */}
          <ellipse cx={cx} cy={top + 1.5} rx={C - 9} ry={ry(C - 9)} fill="none" stroke="#b9b2a7" strokeWidth={3} />
          <ellipse cx={cx} cy={top + 0.6} rx={C - 9} ry={ry(C - 9)} fill="none" stroke="#e6e1d9" strokeWidth={0.8} />
        </g>
      ) : (
        <g>
          <ellipse cx={cx} cy={top} rx={C} ry={e} fill={url("top")} />
          <path d={backArc(cx, C - 1, top)} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.18 : 0.7} />
        </g>
      )}
    </g>
  );
}

const FLASK: Dims = { cx: 200, c: 134, R: 48, N: 38, C: 40, capH: 50, shoulder: 24, grip: "knurl", logoY: 300 };
// Obsidian is the 500 ml Compact: same diameter, shorter body.
const COMPACT: Dims = { ...FLASK, c: 200, logoY: 340 };
const BOTTLE: Dims = { cx: 200, c: 222, R: 36, N: 27, C: 27, capH: 32, shoulder: 34, grip: "grooves", logoY: 352 };

const flask: ArtRenderer = ({ tone, view, uid }) => {
  const d = tone === "obsidian" ? COMPACT : FLASK;
  if (view === "front") return <Vessel uid={uid} tone={tone} d={d} />;
  // Alt: cap off, standing upside down beside the open flask.
  const left = { ...d, cx: 168 };
  const cap = { cx: 300, top: 466 - d.capH - ry(d.C) };
  return (
    <g>
      <Vessel uid={uid} tone={tone} d={left} open />
      <ContactShadow id={`${uid}-ccs`} cx={cap.cx} cy={466} rx={58} ry={7.5} opacity={0.24} />
      <ContactShadow id={`${uid}-ccs2`} cx={cap.cx} cy={465.5} rx={40} ry={2.6} opacity={0.45} />
      <Cap d={d} tone={tone} url={(k) => `url(#${uid}-${k})`} at={cap} inverted />
    </g>
  );
};

const bottle: ArtRenderer = ({ tone, view, uid }) => {
  const { cx, c } = BOTTLE;
  const fill = `url(#${uid}-loop)`;
  const loop =
    `M${cx - 21},${c + 1} L${cx - 21},${c - 13} C${cx - 21},${c - 34} ${cx + 21},${c - 34} ${cx + 21},${c - 13} L${cx + 21},${c + 1} Z ` +
    `M${cx - 11},${c + 1} L${cx - 11},${c - 12} C${cx - 11},${c - 23} ${cx + 11},${c - 23} ${cx + 11},${c - 12} L${cx + 11},${c + 1} Z`;
  return (
    <g>
      <defs>
        <Grad id={`${uid}-loop`} stops={finish(tone)} />
      </defs>
      <Vessel uid={uid} tone={tone} d={{ ...BOTTLE, logoY: view === "front" ? BOTTLE.logoY : undefined }} />
      {/* Carry loop: three-quarter turned on the front view, facing the camera on the alt. */}
      <ellipse cx={cx + 6} cy={c + 1.5} rx={view === "front" ? 14 : 24} ry={3} fill="#000" opacity={0.13} />
      <g transform={view === "front" ? `translate(${cx} 0) scale(0.45 1) translate(${-cx} 0)` : undefined}>
        <path d={loop} fillRule="evenodd" fill={TONES[tone].deep} transform="translate(8 0)" />
        <path d={loop} fillRule="evenodd" fill={fill} />
        <path
          d={`M${cx - 11},${c - 6} L${cx - 11},${c - 12} C${cx - 11},${c - 23} ${cx + 11},${c - 23} ${cx + 11},${c - 12} L${cx + 11},${c - 6}`}
          fill="none"
          stroke="#000"
          strokeOpacity={0.18}
          strokeWidth={1.5}
        />
      </g>
    </g>
  );
};

/* ---------- Table jug: steel body, oak lid, pouring lip, strap handle ---------- */

const jug: ArtRenderer = ({ tone, view, uid }) => {
  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;
  const cx = 200;
  const R = 70;
  const rim = 214;
  const bot = GROUND_Y - 1 - ry(R);
  const L = 61;
  const lidTop = 186;
  const t = TONES[tone];
  const handle =
    `M${cx + R - 4},252 C${cx + R + 30},250 ${cx + R + 48},262 ${cx + R + 48},296 L${cx + R + 48},338 ` +
    `C${cx + R + 48},366 ${cx + R + 32},380 ${cx + R - 4},382 L${cx + R - 4},368 C${cx + R + 24},366 ${cx + R + 34},356 ${cx + R + 34},336 ` +
    `L${cx + R + 34},298 C${cx + R + 34},274 ${cx + R + 22},266 ${cx + R - 4},266 Z`;
  const grain = rng(view === "front" ? 11 : 23);
  const spout = `M${cx - R + 6},${rim - 4} Q${cx - R - 14},${rim - 8} ${cx - R - 30},${rim - 9} Q${cx - R - 16},${rim + 2} ${cx - R + 6},${rim + 18} Z`;

  return (
    <g>
      <defs>
        <Grad id={id("fin")} stops={finish(tone)} />
        <Grad id={id("top")} x2={1} y2={1} stops={topFace(t)} />
        <Grad id={id("ao")} x2={0} y2={1} stops={AO} />
        <Grad id={id("hdl")} x2={1} y2={1} stops={[[0, t.hi], [0.45, t.mid], [1, t.deep]]} />
        <Grad id={id("spout")} x2={0.3} y2={1} stops={[[0, t.hi], [0.45, t.mid], [1, t.deep]]} />
        <Grad id={id("strap")} stops={[[0, t.mid], [0.25, t.hi], [0.55, t.mid], [1, t.deep]]} />
        <Grad id={id("oak")} stops={matte(OAK)} />
        <Grad id={id("oakTop")} x2={1} y2={1} stops={topFace(OAK)} />
        <Radial id={id("shd")} stops={[[0, "#000", 0.28], [1, "#000", 0]]} />
        <clipPath id={id("clip")}>
          <path d={side(cx, R, rim, bot)} />
        </clipPath>
        <clipPath id={id("lidTop")}>
          <ellipse cx={cx} cy={lidTop} rx={L} ry={ry(L)} />
        </clipPath>
        {tone === "steel" && <BrushGrain id={id("grain")} />}
      </defs>

      <ContactShadow id={id("cs")} cx={cx + 8} rx={R * 1.5} ry={11} opacity={0.24} />
      <ContactShadow id={id("cs2")} cx={cx} cy={GROUND_Y - 0.5} rx={R * 0.95} ry={3.5} opacity={0.5} />

      {view === "front" && (
        <g>
          <path d={handle} fill={url("hdl")} />
          {/* Pouring lip, tucked behind the body edge. */}
          <path d={spout} fill={url("spout")} />
          <path d={`M${cx - R + 6},${rim - 4} Q${cx - R - 14},${rim - 8} ${cx - R - 30},${rim - 9}`} fill="none" stroke="#fff" strokeOpacity={0.85} />
        </g>
      )}
      <path d={side(cx, R, rim, bot)} fill={url("fin")} />
      <g clipPath={url("clip")}>
        {tone === "steel" && (
          <rect x={cx - R} y={rim} width={2 * R} height={GROUND_Y - rim} filter={url("grain")} opacity={0.16} style={{ mixBlendMode: "overlay" }} />
        )}
        <rect x={cx - R} y={rim} width={2 * R} height={GROUND_Y - rim} fill={url("ao")} />
        <path d={frontArc(cx, R, bot - 14)} fill="none" stroke="#000" strokeOpacity={0.14} />
        <path d={frontArc(cx, R, bot - 13)} fill="none" stroke="#fff" strokeOpacity={0.35} />
        {view === "alt" && (
          // Handle faces the camera; its shadow falls down and to the right on the body.
          <g>
            <rect x={cx + 2} y={262} width={26} height={128} rx={12} fill={url("shd")} />
          </g>
        )}
      </g>

      {/* Rim, shadow gap, then the oak lid sitting inside. */}
      <ellipse cx={cx} cy={rim} rx={R} ry={ry(R)} fill={url("top")} />
      <ellipse cx={cx} cy={rim + 0.5} rx={R - 6} ry={ry(R - 6)} fill="#262727" />
      <path d={side(cx, L, lidTop, rim)} fill={url("oak")} />
      <path d={side(cx, L, lidTop, rim)} fill={url("ao")} opacity={0.5} />
      <g clipPath={`url(#${id("lidTop")})`}>
        <ellipse cx={cx} cy={lidTop} rx={L} ry={ry(L)} fill={url("oakTop")} />
        <g fill="none" stroke={OAK.deep} strokeOpacity={0.22} strokeWidth={0.7}>
          {Array.from({ length: 9 }, (_, i) => {
            const off = (i - 4) * 2.6 + grain() * 1.2;
            return view === "front" ? (
              <path key={i} d={`M${cx - L},${lidTop + off} Q${cx - 20},${lidTop + off - 2 + grain() * 3} ${cx},${lidTop + off} T${cx + L},${lidTop + off}`} />
            ) : (
              <path key={i} d={`M${cx + off * 5},${lidTop - 13} Q${cx + off * 5 + 3},${lidTop} ${cx + off * 5},${lidTop + 13}`} />
            );
          })}
        </g>
      </g>
      <path d={backArc(cx, L - 1, lidTop)} fill="none" stroke="#fff" strokeOpacity={0.45} />
      <path d={frontArc(cx, R, rim)} fill="none" stroke="#fff" strokeOpacity={0.55} />

      {view === "alt" && (
        <g>
          <rect x={cx - 9} y={250} width={18} height={134} rx={9} fill={url("strap")} />
          <rect x={cx - 9} y={250} width={18} height={134} rx={9} fill={url("ao")} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

/* ---------- Kettles: tapered kettle on a power base, with a V lip or a gooseneck spout ---------- */

// Phenolic handle, lid and base: black, with a lifted highlight so it still reads as round.
const BAKELITE: Ramp = { hi: "#7a7772", mid: "#33312e", lo: "#1f1e1c", deep: "#0e0e0d" };
const ROD: Stop[] = [
  [0, BAKELITE.deep],
  [0.22, BAKELITE.hi],
  [0.5, BAKELITE.mid],
  [1, BAKELITE.deep],
];

/** Shared kettle gradients. Enamel coats get a sharper sheen than the matte bottles. */
function KettleDefs({ id, tone, clip }: { id: (k: string) => string; tone: Tone; clip: string }) {
  const t = ramp(tone);
  return (
    <defs>
      <Grad id={id("fin")} stops={finish(tone)} />
      <Grad id={id("steel")} stops={brushed(STEEL)} />
      <Grad id={id("top")} x2={1} y2={1} stops={topFace(t)} />
      <Grad id={id("ao")} x2={0} y2={1} stops={AO} />
      <Grad id={id("light")} x2={0} y2={1} stops={[[0, "#fff", tone === "obsidian" ? 0.16 : 0.42], [1, "#fff", 0]]} />
      <Grad id={id("rod")} x2={0} y2={1} stops={ROD} />
      <Grad id={id("knob")} stops={matte(BAKELITE)} />
      <Grad id={id("knobTop")} x2={1} y2={1} stops={topFace(BAKELITE)} />
      <Radial id={id("hl")} stops={[[0, "#fff", tone === "obsidian" ? 0.2 : 0.55], [1, "#fff", 0]]} />
      <clipPath id={id("clip")}>
        <path d={clip} />
      </clipPath>
      {tone === "steel" && <BrushGrain id={id("grain")} />}
    </defs>
  );
}

/**
 * Tapered kettle on a black base: the body narrows from a wide foot to a flat lid, with a black
 * C-handle on one side and the spout on the other. "beak" is a short V lip; "gooseneck" a long thin tube.
 */
function electricKettle(spoutKind: "beak" | "gooseneck"): ArtRenderer {
  return function Kettle({ tone, view, uid }) {
    const id = (k: string) => `${uid}-${k}`;
    const url = (k: string) => `url(#${id(k)})`;
    const t = TONES[tone];
    // The alt view turns the kettle round: spout on the right, handle on the left.
    const s = view === "alt" ? -1 : 1;
    // Body sits off-centre so body, handle and spout together stay centred on x=200.
    const bx = 200 - s * (spoutKind === "gooseneck" ? 14 : 36);
    const X = (dx: number) => r2(bx + s * dx);

    const top = 168;
    const Rt = 56;
    const Rb = 100;
    const yb = 398;
    const body =
      `M${bx - Rt},${top} C${bx - 64},${top + 62} ${bx - Rb},${yb - 78} ${bx - Rb},${yb} ` +
      `A${Rb},${ry(Rb)} 0 0 0 ${bx + Rb},${yb} C${bx + Rb},${yb - 78} ${bx + 64},${top + 62} ${bx + Rt},${top} Z`;

    // Black foot under the body, then the wider power base it stands on.
    const Rp = 106;
    const baseTop = 424;
    const baseBot = r2(GROUND_Y - 1 - ry(Rp));

    const handle =
      `M${X(24)},154 L${X(118)},156 C${X(160)},158 ${X(178)},190 ${X(178)},236 ` +
      `C${X(178)},300 ${X(160)},350 ${X(120)},384 L${X(94)},400 L${X(90)},382 ` +
      `C${X(126)},352 ${X(144)},306 ${X(146)},250 C${X(148)},214 ${X(136)},192 ${X(112)},190 L${X(50)},190 Z`;
    const handleEdge = `M${X(30)},157 L${X(118)},159 C${X(156)},161 ${X(173)},190 ${X(174)},236`;

    const beak = `M${X(-50)},194 L${X(-108)},188 C${X(-102)},204 ${X(-88)},226 ${X(-62)},246 Z`;
    const neck =
      `M${X(-80)},392 C${X(-122)},388 ${X(-124)},330 ${X(-126)},280 ` +
      `C${X(-128)},226 ${X(-136)},198 ${X(-152)},196 L${X(-158)},204`;

    return (
      <g>
        <KettleDefs id={id} tone={tone} clip={body} />
        <defs>
          <Grad id={id("sp")} x1={s > 0 ? 0 : 1} x2={s > 0 ? 1 : 0} y2={0.6} stops={finish(tone)} />
        </defs>

        <ContactShadow id={id("cs")} cx={bx + 10} rx={Rp * 1.4} ry={12} opacity={0.24} />
        <ContactShadow id={id("cs2")} cx={bx} cy={GROUND_Y - 0.5} rx={Rp * 0.95} ry={3.5} opacity={0.5} />

        {/* Power base and the black foot of the kettle. */}
        <path d={side(bx, Rp, baseTop, baseBot)} fill={url("knob")} />
        <ellipse cx={bx} cy={baseTop} rx={Rp} ry={ry(Rp)} fill={url("knobTop")} />
        <path d={side(bx, 98, yb - 4, 420)} fill={url("knob")} />
        <path d={frontArc(bx, 98, 420)} fill="none" stroke="#fff" strokeOpacity={0.12} />

        {/* Spout first, so the body covers where it joins. */}
        {spoutKind === "beak" ? (
          <g>
            <path d={beak} fill={url("sp")} />
            <path d={beak} fill={url("ao")} opacity={0.5} />
            <path d={`M${X(-50)},194 L${X(-108)},188`} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.2 : 0.7} strokeWidth={1.4} />
          </g>
        ) : (
          <g>
            <path d={neck} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={11} strokeLinecap="round" transform="translate(1.5 2)" />
            <path d={neck} fill="none" stroke={t.lo} strokeWidth={10} strokeLinecap="round" />
            <path d={neck} fill="none" stroke={t.mid} strokeWidth={6} strokeLinecap="round" transform={`translate(${s * 1} -1)`} />
            <path d={neck} fill="none" stroke={t.hi} strokeOpacity={0.9} strokeWidth={1.6} strokeLinecap="round" transform={`translate(${s * 2.2} -2.4)`} />
          </g>
        )}

        <path d={body} fill={url("fin")} />
        <g clipPath={url("clip")}>
          {tone === "steel" && (
            <rect x={bx - Rb} y={top} width={2 * Rb} height={GROUND_Y - top} filter={url("grain")} opacity={0.16} style={{ mixBlendMode: "overlay" }} />
          )}
          <rect x={bx - Rb} y={top} width={2 * Rb} height={GROUND_Y - top} fill={url("ao")} />
          <ellipse cx={bx - 34} cy={top + 40} rx={34} ry={44} fill={url("hl")} />
          {tone !== "steel" && (
            <g fill="#fff">
              <ellipse cx={bx - 52} cy={312} rx={4} ry={74} opacity={tone === "obsidian" ? 0.16 : 0.4} transform={`rotate(8 ${bx - 52} 312)`} />
              <ellipse cx={bx + 76} cy={330} rx={2.5} ry={48} opacity={0.14} transform={`rotate(-12 ${bx + 76} 330)`} />
            </g>
          )}
        </g>
        {view === "front" && <Wordmark cx={bx} y={344} tone={tone} />}

        {/* Rim and the flat black lid. */}
        <ellipse cx={bx} cy={top} rx={Rt} ry={ry(Rt)} fill={url("top")} />
        <path d={backArc(bx, Rt - 1, top)} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.16 : 0.6} />
        <path d={side(bx, 46, top - 7, top)} fill={url("knob")} />
        <ellipse cx={bx} cy={top - 7} rx={46} ry={ry(46)} fill={url("knobTop")} />
        <path d={backArc(bx, 45, top - 7)} fill="none" stroke="#fff" strokeOpacity={0.22} />

        {/* Handle: top bar over the lid, grip down the side. */}
        <path d={handle} fill="#000" opacity={0.2} transform="translate(2 2.5)" />
        <path d={handle} fill={url("knob")} />
        <path d={handleEdge} fill="none" stroke="#fff" strokeOpacity={0.24} strokeWidth={1.4} strokeLinecap="round" />
      </g>
    );
  };
}

const kettle = electricKettle("beak");
const gooseneck = electricKettle("gooseneck");

export const METAL_ART: ArtMap = { flask, bottle, jug, kettle, gooseneck };
