"use client";

import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export const VIEW_W = 420;
export const VIEW_H = 560;
const INK = "#151413";
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
      <pattern id={`${uid}-glass`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeOpacity="0.22" strokeWidth="0.6" />
      </pattern>
    </defs>
  );
}

/** Dash-dot centre line and section markers, as on a working drawing. */
function Axis({ x, top, bottom }: { x: number; top: number; bottom: number }) {
  return (
    <g fill={INK} fillOpacity="0.55" fontSize="9" fontFamily="var(--font-inter), sans-serif" letterSpacing="0.1em">
      <line x1={x} x2={x} y1={top} y2={bottom} {...line} strokeOpacity="0.4" strokeDasharray="12 3 2 3" />
      <text x={x + 6} y={top + 6}>A</text>
      <text x={x + 6} y={bottom}>A</text>
    </g>
  );
}

/* ---------------------------------- Glass --------------------------------- */

// Tumbler sits right of centre so callouts fit on both sides.
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
