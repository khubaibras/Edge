import type { Tone } from "@/lib/types";
import { brushed, frontArc, Grad, side } from "./metal";
import { ContactShadow, GROUND_Y, TONES, type ArtMap, type ArtRenderer } from "./shared";

const INK = "#151413";
const CX = 200;

type Glass = { tint: string; tintOp: number; edge: number };
const glassOf = (tone: Tone): Glass =>
  tone === "smoke"
    ? { tint: TONES.smoke.lo, tintOp: 0.34, edge: 0.55 }
    : { tint: TONES.clear.lo, tintOp: 0.12, edge: 0.42 };

/** Round trig output so server and browser serialise identical SVG attributes. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Seeded PRNG so speckles render identically on server and client. */
function prng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Shared gradients: edge refraction across the body, vertical highlight fade, warm caustic, thick-base lens. */
function GlassDefs({ id, g }: { id: string; g: Glass }) {
  return (
    <defs>
      <linearGradient id={`${id}-x`} x1="0" x2="1">
        <stop offset="0" stopColor={INK} stopOpacity={g.edge} />
        <stop offset="0.025" stopColor={INK} stopOpacity={g.edge * 0.6} />
        <stop offset="0.06" stopColor={INK} stopOpacity={g.edge * 0.1} />
        <stop offset="0.1" stopColor="#fff" stopOpacity="0.32" />
        <stop offset="0.17" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.82" stopColor={INK} stopOpacity={g.edge * 0.08} />
        <stop offset="0.93" stopColor={INK} stopOpacity={g.edge * 0.32} />
        <stop offset="0.975" stopColor={INK} stopOpacity={g.edge * 0.7} />
        <stop offset="1" stopColor={INK} stopOpacity={g.edge} />
      </linearGradient>
      <linearGradient id={`${id}-y`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.16" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="0.72" stopColor="#fff" stopOpacity="0.6" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-r`} x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.25" stopColor="#fff" stopOpacity="1" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="0.92" stopColor="#fff" stopOpacity="0.85" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={INK} stopOpacity={g.edge * 0.15} />
        <stop offset="0.55" stopColor={INK} stopOpacity={g.edge * 0.55} />
        <stop offset="1" stopColor={INK} stopOpacity={g.edge * 0.25} />
      </linearGradient>
      <radialGradient id={`${id}-c`}>
        <stop offset="0" stopColor="#fffbf1" stopOpacity="1" />
        <stop offset="0.5" stopColor="#fffbf1" stopOpacity="0.55" />
        <stop offset="1" stopColor="#fffbf1" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Pale contact + cast shadow (glass transmits light) and a warm caustic inside it. */
function Ground({ id, rx, cx = CX }: { id: string; rx: number; cx?: number }) {
  return (
    <>
      <ContactShadow id={`${id}-s1`} cx={cx + 16} rx={rx * 1.45} ry={12} opacity={0.11} />
      <ContactShadow id={`${id}-s0`} cx={cx + 2} rx={rx * 1.1} ry={7} opacity={0.22} />
      <ellipse cx={cx + rx * 0.3} cy={GROUND_Y + 0.5} rx={rx * 0.55} ry={3.6} fill={`url(#${id}-c)`} />
    </>
  );
}

/** Tint, edge refraction and silhouette line for a glass outline. */
function Body({ d, id, g }: { d: string; id: string; g: Glass }) {
  return (
    <>
      <path d={d} fill={g.tint} fillOpacity={g.tintOp} />
      <path d={d} fill={`url(#${id}-x)`} />
    </>
  );
}
/** Refractive edge: soft dark band just inside the silhouette plus a crisp outline. */
function Outline({ d, id, g, w = 1 }: { d: string; id: string; g: Glass; w?: number }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <g fill="none" strokeLinejoin="round">
        <path d={d} clipPath={`url(#${id})`} stroke={INK} strokeOpacity={g.edge * 0.22} strokeWidth={7} />
        <path d={d} clipPath={`url(#${id})`} stroke={INK} strokeOpacity={g.edge * 0.3} strokeWidth={3} />
        <path d={d} stroke={INK} strokeOpacity={g.edge * 0.85} strokeWidth={w} />
      </g>
    </>
  );
}

/** Tapered vertical highlight strip. */
const strip = (x1: number, y1: number, x2: number, y2: number, w1: number, w2: number) =>
  `M${x1} ${y1}L${x1 + w1} ${y1}L${x2 + w2} ${y2}L${x2} ${y2}Z`;

/** Lower (front) half of an ellipse, left to right. */
const front = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`;

/** Glass rim: opening, wall thickness, back edge and a bright front lip. */
function Rim({ id, g, cy, rx, ry, wall = 3 }: { id: string; g: Glass; cy: number; rx: number; ry: number; wall?: number }) {
  return (
    <>
      <ellipse cx={CX} cy={cy} rx={rx} ry={ry} fill="#fff" fillOpacity={0.05} stroke={INK} strokeOpacity={g.edge * 0.6} strokeWidth={0.9} />
      <ellipse cx={CX} cy={cy + 0.6} rx={rx - wall} ry={ry - wall * 0.35} fill="none" stroke={INK} strokeOpacity={g.edge * 0.32} strokeWidth={0.7} />
      <path d={front(CX, cy + 0.4, rx - 1, ry - 0.3)} fill="none" stroke={`url(#${id}-r)`} strokeWidth={1.7} />
      <ellipse cx={CX - rx * 0.52} cy={cy + ry * 0.84} rx={rx * 0.1} ry={1.3} fill="#fff" />
    </>
  );
}

/** Thick refracting base: dark lens between inner floor and outer bottom, bright inner arc. */
function Base({
  id,
  g,
  yF,
  rF,
  ryF,
  yB,
  rB,
  ryB,
}: { id: string; g: Glass; yF: number; rF: number; ryF: number; yB: number; rB: number; ryB: number }) {
  const lens = `M${CX - rF} ${yF}L${CX - rB} ${yB}A${rB} ${ryB} 0 0 0 ${CX + rB} ${yB}L${CX + rF} ${yF}A${rF} ${ryF} 0 0 1 ${CX - rF} ${yF}Z`;
  return (
    <>
      <path d={lens} fill={`url(#${id}-b)`} />
      <ellipse cx={CX} cy={yF} rx={rF - 2} ry={ryF} fill="none" stroke={INK} strokeOpacity={g.edge * 0.35} strokeWidth={0.8} />
      <path d={front(CX, yF + 0.5, rF - 3, ryF - 0.5)} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.5} />
      <path d={front(CX, yF + 3.5, rF - 6, ryF - 1)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.45} strokeWidth={1} />
      <path d={front(CX, yB - 1.5, rB - 3, ryB - 1.5)} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={1} />
    </>
  );
}

/* ---------------------------------------------------------------- Rib Tumbler */

const T = { yT: 272, rT: 75, ryT: 13, yB: 450, rB: 66, ryB: 11.5, yF: 432 };
const tR = (y: number) => T.rT + ((T.rB - T.rT) * (y - T.yT)) / (T.yB - T.yT);
const tRy = (y: number) => T.ryT + ((T.ryB - T.ryT) * (y - T.yT)) / (T.yB - T.yT);
const TUMBLER = `M${CX - T.rT} ${T.yT}L${CX - T.rB} ${T.yB}A${T.rB} ${T.ryB} 0 0 0 ${CX + T.rB} ${T.yB}L${CX + T.rT} ${T.yT}A${T.rT} ${T.ryT} 0 0 0 ${CX - T.rT} ${T.yT}Z`;

/** Vertical ribs around a tapered cylinder, compressing toward the silhouette. */
function Ribs({ g, back = false, n = 16 }: { g: Glass; back?: boolean; n?: number }) {
  const y1 = T.yT + 22;
  const y2 = T.yB - 5;
  return (
    <g strokeLinecap="round" opacity={back ? 0.22 : 1}>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + ((i + (back ? 0 : 0.5)) * Math.PI) / n;
        const s = Math.sin(a);
        const c = Math.cos(a);
        const sp = ((T.rT * Math.PI) / n) * c;
        const p = (y: number) => [r3(CX + (tR(y) - 1.5) * s), r3(y + (back ? -1 : 1) * tRy(y) * c)] as const;
        const [ax, ay] = p(y1);
        const [bx, by] = p(y2);
        const off = r3(sp * 0.45);
        // light gathers in the softbox zone (left) and a thin rim zone (right)
        const lit = 0.06 + 0.55 * Math.exp(-(((s + 0.55) / 0.22) ** 2)) + 0.35 * Math.exp(-(((s - 0.8) / 0.09) ** 2));
        return (
          <g key={i}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#fff" strokeOpacity={r3(Math.min(lit, 0.7))} strokeWidth={r3(0.5 + sp * 0.32)} />
            <line
              x1={r3(ax + off)}
              y1={ay}
              x2={r3(bx + off)}
              y2={by}
              stroke={INK}
              strokeOpacity={r3(g.edge * (0.1 + 0.6 * (1 - c) ** 1.5))}
              strokeWidth={r3(0.35 + sp * 0.14)}
            />
          </g>
        );
      })}
    </g>
  );
}

const Tumbler: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const wet = view === "alt";
  const yW = 318;
  const rW = tR(yW) - 2.5;
  const ryW = tRy(yW) - 0.8;
  // Clip regions above/below the water line (front arc), so back ribs can refract under water.
  const above = `M0 0H400V${yW}H${CX + rW}A${rW} ${ryW} 0 0 1 ${CX - rW} ${yW}H0Z`;
  const below = `M0 500H400V${yW}H${CX + rW}A${rW} ${ryW} 0 0 1 ${CX - rW} ${yW}H0Z`;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-body`}>
          <path d={TUMBLER} />
        </clipPath>
        <clipPath id={`${uid}-up`}>
          <path d={above} />
        </clipPath>
        <clipPath id={`${uid}-dn`}>
          <path d={below} />
        </clipPath>
        <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6e2e0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#c3d3d0" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <Ground id={uid} rx={T.rB} />
      <Body d={TUMBLER} id={uid} g={g} />
      <g clipPath={`url(#${uid}-body)`}>
        {wet ? (
          <>
            <g clipPath={`url(#${uid}-up)`}>
              <Ribs g={g} back />
            </g>
            <g clipPath={`url(#${uid}-dn)`} transform={`translate(${CX} 0) scale(1.14 1) translate(${-CX} 0)`}>
              <Ribs g={g} back />
            </g>
            <path d={`${front(CX, yW, rW, ryW)}V${T.yF}H${CX - rW}Z`} fill={`url(#${uid}-w)`} />
            <ellipse cx={CX} cy={yW} rx={rW} ry={ryW} fill="#eef3f2" fillOpacity={0.45} stroke={INK} strokeOpacity={g.edge * 0.3} strokeWidth={0.7} />
            <path d={front(CX, yW + 0.3, rW - 0.5, ryW - 0.3)} fill="none" stroke="#fff" strokeOpacity={0.95} strokeWidth={1.4} />
            <path d={front(CX, yW + 3, rW - 1, ryW - 0.5)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.4} strokeWidth={1.4} />
          </>
        ) : (
          <Ribs g={g} back />
        )}
        <Ribs g={g} />
        <Base id={uid} g={g} yF={T.yF} rF={tR(T.yF) - 3} ryF={tRy(T.yF) - 1} yB={T.yB} rB={T.rB} ryB={T.ryB} />
        <g opacity={0.8}>
          <path d={strip(CX - T.rT * 0.7, T.yT + 18, CX - T.rB * 0.7, T.yB - 14, 22, 15)} fill={`url(#${uid}-y)`} opacity={0.22} />
          <path d={strip(CX - T.rT * 0.6, T.yT + 18, CX - T.rB * 0.6, T.yB - 14, 5, 3)} fill={`url(#${uid}-y)`} opacity={0.7} />
          <path d={strip(CX - T.rT + 4, T.yT + 16, CX - T.rB + 4, T.yB - 8, 2, 1.4)} fill={`url(#${uid}-y)`} />
          <path d={strip(CX + T.rT * 0.8, T.yT + 24, CX + T.rB * 0.8, T.yB - 16, 2.6, 1.6)} fill={`url(#${uid}-y)`} opacity={0.6} />
        </g>
      </g>
      <Outline d={TUMBLER} id={`${uid}-o`} g={g} />
      <Rim id={uid} g={g} cy={T.yT} rx={T.rT} ry={T.ryT} />
    </>
  );
};

/* ---------------------------------------------------------------- Double-Wall Glass */

const DW_OUTER =
  "M136 252C133 320 127 402 141 436C150 456 176 461 200 461C224 461 250 456 259 436C273 402 267 320 264 252A64 12 0 0 0 136 252Z";
const DW_INNER =
  "M141 253C140 300 142 350 156 377C168 398 186 403 200 403C214 403 232 398 244 377C258 350 260 300 259 253A59 11 0 0 0 141 253Z";

const DoubleWall: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const yE = 316;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-in`}>
          <path d={DW_INNER} />
        </clipPath>
        <linearGradient id={`${uid}-cof`} x1="0" x2="1">
          <stop offset="0" stopColor="#1a120d" />
          <stop offset="0.18" stopColor="#4a2f1d" />
          <stop offset="0.45" stopColor="#2e1d13" />
          <stop offset="1" stopColor="#120c08" />
        </linearGradient>
        <radialGradient id={`${uid}-crema`} cx="0.42" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#d2a777" />
          <stop offset="0.7" stopColor="#b9875a" />
          <stop offset="1" stopColor="#8d5d36" />
        </radialGradient>
      </defs>
      <Ground id={uid} rx={58} />
      <Body d={DW_OUTER} id={uid} g={g} />
      {view === "alt" && (
        <g clipPath={`url(#${uid}-in)`}>
          <rect x={130} y={yE} width={140} height={100} fill={`url(#${uid}-cof)`} />
          <path d={`M${CX - 57} ${yE}A57 10.5 0 0 0 ${CX + 57} ${yE}V${yE + 7}A57 10.5 0 0 1 ${CX - 57} ${yE + 7}Z`} fill="#6e4426" />
          <ellipse cx={CX} cy={yE} rx={57} ry={10.5} fill={`url(#${uid}-crema)`} />
          <ellipse cx={CX - 14} cy={yE - 2} rx={18} ry={3} fill="#e6c49b" opacity={0.45} />
        </g>
      )}
      {/* inner vessel floating inside the outer wall */}
      <path d={DW_INNER} fill={g.tint} fillOpacity={g.tintOp * 0.45} />
      <path d={DW_INNER} fill={`url(#${uid}-x)`} opacity={0.55} />
      <path d={DW_INNER} fill="none" stroke={INK} strokeOpacity={g.edge * 0.5} strokeWidth={0.9} />
      <path d="M166 390C178 399 190 401 200 401" fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M205 400C217 400 231 395 240 378" fill="none" stroke={INK} strokeOpacity={g.edge * 0.32} strokeWidth={1} strokeLinecap="round" />
      <path d={strip(CX - 59 * 0.66, 268, CX - 44 * 0.66, 370, 4, 2)} fill={`url(#${uid}-y)`} opacity={0.6} />
      {/* thick outer base */}
      <Base id={uid} g={g} yF={444} rF={45} ryF={7.5} yB={452} rB={52} ryB={9} />
      <g opacity={0.85}>
        <path d="M143 272C139 330 136 398 147 430" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={7} strokeLinecap="round" />
        <path d="M139 268C136 330 132 398 143 432" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={1.6} strokeLinecap="round" />
        <path d="M253 280C258 330 260 390 251 424" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      </g>
      <Outline d={DW_OUTER} id={`${uid}-o`} g={g} />
      <Rim id={uid} g={g} cy={252} rx={64} ry={12} wall={5} />
    </>
  );
};

/* ---------------------------------------------------------------- Pour Carafe */

const CARAFE =
  "M175 147C175 150 178 152 178 158L178 194C178 234 140 246 140 296L140 451A60 11 0 0 0 260 451L260 296C260 246 222 234 222 194L222 158C222 152 225 150 225 147A25 5 0 0 0 175 147Z";

/** Cork lying on its side: rounded back end, cap body, tapered plug. */
const CORK_SIDE = "M266 410A6 26 0 0 0 266 462L291 462L291 457L318 455L318 417L291 415L291 410Z";

const corkDots = (() => {
  const r = prng(7);
  return Array.from({ length: 90 }, () => ({ x: r(), y: r(), r: 0.35 + r() * 0.95, o: 0.2 + r() * 0.45, light: r() < 0.3 }));
})();

function CorkDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-k`} x1="0" x2="1">
        <stop offset="0" stopColor="#a7835e" />
        <stop offset="0.22" stopColor="#dcc3a0" />
        <stop offset="0.55" stopColor="#c4a17a" />
        <stop offset="1" stopColor="#8a6a4a" />
      </linearGradient>
      <linearGradient id={`${id}-kv`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dcc3a0" />
        <stop offset="0.5" stopColor="#c09c75" />
        <stop offset="1" stopColor="#8a6a4a" />
      </linearGradient>
    </defs>
  );
}

/** Cork speckle texture inside a box. */
const Speckle = ({ x, y, w, h, clip }: { x: number; y: number; w: number; h: number; clip: string }) => (
  <g clipPath={`url(#${clip})`}>
    {corkDots.map((d, i) => (
      <circle key={i} cx={x + d.x * w} cy={y + d.y * h} r={d.r} fill={d.light ? "#efdcbf" : "#6b4c31"} fillOpacity={d.o} />
    ))}
  </g>
);

const Carafe: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const wet = view === "alt";
  const yW = 320;
  const corkUp = "M173 120L174 147L176 147L178 178A21 4 0 0 0 220 178L222 147L224 147L227 120Z";
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <CorkDefs id={uid} />
      <defs>
        <clipPath id={`${uid}-ck`}>
          <path d={corkUp} />
          <ellipse cx={CX} cy={120} rx={27} ry={5.5} />
        </clipPath>
        <clipPath id={`${uid}-cl`}>
          <path d={CORK_SIDE} />
        </clipPath>
        <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6e2e0" stopOpacity="0.34" />
          <stop offset="1" stopColor="#c3d3d0" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g transform={wet ? "translate(-22 0)" : undefined}>
        <Ground id={uid} rx={60} />
        <Body d={CARAFE} id={uid} g={g} />
        {wet && (
          <>
            <path d={`${front(CX, yW, 58, 10.5)}V438H${CX - 58}Z`} fill={`url(#${uid}-w)`} />
            <ellipse cx={CX} cy={yW} rx={58} ry={10.5} fill="#eef3f2" fillOpacity={0.45} stroke={INK} strokeOpacity={g.edge * 0.3} strokeWidth={0.7} />
            <path d={front(CX, yW + 0.3, 57.5, 10.2)} fill="none" stroke="#fff" strokeOpacity={0.95} strokeWidth={1.4} />
            <path d={front(CX, yW + 3, 57, 10)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.4} strokeWidth={1.4} />
          </>
        )}
        {!wet && (
          // cork plug inside the neck, seen through the glass
          <g opacity={0.82}>
            <path d={corkUp} fill={`url(#${uid}-k)`} />
            <Speckle x={170} y={114} w={60} h={70} clip={`${uid}-ck`} />
            <ellipse cx={CX} cy={120} rx={27} ry={5.5} fill="#dbc29f" />
            <Speckle x={172} y={114} w={56} h={12} clip={`${uid}-ck`} />
            <path d={front(CX, 147, 24, 4)} fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={0.8} />
          </g>
        )}
        <Base id={uid} g={g} yF={438} rF={56} ryF={10} yB={451} rB={60} ryB={11} />
        <g opacity={0.85}>
          <path d={strip(CX - 60 * 0.72, 302, CX - 60 * 0.72, 428, 22, 16)} fill={`url(#${uid}-y)`} opacity={0.22} />
          <path d={strip(CX - 60 * 0.6, 302, CX - 60 * 0.6, 428, 6, 4)} fill={`url(#${uid}-y)`} />
          <path d={strip(144, 300, 144, 440, 1.8, 1.4)} fill={`url(#${uid}-y)`} />
          <path d={strip(CX + 60 * 0.8, 306, CX + 60 * 0.8, 424, 2.6, 1.8)} fill={`url(#${uid}-y)`} opacity={0.6} />
          <path d="M148 288C149 256 170 242 176 218" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={4} strokeLinecap="round" />
          <path d={strip(183, 162, 183, 204, 3, 2.4)} fill={`url(#${uid}-y)`} />
          <path d={strip(214, 162, 214, 194, 1.4, 1.2)} fill={`url(#${uid}-y)`} opacity={0.6} />
        </g>
        <Outline d={CARAFE} id={`${uid}-o`} g={g} />
        <Rim id={uid} g={g} cy={147} rx={25} ry={5} wall={2.4} />
        {wet && <ellipse cx={CX} cy={147.5} rx={21} ry={3.6} fill={INK} fillOpacity={0.12} />}
      </g>
      {wet && (
        // stopper resting on its side, plug end towards the viewer
        <g>
          <ContactShadow id={`${uid}-ks`} cx={292} rx={38} ry={5} opacity={0.34} />
          <path d={CORK_SIDE} fill={`url(#${uid}-kv)`} />
          <ellipse cx={291} cy={436} rx={5} ry={26} fill="#d3b690" />
          <path d="M291 415L318 417L318 455L291 457Z" fill={`url(#${uid}-kv)`} />
          <Speckle x={256} y={406} w={66} h={60} clip={`${uid}-cl`} />
          <ellipse cx={318} cy={436} rx={5.5} ry={19} fill="#dcc29d" stroke="#7a5a3c" strokeOpacity={0.3} strokeWidth={0.6} />
          <path d="M267 412.5H289" stroke="#f3e3c8" strokeOpacity={0.75} strokeWidth={1.4} strokeLinecap="round" />
          <path d="M293 418H316" stroke="#f3e3c8" strokeOpacity={0.6} strokeWidth={1.1} strokeLinecap="round" />
        </g>
      )}
    </>
  );
};

/* ---------------------------------------------------------------- Coupe */

const BOWL = "M114 205C116 246 160 280 196 283L204 283C240 280 284 246 286 205A86 15 0 0 0 114 205Z";
const STEM =
  "M194 283C197 290 198.3 300 198.3 316L198.4 424C198.6 436 186 443 160 447C150 448.5 145 450 144 452A56 9.5 0 0 0 256 452C255 450 250 448.5 240 447C214 443 201.4 436 201.6 424L201.7 316C201.7 300 203 290 206 283Z";

const Coupe: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const yL = 229;
  const rL = 80;
  const ryL = 13.8;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-bowl`}>
          <path d={BOWL} />
        </clipPath>
        <linearGradient id={`${uid}-liq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecdca8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d6bc78" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <Ground id={uid} rx={56} />
      {/* foot */}
      <ellipse cx={CX} cy={452} rx={56} ry={9.5} fill={g.tint} fillOpacity={g.tintOp} />
      <ellipse cx={CX} cy={451} rx={55} ry={8.6} fill="none" stroke={INK} strokeOpacity={g.edge * 0.35} strokeWidth={0.8} />
      <Body d={STEM} id={uid} g={g} />
      <path d={front(CX, 452.5, 54, 8.6)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.4} />
      <path d="M199 300V426" stroke="#fff" strokeOpacity={0.85} strokeWidth={0.9} />
      <path d="M201.2 300V426" stroke={INK} strokeOpacity={g.edge * 0.6} strokeWidth={0.6} />
      <Outline d={STEM} id={`${uid}-os`} g={g} w={0.9} />
      {/* bowl */}
      <Body d={BOWL} id={uid} g={g} />
      {view === "alt" && (
        <g clipPath={`url(#${uid}-bowl)`}>
          <path d={`${front(CX, yL, rL, ryL)}L300 300L100 300Z`} fill={`url(#${uid}-liq)`} />
          <ellipse cx={CX} cy={yL} rx={rL} ry={ryL} fill="#f3e8c4" fillOpacity={0.55} stroke="#a8925a" strokeOpacity={0.35} strokeWidth={0.7} />
          <path d={front(CX, yL + 0.3, rL - 0.5, ryL - 0.3)} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.3} />
          <path d={front(CX, yL + 3, rL - 2, ryL - 0.6)} fill="none" stroke="#8a7440" strokeOpacity={0.3} strokeWidth={1.2} />
        </g>
      )}
      <path d="M190 280C194 283 197 284 200 284" fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.4} />
      <g opacity={0.85}>
        <path d="M126 220C132 246 152 266 176 276" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={5} strokeLinecap="round" />
        <path d="M119 214C124 244 150 270 180 280" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M276 222C268 244 250 262 230 272" fill="none" stroke={`url(#${uid}-y)`} strokeWidth={2} strokeLinecap="round" opacity={0.65} />
      </g>
      <Outline d={BOWL} id={`${uid}-o`} g={g} />
      <Rim id={uid} g={g} cy={205} rx={86} ry={15} wall={2} />
    </>
  );
};

/* ---------------------------------------------------------------- Glass crockery */

/** Upper (back) half of an ellipse, left to right. */
const back = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
const ring = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}A${rx} ${ry} 0 0 0 ${cx - rx} ${cy}Z`;
/** Arc along an ellipse between two angles in degrees (0 = right, 90 = front, 270 = back). */
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) => {
  const p = (a: number) => [r3(cx + rx * Math.cos((a * Math.PI) / 180)), r3(cy + ry * Math.sin((a * Math.PI) / 180))];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0} ${y0}A${rx} ${ry} 0 0 1 ${x1} ${y1}`;
};

/** Shallow glass disc seen at an angle (plates, saucers): rim lip, recessed well, foot ring seen through. */
function Dish({ id, g, cy, rx, ry, well = 0.68, foot = 0.6, lip = 4 }: { id: string; g: Glass; cy: number; rx: number; ry: number; well?: number; foot?: number; lip?: number }) {
  const wy = r3(cy + ry * 0.2);
  const [wr, wry] = [r3(rx * well), r3(ry * well)];
  const fy = r3(cy + ry * 0.5);
  const [fr, fry] = [r3(rx * foot), r3(ry * foot)];
  const edge = `${front(CX, cy, rx, ry)}L${CX + rx} ${cy + lip}A${rx} ${ry} 0 0 1 ${CX - rx} ${cy + lip}Z`;
  return (
    <>
      <path d={ring(CX, cy, rx, ry)} fill={g.tint} fillOpacity={g.tintOp} />
      <path d={ring(CX, cy, rx, ry)} fill={`url(#${id}-x)`} opacity={0.5} />
      {/* foot ring, seen through the glass */}
      <ellipse cx={CX} cy={fy} rx={fr} ry={fry} fill="none" stroke={INK} strokeOpacity={g.edge * 0.22} strokeWidth={0.8} />
      <path d={front(CX, fy + 1.5, fr - 2, fry - 0.5)} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.2} />
      {/* sloped shoulder between well and rim refracts darker toward the viewer */}
      <path d={front(CX, wy + 2, wr + 7, wry + 2.5)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.12} strokeWidth={8} />
      <ellipse cx={CX} cy={wy} rx={wr} ry={wry} fill="#fff" fillOpacity={0.07} stroke={INK} strokeOpacity={g.edge * 0.36} strokeWidth={0.8} />
      <path d={front(CX, wy + 0.6, wr - 1, wry - 0.4)} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.2} />
      <ellipse cx={r3(CX - wr * 0.4)} cy={r3(wy - wry * 0.3)} rx={r3(wr * 0.3)} ry={r3(wry * 0.2)} fill="#fff" fillOpacity={0.45} />
      {/* front lip thickness */}
      <path d={edge} fill={INK} fillOpacity={g.edge * 0.26} />
      <path d={front(CX, cy + lip, rx, ry)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.75} strokeWidth={0.9} />
      <path d={front(CX, cy + 0.6, rx - 1, ry - 0.3)} fill="none" stroke={`url(#${id}-r)`} strokeWidth={1.8} />
      {/* back rim and its catch-lights */}
      <path d={back(CX, cy, rx, ry)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.6} strokeWidth={0.9} />
      <path d={arc(CX, cy, rx - 3, ry - 1, 196, 250)} fill="none" stroke="#fff" strokeOpacity={0.95} strokeWidth={1.8} strokeLinecap="round" />
      <path d={arc(CX, cy, rx - 3, ry - 1, 292, 320)} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.2} strokeLinecap="round" />
    </>
  );
}

/** Solid glass handle: refracting edges, pale core, one specular line. */
function Handle({ id, g, d, w = 13 }: { id: string; g: Glass; d: string; w?: number }) {
  return (
    <>
      <defs>
        <mask id={`${id}-hm`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="500">
          <path d={d} fill="none" stroke="#fff" strokeWidth={w} />
          <path d={d} fill="none" stroke="#000" strokeWidth={w - 3} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={g.tint} strokeOpacity={g.tintOp * 1.5} strokeWidth={w} />
      <path d={d} fill="none" stroke={INK} strokeOpacity={g.edge * 0.2} strokeWidth={r3(w * 0.32)} />
      <rect width="400" height="500" fill={INK} fillOpacity={g.edge * 0.8} mask={`url(#${id}-hm)`} />
      <path d={d} fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={1.4} strokeLinecap="round" transform="translate(-2.2 -2.2)" />
    </>
  );
}

/** Liquid filling a vessel up to an ellipse surface (clip to the vessel body). */
function Liquid({ id, yW, rW, ryW, floor, top, body, surface }: { id: string; yW: number; rW: number; ryW: number; floor: number; top: string; body: string; surface: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-lq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={body} />
        </linearGradient>
      </defs>
      <path d={`${front(CX, yW, rW, ryW)}V${floor}H${CX - rW}Z`} fill={`url(#${id}-lq)`} />
      <ellipse cx={CX} cy={yW} rx={rW} ry={ryW} fill={surface} stroke={INK} strokeOpacity={0.15} strokeWidth={0.7} />
      <path d={front(CX, yW + 0.3, rW - 0.5, ryW - 0.3)} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.3} />
      <ellipse cx={r3(CX - rW * 0.35)} cy={r3(yW - ryW * 0.25)} rx={r3(rW * 0.28)} ry={r3(ryW * 0.22)} fill="#fff" fillOpacity={0.35} />
    </>
  );
}

const Plate: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <Ground id={uid} rx={118} />
      <Dish id={uid} g={g} cy={420} rx={150} ry={38} lip={5} />
      {view === "alt" && <Dish id={uid} g={g} cy={405} rx={150} ry={38} lip={5} />}
    </>
  );
};

const Bowl: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  // "alt" looks down from higher up, so the opening and floor read as wider ellipses.
  const [yT, rT, ryT, yB, rB, ryB] = view === "alt" ? [338, 120, 40, 447, 58, 15] : [352, 118, 26, 450, 58, 12];
  const d = `M${CX - rT} ${yT}C${CX - rT + 2} ${yT + 50} ${CX - rB - 26} ${yB - 12} ${CX - rB} ${yB}A${rB} ${ryB} 0 0 0 ${CX + rB} ${yB}C${CX + rB + 26} ${yB - 12} ${CX + rT - 2} ${yT + 50} ${CX + rT} ${yT}A${rT} ${ryT} 0 0 0 ${CX - rT} ${yT}Z`;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <Ground id={uid} rx={rB + 8} />
      <Body d={d} id={uid} g={g} />
      {/* inner floor seen through the opening and the front wall */}
      <ellipse cx={CX} cy={yB - 12} rx={rB - 6} ry={ryB - 1.5} fill="#fff" fillOpacity={0.08} stroke={INK} strokeOpacity={g.edge * 0.3} strokeWidth={0.8} />
      <path d={back(CX, yB - 12, rB - 6, ryB - 1.5)} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={1.2} />
      <Base id={uid} g={g} yF={yB - 7} rF={rB - 5} ryF={ryB - 1.5} yB={yB} rB={rB} ryB={ryB} />
      <g opacity={0.85}>
        <path d={`M${CX - rT + 12} ${yT + 16}C${CX - rT + 14} ${yT + 52} ${CX - rB - 18} ${yB - 22} ${CX - rB + 4} ${yB - 8}`} fill="none" stroke={`url(#${uid}-y)`} strokeWidth={7} strokeLinecap="round" opacity={0.5} />
        <path d={`M${CX - rT + 6} ${yT + 12}C${CX - rT + 8} ${yT + 50} ${CX - rB - 24} ${yB - 18} ${CX - rB - 2} ${yB - 6}`} fill="none" stroke={`url(#${uid}-y)`} strokeWidth={1.6} strokeLinecap="round" />
        <path d={`M${CX + rT - 10} ${yT + 18}C${CX + rT - 12} ${yT + 48} ${CX + rB + 20} ${yB - 20} ${CX + rB} ${yB - 9}`} fill="none" stroke={`url(#${uid}-y)`} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
      </g>
      <Outline d={d} id={`${uid}-o`} g={g} />
      <Rim id={uid} g={g} cy={yT} rx={rT} ry={ryT} wall={4} />
    </>
  );
};

const C = { yT: 344, rT: 66, ryT: 13.5, yB: 442, rB: 38, ryB: 7.5 };
const CUP = `M${CX - C.rT} ${C.yT}C${CX - C.rT + 2} ${C.yT + 50} ${CX - C.rB - 14} ${C.yB - 16} ${CX - C.rB} ${C.yB}A${C.rB} ${C.ryB} 0 0 0 ${CX + C.rB} ${C.yB}C${CX + C.rB + 14} ${C.yB - 16} ${CX + C.rT - 2} ${C.yT + 50} ${CX + C.rT} ${C.yT}A${C.rT} ${C.ryT} 0 0 0 ${CX - C.rT} ${C.yT}Z`;
const CUP_HANDLE = `M${CX + 61} ${C.yT + 14}C${CX + 92} ${C.yT + 10} ${CX + 100} ${C.yT + 28} ${CX + 98} ${C.yT + 44}C${CX + 96} ${C.yT + 62} ${CX + 80} ${C.yT + 72} ${CX + 50} ${C.yT + 70}`;

const TeaCup: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-cup`}>
          <path d={CUP} />
        </clipPath>
      </defs>
      <Ground id={uid} rx={78} />
      <Dish id={`${uid}`} g={g} cy={440} rx={100} ry={19} well={0.5} foot={0.56} lip={3} />
      <Handle id={uid} g={g} d={CUP_HANDLE} w={11} />
      <Body d={CUP} id={uid} g={g} />
      {view === "alt" && (
        // green tea, so the glass shows the colour of the brew
        <g clipPath={`url(#${uid}-cup)`}>
          <Liquid id={uid} yW={368} rW={63} ryW={13} floor={C.yB - 8} top="#dccb8e" body="#c2a85a" surface="#e6d79f" />
        </g>
      )}
      <Base id={uid} g={g} yF={C.yB - 9} rF={C.rB + 2} ryF={C.ryB - 0.5} yB={C.yB} rB={C.rB} ryB={C.ryB} />
      <g opacity={0.85}>
        <path d={`M${CX - C.rT + 10} ${C.yT + 14}C${CX - C.rT + 12} ${C.yT + 50} ${CX - C.rB - 10} ${C.yB - 22} ${CX - C.rB + 6} ${C.yB - 10}`} fill="none" stroke={`url(#${uid}-y)`} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
        <path d={`M${CX - C.rT + 5} ${C.yT + 12}C${CX - C.rT + 7} ${C.yT + 50} ${CX - C.rB - 16} ${C.yB - 20} ${CX - C.rB} ${C.yB - 8}`} fill="none" stroke={`url(#${uid}-y)`} strokeWidth={1.5} strokeLinecap="round" />
      </g>
      <Outline d={CUP} id={`${uid}-o`} g={g} />
      <Rim id={uid} g={g} cy={C.yT} rx={C.rT} ry={C.ryT} wall={2.6} />
    </>
  );
};

const M = { yT: 292, rT: 60, ryT: 12.5, yB: 450, rB: 57, ryB: 12, yF: 439 };
const mR = (y: number) => M.rT + ((M.rB - M.rT) * (y - M.yT)) / (M.yB - M.yT);
const MUG = `M${CX - M.rT} ${M.yT}L${CX - M.rB} ${M.yB}A${M.rB} ${M.ryB} 0 0 0 ${CX + M.rB} ${M.yB}L${CX + M.rT} ${M.yT}A${M.rT} ${M.ryT} 0 0 0 ${CX - M.rT} ${M.yT}Z`;
const MUG_HANDLE = `M${CX + 57} ${M.yT + 26}C${CX + 102} ${M.yT + 22} ${CX + 118} ${M.yT + 46} ${CX + 118} ${M.yT + 76}C${CX + 118} ${M.yT + 106} ${CX + 100} ${M.yT + 128} ${CX + 56} ${M.yT + 128}`;

const Mug: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const yW = 314;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-mug`}>
          <path d={MUG} />
        </clipPath>
      </defs>
      <g transform="translate(-16 0)">
        <Ground id={uid} rx={70} cx={CX + 14} />
        <Handle id={uid} g={g} d={MUG_HANDLE} w={14} />
        <Body d={MUG} id={uid} g={g} />
        {view === "alt" && (
          // milky chai
          <g clipPath={`url(#${uid}-mug)`}>
            <Liquid id={uid} yW={yW} rW={r3(mR(yW) - 2.5)} ryW={12} floor={M.yF} top="#d2ab80" body="#b98a5c" surface="#dcc09c" />
          </g>
        )}
        <Base id={uid} g={g} yF={M.yF} rF={r3(mR(M.yF) - 3)} ryF={11} yB={M.yB} rB={M.rB} ryB={M.ryB} />
        <g opacity={0.8}>
          <path d={strip(CX - M.rT * 0.7, M.yT + 18, CX - M.rB * 0.7, M.yB - 14, 20, 14)} fill={`url(#${uid}-y)`} opacity={0.22} />
          <path d={strip(CX - M.rT * 0.6, M.yT + 18, CX - M.rB * 0.6, M.yB - 14, 5, 3.5)} fill={`url(#${uid}-y)`} opacity={0.75} />
          <path d={strip(CX - M.rT + 4, M.yT + 16, CX - M.rB + 4, M.yB - 8, 2, 1.4)} fill={`url(#${uid}-y)`} />
          <path d={strip(CX + M.rT * 0.8, M.yT + 24, CX + M.rB * 0.8, M.yB - 16, 2.6, 1.6)} fill={`url(#${uid}-y)`} opacity={0.6} />
        </g>
        <Outline d={MUG} id={`${uid}-o`} g={g} />
        <Rim id={uid} g={g} cy={M.yT} rx={M.rT} ry={M.ryT} wall={3.2} />
      </g>
    </>
  );
};

/* ---------------------------------------------------------------- More crockery: quarter plates, a standing plate */

const SidePlate: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  // Front: a stack of four, as they come in the box. Alt: one plate on its own.
  const n = view === "alt" ? 1 : 4;
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <Ground id={uid} rx={92} />
      {Array.from({ length: n }, (_, i) => (
        <Dish key={i} id={uid} g={g} cy={432 - i * 9} rx={118} ry={30} lip={4} />
      ))}
    </>
  );
};

/** A plate standing on its edge, face to the camera: the shape that says "dinner set" at a glance. */
const PlateStand: ArtRenderer = ({ tone, uid }) => {
  const g = glassOf(tone);
  const cy = 308;
  const r = 150;
  const w = r3(r * 0.66);
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-pe`}>
          <stop offset="0.6" stopColor={INK} stopOpacity={0} />
          <stop offset="0.66" stopColor={INK} stopOpacity={g.edge * 0.16} />
          <stop offset="0.72" stopColor="#fff" stopOpacity={0.14} />
          <stop offset="0.88" stopColor={INK} stopOpacity={g.edge * 0.05} />
          <stop offset="0.96" stopColor={INK} stopOpacity={g.edge * 0.36} />
          <stop offset="1" stopColor={INK} stopOpacity={g.edge * 0.7} />
        </radialGradient>
        <radialGradient id={`${uid}-pg`} cx="0.32" cy="0.28" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={0.4} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ContactShadow id={`${uid}-s`} cx={CX + 8} rx={104} ry={6} opacity={0.22} />
      <circle cx={CX} cy={cy} r={r} fill={g.tint} fillOpacity={g.tintOp} />
      <circle cx={CX} cy={cy} r={r} fill={`url(#${uid}-pe)`} />
      <circle cx={CX} cy={cy} r={r} fill={`url(#${uid}-pg)`} />
      {/* well, foot ring and their catch-lights */}
      <circle cx={CX} cy={cy} r={w} fill="#fff" fillOpacity={0.05} stroke={INK} strokeOpacity={g.edge * 0.38} strokeWidth={0.9} />
      <circle cx={CX} cy={cy} r={r3(r * 0.57)} fill="none" stroke={INK} strokeOpacity={g.edge * 0.16} strokeWidth={0.8} />
      <g fill="none" strokeLinecap="round" stroke="#fff">
        <path d={arc(CX, cy, w - 1.5, w - 1.5, 20, 115)} strokeOpacity={0.8} strokeWidth={1.4} />
        <path d={arc(CX, cy, r - 4, r - 4, 192, 252)} strokeOpacity={0.95} strokeWidth={2.2} />
        <path d={arc(CX, cy, r - 4, r - 4, 272, 298)} strokeOpacity={0.6} strokeWidth={1.4} />
        <path d={arc(CX, cy, r - 3, r - 3, 28, 72)} strokeOpacity={0.45} strokeWidth={1.4} />
      </g>
      <circle cx={CX} cy={cy} r={r - 6} fill="none" stroke={INK} strokeOpacity={g.edge * 0.24} strokeWidth={0.8} />
      <circle cx={CX} cy={cy} r={r} fill="none" stroke={INK} strokeOpacity={g.edge * 0.85} strokeWidth={1} />
    </>
  );
};

/* ---------------------------------------------------------------- Teapot */

const POT = `M${CX - 46} 282C${CX - 92} 290 ${CX - 106} 326 ${CX - 106} 366C${CX - 106} 410 ${CX - 80} 438 ${CX - 54} 446A54 10 0 0 0 ${CX + 54} 446C${CX + 80} 438 ${CX + 106} 410 ${CX + 106} 366C${CX + 106} 326 ${CX + 92} 290 ${CX + 46} 282A46 9 0 0 0 ${CX - 46} 282Z`;
const POT_SPOUT = `M${CX + 98} 384C${CX + 124} 376 ${CX + 138} 344 ${CX + 144} 306L${CX + 162} 310C${CX + 158} 352 ${CX + 138} 406 ${CX + 82} 430Z`;
const POT_HANDLE = `M${CX - 96} 320C${CX - 140} 314 ${CX - 154} 350 ${CX - 150} 376C${CX - 146} 404 ${CX - 126} 420 ${CX - 92} 418`;
const LID = 272;
const POT_LID = `M${CX - 50},${LID} C${CX - 48},${LID - 10} ${CX - 26},${LID - 14} ${CX},${LID - 14} C${CX + 26},${LID - 14} ${CX + 48},${LID - 10} ${CX + 50},${LID} A50,9.5 0 0 1 ${CX - 50},${LID} Z`;

const Teapot: ArtRenderer = ({ tone, view, uid }) => {
  const g = glassOf(tone);
  const tea = view === "alt";
  return (
    <>
      <GlassDefs id={uid} g={g} />
      <defs>
        <clipPath id={`${uid}-pot`}>
          <path d={POT} />
        </clipPath>
        <Grad id={`${uid}-st`} stops={brushed(TONES.steel)} />
        <Grad id={`${uid}-sv`} x2={0} y2={1} stops={[[0, "#fff", 0.6], [1, "#fff", 0]]} />
        <pattern id={`${uid}-mesh`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="0.8" fill={INK} fillOpacity="0.4" />
        </pattern>
      </defs>
      <Ground id={uid} rx={86} />
      <Handle id={uid} g={g} d={POT_HANDLE} w={13} />
      <Body d={POT} id={uid} g={g} />
      <g clipPath={`url(#${uid}-pot)`}>
        {tea && <Liquid id={uid} yW={336} rW={101} ryW={17} floor={442} top="#dba566" body="#a9682c" surface="#e6ba82" />}
        {/* steel mesh infuser, seen through the glass (and the tea) */}
        <g opacity={tea ? 0.45 : 0.85}>
          <path d={side(CX, 30, 286, 400)} fill={`url(#${uid}-st)`} opacity={0.5} />
          <path d={side(CX, 30, 286, 400)} fill={`url(#${uid}-mesh)`} />
          <path d={frontArc(CX, 30, 400)} fill="none" stroke={INK} strokeOpacity={0.35} />
          <path d={`M${CX - 30} 286V400M${CX + 30} 286V400`} stroke={INK} strokeOpacity={0.3} strokeWidth={0.8} />
        </g>
        <Base id={uid} g={g} yF={436} rF={50} ryF={9} yB={446} rB={54} ryB={10} />
        <g opacity={0.85} fill="none" strokeLinecap="round">
          <path d={`M${CX - 82} 314C${CX - 96} 338 ${CX - 98} 380 ${CX - 82} 410`} stroke={`url(#${uid}-y)`} strokeWidth={9} opacity={0.5} />
          <path d={`M${CX - 92} 306C${CX - 104} 334 ${CX - 106} 384 ${CX - 90} 418`} stroke={`url(#${uid}-y)`} strokeWidth={1.6} />
          <path d={`M${CX + 88} 318C${CX + 98} 344 ${CX + 98} 384 ${CX + 86} 408`} stroke={`url(#${uid}-y)`} strokeWidth={2.2} opacity={0.6} />
        </g>
      </g>
      <Outline d={POT} id={`${uid}-o`} g={g} />

      <Body d={POT_SPOUT} id={uid} g={g} />
      <path d={`M${CX + 100} 386C${CX + 124} 378 ${CX + 137} 348 ${CX + 143} 312`} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.4} strokeLinecap="round" />
      <Outline d={POT_SPOUT} id={`${uid}-os`} g={g} w={0.9} />
      <ellipse cx={CX + 153} cy={308} rx={9} ry={2.6} transform={`rotate(13 ${CX + 153} 308)`} fill="#fff" fillOpacity={0.3} stroke={INK} strokeOpacity={g.edge * 0.7} strokeWidth={0.8} />

      {/* steel lid with a ball knob */}
      <path d={side(CX, 50, LID, LID + 9)} fill={`url(#${uid}-st)`} />
      <path d={frontArc(CX, 50, LID + 9)} fill="none" stroke={INK} strokeOpacity={0.35} />
      <path d={POT_LID} fill={`url(#${uid}-st)`} />
      <path d={POT_LID} fill={`url(#${uid}-sv)`} />
      <path d={side(CX, 5, LID - 26, LID - 13)} fill={`url(#${uid}-st)`} />
      <circle cx={CX} cy={LID - 30} r={9} fill={`url(#${uid}-st)`} />
      <circle cx={CX - 3} cy={LID - 33} r={2.6} fill="#fff" fillOpacity={0.85} />
    </>
  );
};

export const GLASS_ART: ArtMap = {
  tumbler: Tumbler,
  doublewall: DoubleWall,
  carafe: Carafe,
  coupe: Coupe,
  plate: Plate,
  sideplate: SidePlate,
  platestand: PlateStand,
  bowl: Bowl,
  teacup: TeaCup,
  teapot: Teapot,
  mug: Mug,
};
