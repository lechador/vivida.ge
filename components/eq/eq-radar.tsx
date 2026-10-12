import type { EqDomainScore } from "@/lib/eq/scoring";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Five-spoke radar of the EQ domains, the signature result visual. Pure SVG,
 * no hooks, so it renders on the server (saved result page) and the client
 * (fresh result) alike. Each vertex is a domain; the filled pentagon is the
 * user's shape.
 */
export function EqRadar({
  domains,
  size = 320,
  locale = "ka",
}: {
  domains: EqDomainScore[];
  size?: number;
  locale?: UserLocale;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.3;
  const n = domains.length;

  const pointAt = (i: number, r: number) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPoly = (frac: number) =>
    domains
      .map((_, i) => pointAt(i, maxR * frac).join(","))
      .join(" ");

  const dataPoly = domains
    .map((d, i) => pointAt(i, maxR * (d.score / 100)).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[340px]"
      role="img"
      aria-label={locale !== "ka" ? "Emotional intelligence domain radar" : "ემოციური ინტელექტის დომენების რადარი"}
    >
      <defs>
        <linearGradient id="eq-radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.18 305)" stopOpacity="0.45" />
          <stop offset="55%" stopColor="oklch(0.75 0.20 350)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.80 0.15 200)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((frac) => (
        <polygon
          key={frac}
          points={ringPoly(frac)}
          fill="none"
          stroke="oklch(0.7 0.03 290 / 0.22)"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {domains.map((_, i) => {
        const [x, y] = pointAt(i, maxR);
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

      {/* Data shape */}
      <polygon
        points={dataPoly}
        fill="url(#eq-radar-fill)"
        stroke="oklch(0.82 0.16 305)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {domains.map((d, i) => {
        const [x, y] = pointAt(i, maxR * (d.score / 100));
        return <circle key={d.key} cx={x} cy={y} r={3.5} fill={d.hue} />;
      })}

      {/* Labels */}
      {domains.map((d, i) => {
        const [x, y] = pointAt(i, maxR + 22);
        const anchor =
          Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <g key={`l-${d.key}`}>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={600}
              fill="oklch(0.92 0.02 290)"
            >
              {locale !== "ka" ? d.nameEn : d.nameKa}
            </text>
            <text
              x={x}
              y={y + 13}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={11}
              fontWeight={700}
              fill={d.hue}
            >
              {d.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
