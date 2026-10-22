"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export const VIEW_W = 420;
export const VIEW_H = 560;
const CX = 180;
const INK = "#151413";
const STEEL_CUT = "#d6d7d5";
/** Round computed coordinates so server and browser emit identical SVG. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

const line = {
  fill: "none",
  stroke: INK,
  strokeOpacity: 0.75,
  strokeWidth: 0.75,
} as const;

/** One anatomical part: full strength when active, dimmed otherwise. */
function Part({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <motion.g initial={false} animate={{ opacity: on ? 1 : 0.26 }} transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </motion.g>
  );
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <pattern id={`${uid}-hatch`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke={INK} strokeOpacity="0.32" strokeWidth="0.6" />
      </pattern>
      <pattern id={`${uid}-glass`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeOpacity="0.22" strokeWidth="0.6" />
      </pattern>
      <pattern id={`${uid}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="2.5" cy="2.5" r="0.6" fill={INK} fillOpacity="0.3" />
      </pattern>
      <linearGradient id={`${uid}-steel`} gradientUnits="userSpaceOnUse" x1={CX - 86} x2={CX} y1="0" y2="0">
        <stop offset="0" stopColor="#8f9291" />
        <stop offset="0.2" stopColor="#c4c6c5" />
        <stop offset="0.42" stopColor="#f4f4f2" />
        <stop offset="0.72" stopColor="#d2d3d2" />
        <stop offset="1" stopColor="#b7b9b8" />
      </linearGradient>
    </defs>
  );
}

/** Dash-dot centre line and section markers, as on a working drawing. */
function Axis({ x = CX, top, bottom }: { x?: number; top: number; bottom: number }) {
  return (
    <g fill={INK} fillOpacity="0.55" fontSize="9" fontFamily="var(--font-inter), sans-serif" letterSpacing="0.1em">
      <line x1={x} x2={x} y1={top} y2={bottom} {...line} strokeOpacity="0.4" strokeDasharray="12 3 2 3" />
      <text x={x + 6} y={top + 6}>A</text>
      <text x={x + 6} y={bottom}>A</text>
    </g>
  );
}

/* ---------------------------------- Flask --------------------------------- */

const F = { lip: 100, neckEnd: 140, bodyStart: 194, neckR: 48, bodyR: 84, base: 516, corner: 22 };

/** Right (s=1) or left (s=-1) wall profile inset by d, from `top` down to the axis. */
function profile(d: number, top: number, s = 1) {
  const n = r3(CX + s * (F.neckR - d * 0.45));
  const b = r3(CX + s * (F.bodyR - d));
  const y = F.base - d;
  const r = r3(Math.max(6, F.corner - d * 0.5));
  const k = r3(b - s * r);
  return {
    down: `M${n} ${top}L${n} ${F.neckEnd}C${n} ${F.neckEnd + 30} ${b} ${F.bodyStart - 32} ${b} ${F.bodyStart}L${b} ${y - r}Q${b} ${y} ${k} ${y}L${CX} ${y}`,
    up: `L${CX} ${y}L${k} ${y}Q${b} ${y} ${b} ${y - r}L${b} ${F.bodyStart}C${b} ${F.bodyStart - 32} ${n} ${F.neckEnd + 30} ${n} ${F.neckEnd}L${n} ${top}`,
  };
}
const band = (a: number, b: number, top = F.lip) => `${profile(a, top).down}${profile(b, top).up}Z`;
const neckX = (d: number) => r3(CX + F.neckR - d * 0.45);

const FLASK = {
  outer: band(0, 6),
  vacuum: band(6, 24, F.lip + 10),
  inner: band(24, 34),
  weld: `M${neckX(28)} ${F.lip}H${neckX(6)}V${F.lip + 10}H${neckX(28)}Z`,
  body: `${profile(0, 128, -1).down}L${CX} 128Z`,
  capShell: `M${CX} 36H${CX + 46}Q${CX + 58} 36 ${CX + 58} 48V128H${CX + 53}V50Q${CX + 53} 41 ${CX + 44} 41H${CX}Z`,
  capCore: `M${CX} 41H${CX + 44}Q${CX + 53} 41 ${CX + 53} 50V88H${CX}Z`,
  capFlange: `M${CX} 88H${CX + 53}V92H${CX}Z`,
  plug: `M${CX} 92H${CX + 31}V120Q${CX + 31} 124 ${CX + 27} 124H${CX}Z`,
  seal: `M${CX + 33} 92H${CX + 49}V100H${CX + 33}Z`,
  threads: [0, 1, 2, 3].map((i) => `M${CX + 53} ${104 + i * 6}L${CX + 48.6} ${106.5 + i * 6}L${CX + 53} ${109 + i * 6}Z`).join(""),
  capExt: `M${CX} 36H${CX - 46}Q${CX - 58} 36 ${CX - 58} 48V128H${CX}Z`,
  plate: `M${CX} 517H${CX + 62}Q${CX + 68} 517 ${CX + 68} 520Q${CX + 68} 523 ${CX + 62} 523H${CX}Z`,
  plateExt: `M${CX} 517H${CX - 62}Q${CX - 68} 517 ${CX - 68} 520Q${CX - 68} 523 ${CX - 62} 523H${CX}Z`,
  tip: `M${CX} 510H${CX + 4}V517H${CX}Z`,
};

const Cut = ({ d, uid, fill = STEEL_CUT }: { d: string; uid: string; fill?: string }) => (
  <>
    <path d={d} fill={fill} />
    <path d={d} fill={`url(#${uid}-hatch)`} />
  </>
);

export function FlaskSection({ active, uid }: { active: string; uid: string }) {
  return (
    <g>
      <Defs uid={uid} />

      {/* Left half: elevation, always shown for reference. */}
      <path d={FLASK.body} fill={`url(#${uid}-steel)`} />
      <path d={FLASK.capExt} fill={`url(#${uid}-steel)`} />
      <path d={FLASK.plateExt} fill={`url(#${uid}-steel)`} />
      <line x1={CX - 58} x2={CX} y1={114} y2={114} {...line} strokeOpacity="0.3" />

      {/* Right half: section. */}
      <Part on={active === "outer"}>
        <Cut d={FLASK.outer} uid={uid} fill="#e2e3e1" />
        <Cut d={FLASK.weld} uid={uid} fill="#e2e3e1" />
        <Cut d={FLASK.plate} uid={uid} />
        <path d={FLASK.tip} fill="#3b3935" />
      </Part>

      <Part on={active === "cap"}>
        <Cut d={FLASK.capShell} uid={uid} />
        <path d={FLASK.capCore} fill="#e8e4dd" />
        <Cut d={FLASK.capFlange} uid={uid} />
        <Cut d={FLASK.plug} uid={uid} />
        <path d={FLASK.seal} fill="#4a4743" />
        <path d={FLASK.threads} fill="#a9abaa" />
      </Part>
      <Part on={active === "vacuum"}>
        <path d={FLASK.vacuum} fill="#f9f8f6" />
        <path d={FLASK.vacuum} fill={`url(#${uid}-dots)`} />
      </Part>
      <Part on={active === "inner"}>
        <Cut d={FLASK.inner} uid={uid} />
      </Part>

      {/* Linework stays crisp regardless of which part is active. */}
      <g {...line}>
        {[FLASK.outer, FLASK.vacuum, FLASK.inner, FLASK.body, FLASK.capShell, FLASK.capExt].map((d) => (
          <path key={d} d={d} />
        ))}
        {[FLASK.capCore, FLASK.plug, FLASK.seal, FLASK.plate, FLASK.plateExt].map((d) => (
          <path key={d} d={d} strokeOpacity="0.45" />
        ))}
      </g>
      <Axis top={20} bottom={544} />
    </g>
  );
}

/* ---------------------------------- Glass --------------------------------- */

// Tumbler sits right of the flask's axis so callouts fit on both sides.
const GX = 196;
const G = { rim: 180, base: 500, rTop: 116, rBot: 100, wall: 9, floor: 460 };
/** Outer radius of the tapered tumbler at height y. */
const rOut = (y: number) => r3(G.rTop - ((G.rTop - G.rBot) * (y - G.rim)) / (G.base - 6 - G.rim));
const IN_TOP = G.rTop - G.wall;
const IN_BOT = r3(rOut(448) - G.wall - 0.5);
const BEAD = G.wall / 2;

const GLASS = {
  section: `M${GX + IN_TOP} ${G.rim}A${BEAD} ${BEAD} 0 0 1 ${GX + G.rTop} ${G.rim}L${GX + G.rBot} 494Q${GX + G.rBot} 500 ${GX + G.rBot - 6} 500H${GX + 28}C${GX + 16} 500 ${GX + 12} 493 ${GX} 493V${G.floor}H${GX + IN_BOT - 12}Q${GX + IN_BOT} ${G.floor} ${GX + IN_BOT} 448Z`,
  silhouette: `M${GX} ${G.rim - BEAD}H${GX - G.rTop + BEAD}A${BEAD} ${BEAD} 0 0 0 ${GX - G.rTop} ${G.rim}L${GX - G.rBot} 494Q${GX - G.rBot} 500 ${GX - G.rBot + 6} 500H${GX}Z`,
  innerLine: `M${GX - IN_TOP} ${G.rim}L${GX - IN_BOT} 448Q${GX - IN_BOT} ${G.floor} ${GX - IN_BOT + 12} ${G.floor}H${GX}`,
  footExt: `M${GX} ${G.floor}H${r3(GX - rOut(G.floor))}L${GX - G.rBot} 494Q${GX - G.rBot} 500 ${GX - G.rBot + 6} 500H${GX}Z`,
  punt: `M${GX - 28} 500C${GX - 16} 500 ${GX - 12} 493 ${GX} 493`,
  rimExt: `M${GX} ${G.rim - BEAD}H${GX - G.rTop + BEAD}A${BEAD} ${BEAD} 0 0 0 ${GX - G.rTop} ${G.rim}`,
  highlights: `M${GX - 84} ${G.rim + 26}L${GX - 77} ${G.rim + 26}L${GX - 69} 474L${GX - 75} 474ZM${GX - 32} ${G.rim + 30}L${GX - 28.5} ${G.rim + 30}L${GX - 25} 444L${GX - 28} 444Z`,
};

const GLASS_LIFT = -44;

const RIB_ANGLES = [12, 24, 36, 48, 60, 72, 84];
const ribX = (y: number, deg: number) => r3(GX - rOut(y) * Math.sin((deg * Math.PI) / 180));
const RIB_TOP = G.rim + 44;
const RIB_BOT = 478;

export function GlassSection({ active, uid }: { active: string; uid: string }) {
  const clip = (i: number) => `url(#${uid}-gc${i})`;
  const glassCut = (fill: string) => (
    <>
      <path d={GLASS.section} fill={fill} />
      <path d={GLASS.section} fill={`url(#${uid}-glass)`} />
    </>
  );
  // Lift the tumbler so it sits optically centred in the frame.
  return (
    <g transform={`translate(0 ${GLASS_LIFT})`}>
      <Defs uid={uid} />
      <defs>
        <clipPath id={`${uid}-gc1`}>
          <rect x="0" y="0" width={VIEW_W} height={G.rim + 14} />
        </clipPath>
        <clipPath id={`${uid}-gc2`}>
          <rect x="0" y={G.rim + 14} width={VIEW_W} height={448 - G.rim - 14} />
        </clipPath>
        <clipPath id={`${uid}-gc3`}>
          <rect x="0" y="448" width={VIEW_W} height="112" />
        </clipPath>
      </defs>

      <Part on={active === "clarity"}>
        <path d={GLASS.silhouette} fill="#e3e9e8" fillOpacity="0.7" />
        <path d={GLASS.highlights} fill="#ffffff" />
      </Part>
      <Part on={active === "foot"}>
        <path d={GLASS.footExt} fill="#c9d3d1" fillOpacity="0.8" />
        <g clipPath={clip(3)}>{glassCut("#c9d3d1")}</g>
      </Part>
      <Part on={active === "wall"}>
        <g clipPath={clip(1)}>{glassCut("#c9d3d1")}</g>
        <path d={GLASS.rimExt} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      </Part>
      <Part on={active === "wall"}>
        <g clipPath={clip(2)}>{glassCut("#d3dcda")}</g>
      </Part>
      <Part on={active === "ribs"}>
        {RIB_ANGLES.map((deg) => (
          <g key={deg} strokeLinecap="round">
            <line x1={ribX(RIB_TOP, deg)} y1={RIB_TOP} x2={ribX(RIB_BOT, deg)} y2={RIB_BOT} stroke={INK} strokeOpacity="0.42" strokeWidth="1" />
            <line x1={r3(ribX(RIB_TOP, deg) + 2)} y1={RIB_TOP} x2={r3(ribX(RIB_BOT, deg) + 2)} y2={RIB_BOT} stroke="#ffffff" strokeWidth="1.6" />
          </g>
        ))}
      </Part>

      <g {...line}>
        <path d={GLASS.section} />
        <path d={GLASS.silhouette} />
        <path d={GLASS.innerLine} strokeOpacity="0.4" />
        <path d={GLASS.punt} strokeOpacity="0.45" strokeDasharray="3 2" />
      </g>
      <Axis x={GX} top={G.rim - 30} bottom={526} />
    </g>
  );
}
