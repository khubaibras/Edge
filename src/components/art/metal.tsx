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

/* ---------- Kettles: domed whistling kettle and slim pour-over kettle ---------- */

// Phenolic handle, knob and whistle cap: black, with a lifted highlight so it still reads as round.
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

/** Black phenolic knob on a short stem, its top at `y`. */
function Knob({ cx, y, r, url }: { cx: number; y: number; r: number; url: (k: string) => string }) {
  return (
    <g>
      <path d={side(cx, r * 0.45, y + 8, y + 22)} fill={url("knob")} />
      <path d={side(cx, r, y, y + 9)} fill={url("knob")} />
      <ellipse cx={cx} cy={y} rx={r} ry={ry(r)} fill={url("knobTop")} />
      <path d={backArc(cx, r - 1, y)} fill="none" stroke="#fff" strokeOpacity={0.3} />
    </g>
  );
}

const kettle: ArtRenderer = ({ tone, view, uid }) => {
  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;
  const cx = 200;
  // The alt view turns the kettle round: spout on the left, handle folded back.
  const s = view === "alt" ? -1 : 1;
  const X = (dx: number) => cx + s * dx;
  const Rb = 104;
  const eb = ry(Rb);
  const yb = r2(GROUND_Y - 1 - eb);
  const top = 268;
  const Rt = 50;
  const body =
    `M${cx - Rt},${top} C${cx - 86},${top + 6} ${cx - 115},${top + 44} ${cx - 116},${top + 100} ` +
    `C${cx - 117},${yb - 34} ${cx - 111},${yb - 8} ${cx - Rb},${yb} A${Rb},${eb} 0 0 0 ${cx + Rb},${yb} ` +
    `C${cx + 111},${yb - 8} ${cx + 117},${yb - 34} ${cx + 116},${top + 100} C${cx + 115},${top + 44} ${cx + 86},${top + 6} ${cx + Rt},${top} Z`;
  const spout = `M${X(96)},368 C${X(126)},356 ${X(149)},328 ${X(159)},298 L${X(176)},304 C${X(167)},350 ${X(141)},400 ${X(106)},422 Z`;
  const lidR = 52;
  const lidY = 260;
  const dome =
    `M${cx - lidR},${lidY} C${cx - 50},${lidY - 12} ${cx - 28},${lidY - 18} ${cx},${lidY - 18} ` +
    `C${cx + 28},${lidY - 18} ${cx + 50},${lidY - 12} ${cx + lidR},${lidY} A${lidR},${ry(lidR)} 0 0 1 ${cx - lidR},${lidY} Z`;
  const up = view === "front";
  const hTop = up ? 194 : 240;
  const wire =
    `M${cx - 82},292 C${cx - 86},${up ? 240 : 266} ${cx - 64},${hTop + 6} ${cx - 36},${hTop} L${cx + 36},${hTop} ` +
    `C${cx + 64},${hTop + 6} ${cx + 86},${up ? 240 : 266} ${cx + 82},292`;

  const handle = (
    <g>
      <path d={wire} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={6.5} strokeLinecap="round" transform="translate(1.2 1.6)" />
      <path d={wire} fill="none" stroke={STEEL.lo} strokeWidth={5.5} strokeLinecap="round" />
      <path d={wire} fill="none" stroke={STEEL.hi} strokeWidth={1.6} strokeLinecap="round" transform="translate(-0.8 -1.1)" />
      <rect x={cx - 47} y={hTop - 12} width={94} height={24} rx={12} fill={url("rod")} />
      <path d={`M${cx - 38},${hTop - 7} L${cx + 38},${hTop - 7}`} stroke="#fff" strokeOpacity={0.22} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );

  return (
    <g>
      <KettleDefs id={id} tone={tone} clip={body} />
      <defs>
        <Grad id={id("sp")} x1={s > 0 ? 0 : 1} x2={s > 0 ? 1 : 0} y2={0.45} stops={finish(tone)} />
      </defs>

      <ContactShadow id={id("cs")} cx={cx + 10} rx={Rb * 1.45} ry={12} opacity={0.24} />
      <ContactShadow id={id("cs2")} cx={cx} cy={GROUND_Y - 0.5} rx={Rb * 0.95} ry={3.5} opacity={0.5} />

      {!up && handle}

      <path d={body} fill={url("fin")} />
      <g clipPath={url("clip")}>
        {tone === "steel" && (
          <rect x={cx - 117} y={top} width={234} height={GROUND_Y - top} filter={url("grain")} opacity={0.16} style={{ mixBlendMode: "overlay" }} />
        )}
        <rect x={cx - 117} y={top} width={234} height={GROUND_Y - top} fill={url("ao")} />
        {/* The shoulder faces the light, so it reads brighter than the walls. */}
        <rect x={cx - 117} y={top} width={234} height={74} fill={url("light")} />
        <ellipse cx={cx - 50} cy={top + 46} rx={46} ry={32} fill={url("hl")} />
        {tone !== "steel" && (
          <g fill="#fff">
            <ellipse cx={cx - 72} cy={366} rx={4.5} ry={50} opacity={tone === "obsidian" ? 0.16 : 0.42} />
            <ellipse cx={cx + 94} cy={372} rx={2.5} ry={36} opacity={0.14} />
          </g>
        )}
        <path d={frontArc(cx, 110, yb - 14, ry(110))} fill="none" stroke="#000" strokeOpacity={0.18} />
        <path d={frontArc(cx, 110, yb - 13, ry(110))} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.08 : 0.3} />
        <ellipse cx={X(104)} cy={424} rx={18} ry={7} fill="#000" opacity={0.16} />
      </g>
      {up && <Wordmark cx={cx} y={404} tone={tone} />}

      {/* Spout with its whistle cap. */}
      <path d={spout} fill={url("sp")} />
      <path d={spout} fill={url("ao")} opacity={0.4} />
      <path d={`M${X(98)},372 C${X(127)},360 ${X(149)},331 ${X(158)},302`} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.2 : 0.55} strokeWidth={1.4} />
      <g transform={`translate(${X(170)} 296) rotate(${s * 21})`}>
        <rect x={-14} y={-10} width={28} height={19} rx={6} fill={url("knob")} />
        <path d="M-9 -6.5 L9 -6.5" stroke="#fff" strokeOpacity={0.3} strokeWidth={1.3} strokeLinecap="round" />
      </g>

      {/* Lid: flange, dome and knob. */}
      <path d={side(cx, lidR, lidY, lidY + 8)} fill={url("fin")} />
      <path d={frontArc(cx, lidR, lidY + 8)} fill="none" stroke="#000" strokeOpacity={0.3} />
      <path d={dome} fill={url("fin")} />
      <path d={dome} fill={url("light")} />
      <Knob cx={cx} y={220} r={16} url={url} />

      {up && handle}
    </g>
  );
};

const gooseneck: ArtRenderer = ({ tone, view, uid }) => {
  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${id(k)})`;
  const cx = 200;
  const s = view === "alt" ? -1 : 1;
  const X = (dx: number) => cx + s * dx;
  const R = 76;
  const Rt = 66;
  const top = 300;
  const e = ry(R);
  const yb = r2(GROUND_Y - 1 - e);
  const body = `M${cx - Rt},${top} L${cx - R},${yb} A${R},${e} 0 0 0 ${cx + R},${yb} L${cx + Rt},${top} Z`;
  const spout = `M${X(64)},430 C${X(100)},428 ${X(108)},392 ${X(112)},350 C${X(116)},306 ${X(140)},282 ${X(164)},304`;
  const handle = `M${X(-62)},320 C${X(-114)},314 ${X(-126)},352 ${X(-122)},380 C${X(-118)},410 ${X(-104)},428 ${X(-72)},430`;
  const t = TONES[tone];

  return (
    <g>
      <KettleDefs id={id} tone={tone} clip={body} />
      <ContactShadow id={id("cs")} cx={cx + 12} rx={R * 1.6} ry={11} opacity={0.24} />
      <ContactShadow id={id("cs2")} cx={cx} cy={GROUND_Y - 0.5} rx={R * 0.95} ry={3.2} opacity={0.5} />

      {/* Handle behind the body edge. */}
      <path d={handle} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={17} strokeLinecap="round" transform="translate(2 2)" />
      <path d={handle} fill="none" stroke={BAKELITE.mid} strokeWidth={16} strokeLinecap="round" />
      <path d={handle} fill="none" stroke={BAKELITE.hi} strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round" transform={`translate(${s * -3} -3)`} />

      <path d={body} fill={url("fin")} />
      <g clipPath={url("clip")}>
        {tone === "steel" && (
          <rect x={cx - R} y={top} width={2 * R} height={GROUND_Y - top} filter={url("grain")} opacity={0.16} style={{ mixBlendMode: "overlay" }} />
        )}
        <rect x={cx - R} y={top} width={2 * R} height={GROUND_Y - top} fill={url("ao")} />
        <ellipse cx={cx - R * 0.42} cy={top + 28} rx={R * 0.5} ry={26} fill={url("hl")} />
        <path d={frontArc(cx, R, yb - 13)} fill="none" stroke="#000" strokeOpacity={0.16} />
        <path d={frontArc(cx, R, yb - 12)} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.08 : 0.32} />
      </g>
      {view === "front" && <Wordmark cx={cx} y={398} tone={tone} />}

      {/* Shoulder, lid and knob. */}
      <ellipse cx={cx} cy={top} rx={Rt} ry={ry(Rt)} fill={url("top")} />
      <path d={backArc(cx, Rt - 1, top)} fill="none" stroke="#fff" strokeOpacity={tone === "obsidian" ? 0.16 : 0.6} />
      <path d={side(cx, 46, 290, 300)} fill={url("fin")} />
      <ellipse cx={cx} cy={290} rx={46} ry={ry(46)} fill={url("top")} />
      <path d={frontArc(cx, 46, 300)} fill="none" stroke="#000" strokeOpacity={0.32} />
      <Knob cx={cx} y={266} r={13} url={url} />

      {/* Gooseneck spout: one tube, lit along its upper edge. */}
      <ellipse cx={X(66)} cy={430} rx={9} ry={10} fill={t.lo} />
      <path d={spout} fill="none" stroke="#000" strokeOpacity={0.2} strokeWidth={11} strokeLinecap="round" transform="translate(1.5 2)" />
      <path d={spout} fill="none" stroke={t.lo} strokeWidth={10} strokeLinecap="round" />
      <path d={spout} fill="none" stroke={t.mid} strokeWidth={6} strokeLinecap="round" transform={`translate(${s * -1} -1)`} />
      <path d={spout} fill="none" stroke={t.hi} strokeOpacity={0.9} strokeWidth={1.6} strokeLinecap="round" transform={`translate(${s * -2.4} -2.6)`} />
    </g>
  );
};

export const METAL_ART: ArtMap = { flask, bottle, jug, kettle, gooseneck };
