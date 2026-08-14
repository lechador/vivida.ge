export type RadarPoint = { key: string; label: string; score: number; hue: string };

/**
 * Generic N-spoke trait radar (pure SVG, server-safe). Each vertex is a trait
 * scored 0–100; the filled polygon is the profile shape. Used by the Big Five
 * result surfaces.
 */
export function TraitRadar({
  points,
  size = 340,
  locale = "ka",
}: {
  points: RadarPoint[];
  size?: number;
  locale?: "ka" | "en";
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.29;
  const n = points.length;

  const at = (i: number, r: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPoly = (f: number) =>
    points.map((_, i) => at(i, maxR * f).join(",")).join(" ");
  const dataPoly = points
    .map((p, i) => at(i, maxR * (p.score / 100)).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[360px]"
      role="img"
      aria-label={
        locale === "en"
          ? "Personality trait radar chart"
          : "პიროვნების თვისებების რადარი"
      }
    >
      <defs>
        <linearGradient id="trait-radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.18 305)" stopOpacity="0.45" />
          <stop offset="55%" stopColor="oklch(0.75 0.20 350)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.80 0.15 200)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {rings.map((f) => (
        <polygon
          key={f}
          points={ringPoly(f)}
          fill="none"
          stroke="oklch(0.7 0.03 290 / 0.22)"
          strokeWidth={1}
        />
      ))}
      {points.map((_, i) => {
        const [x, y] = at(i, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="oklch(0.7 0.03 290 / 0.22)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={dataPoly}
        fill="url(#trait-radar-fill)"
        stroke="oklch(0.82 0.16 305)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const [x, y] = at(i, maxR * (p.score / 100));
        return <circle key={p.key} cx={x} cy={y} r={3.5} fill={p.hue} />;
      })}

      {points.map((p, i) => {
        const [x, y] = at(i, maxR + 24);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <g key={`l-${p.key}`}>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill="oklch(0.92 0.02 290)"
            >
              {p.label}
            </text>
            <text
              x={x}
              y={y + 13}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={700}
              fill={p.hue}
            >
              {p.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
