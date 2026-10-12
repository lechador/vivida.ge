/**
 * Culture-fair figural primitives for the IQ test.
 *
 * Every figural item (matrix reasoning, figural analogy, odd-one-out, spatial)
 * is described as a `FigureSpec`, a small list of shape "marks" drawn into a
 * 100×100 viewBox. Keeping figures as data (not hand-drawn SVG) lets the item
 * bank build them by rule, so a matrix's answer cell is computed by the SAME
 * transformation as its givens, the item is correct by construction.
 *
 * No text, no real-world objects, no colour-coded meaning required to solve,
 * this is what keeps the test language- and culture-fair (Raven-style).
 */

export type ShapeKind =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "pentagon"
  | "star"
  | "plus"
  | "arrow"
  | "line"
  | "dot";

export type Mark = {
  shape: ShapeKind;
  /** Centre, in 0–100 figure units. Defaults to 50,50. */
  x?: number;
  y?: number;
  /** Bounding size (diameter / side), 0–100. Default 62. */
  size?: number;
  /** Rotation in degrees about the mark's centre. */
  rot?: number;
  /** Filled with `color` vs. outline only. Default outline. */
  fill?: boolean;
  /** Stroke/fill colour, a CSS value. Default currentColor. */
  color?: string;
  /** Stroke width in figure units. Default 6. */
  sw?: number;
  /** Opacity 0–1. */
  opacity?: number;
};

export type FigureSpec = Mark[];

const C = 50; // figure centre

/** Regular-polygon vertices, first vertex pointing up (rot applied after). */
function polygon(n: number, r: number, startDeg = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((startDeg + (360 / n) * i) * Math.PI) / 180;
    pts.push(`${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** Star (5-point) vertices alternating outer/inner radius. */
function star(rOuter: number, rInner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    pts.push(`${(C + r * Math.cos(a)).toFixed(2)},${(C + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function MarkEl({ mark }: { mark: Mark }) {
  const {
    shape,
    x = C,
    y = C,
    size = 62,
    rot = 0,
    fill = false,
    color = "currentColor",
    sw = 6,
    opacity = 1,
  } = mark;
  const r = size / 2;
  const stroke = color;
  const fillVal = fill ? color : "none";
  const common = {
    stroke,
    strokeWidth: sw,
    fill: fillVal,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    opacity,
  };
  // Position each mark by translating the whole shape to (x,y) then rotating.
  const transform = `translate(${x - C} ${y - C}) rotate(${rot} ${C} ${C})`;

  let el: React.ReactNode;
  switch (shape) {
    case "circle":
      el = <circle cx={C} cy={C} r={r} {...common} />;
      break;
    case "dot":
      el = <circle cx={C} cy={C} r={r} {...common} fill={color} stroke="none" />;
      break;
    case "square":
      el = <rect x={C - r} y={C - r} width={r * 2} height={r * 2} rx={2} {...common} />;
      break;
    case "triangle":
      el = <polygon points={polygon(3, r)} {...common} />;
      break;
    case "diamond":
      el = <polygon points={polygon(4, r)} {...common} />;
      break;
    case "pentagon":
      el = <polygon points={polygon(5, r)} {...common} />;
      break;
    case "hexagon":
      el = <polygon points={polygon(6, r, 0)} {...common} />;
      break;
    case "star":
      el = <polygon points={star(r, r * 0.42)} {...common} />;
      break;
    case "plus": {
      const t = r * 0.4;
      el = (
        <path
          d={`M${C - t} ${C - r} h${2 * t} v${r - t} h${r - t} v${2 * t} h${-(r - t)} v${r - t} h${-2 * t} v${-(r - t)} h${-(r - t)} v${-2 * t} h${r - t} z`}
          {...common}
        />
      );
      break;
    }
    case "arrow": {
      // Upward arrow; rot orients it.
      el = (
        <path
          d={`M${C} ${C - r} L${C + r * 0.6} ${C + r * 0.1} L${C + r * 0.25} ${C + r * 0.1} L${C + r * 0.25} ${C + r} L${C - r * 0.25} ${C + r} L${C - r * 0.25} ${C + r * 0.1} L${C - r * 0.6} ${C + r * 0.1} Z`}
          {...common}
        />
      );
      break;
    }
    case "line":
      el = <line x1={C - r} y1={C} x2={C + r} y2={C} stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={opacity} />;
      break;
  }
  return <g transform={transform}>{el}</g>;
}

/**
 * `n` dots laid out on a centred grid, the count-based figural rule. Rows fill
 * top-to-bottom so 1–9 read naturally.
 */
export function dots(n: number, opts: { color?: string; size?: number } = {}): FigureSpec {
  const { color = "currentColor", size = 15 } = opts;
  if (n <= 0) return [];
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const gap = 26;
  const marks: FigureSpec = [];
  let placed = 0;
  for (let row = 0; row < rows; row++) {
    const inRow = Math.min(cols, n - placed);
    const rowW = (inRow - 1) * gap;
    for (let col = 0; col < inRow; col++) {
      marks.push({
        shape: "dot",
        x: C - rowW / 2 + col * gap,
        y: C - ((rows - 1) * gap) / 2 + row * gap,
        size,
        color,
      });
      placed++;
    }
  }
  return marks;
}

/**
 * Render a figure. `muted` dims it (used for the "given" cells vs. the empty
 * slot). Size is the pixel box; the coordinate system is always 0–100.
 */
export function Figure({
  spec,
  size = 88,
  className,
}: {
  spec: FigureSpec;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {spec.map((m, i) => (
        <MarkEl key={i} mark={m} />
      ))}
    </svg>
  );
}

/** The "?" placeholder shown for the missing cell / unpicked answer. */
export function FigureBlank({ size = 88 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="46"
        fontWeight="700"
        fill="currentColor"
        opacity="0.5"
      >
        ?
      </text>
    </svg>
  );
}
