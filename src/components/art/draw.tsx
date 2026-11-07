/* ---------- Drawing helpers shared by the glass renders ---------- */

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

/** Ellipse depth for round edges seen from just above eye level. */
const ry = (rx: number) => r2(rx * 0.19);

/** Round SVG coordinates so server and browser markup match exactly. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** Cylinder side: straight top edge (hidden by the top face), curved front bottom edge. */
export const side = (cx: number, rx: number, y1: number, y2: number, e = ry(rx)) =>
  `M${cx - rx},${y1} L${cx - rx},${y2} A${rx},${r2(e)} 0 0 0 ${cx + rx},${y2} L${cx + rx},${y1} Z`;

/** Front half of an ellipse, left to right (a groove or seam line). */
export const frontArc = (cx: number, rx: number, y: number, e = ry(rx)) =>
  `M${cx - rx},${y} A${rx},${r2(e)} 0 0 0 ${cx + rx},${y}`;

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
