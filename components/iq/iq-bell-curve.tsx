import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * The IQ bell curve with the taker's score marked — a normal distribution
 * (mean 100, SD 15) drawn over the 55–145 range, shaded up to the score so the
 * "where you land" reads instantly.
 */
export function IqBellCurve({ iq, locale = "ka" }: { iq: number; locale?: UserLocale }) {
  const W = 560;
  const H = 180;
  const padX = 24;
  const padTop = 14;
  const baseY = H - 34;
  const lo = 55;
  const hi = 145;

  const xOf = (v: number) => padX + ((v - lo) / (hi - lo)) * (W - 2 * padX);
  const peak = baseY - padTop;
  const yOf = (v: number) => baseY - Math.exp(-0.5 * ((v - 100) / 15) ** 2) * (peak - padTop);

  const step = 1;
  const pts: string[] = [];
  for (let v = lo; v <= hi; v += step) pts.push(`${xOf(v).toFixed(1)},${yOf(v).toFixed(1)}`);

  // Shaded area from lo up to the score.
  const fillPts: string[] = [`${xOf(lo).toFixed(1)},${baseY}`];
  for (let v = lo; v <= iq; v += step) fillPts.push(`${xOf(v).toFixed(1)},${yOf(v).toFixed(1)}`);
  fillPts.push(`${xOf(iq).toFixed(1)},${baseY}`);

  const markX = xOf(iq);
  const ticks = [55, 70, 85, 100, 115, 130, 145];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={locale === "en" ? `IQ ${iq} on a bell curve` : `IQ ${iq} ბელ-მრუდზე`}>
      <defs>
        <linearGradient id="iq-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--vivida-violet)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--vivida-cyan)" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* baseline */}
      <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="var(--border)" strokeWidth="1" />

      {/* ticks */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xOf(t)} y1={baseY} x2={xOf(t)} y2={baseY + 5} stroke="var(--border)" strokeWidth="1" />
          <text
            x={xOf(t)}
            y={baseY + 18}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
          >
            {t}
          </text>
        </g>
      ))}

      {/* shaded area up to score */}
      <polyline points={fillPts.join(" ")} fill="url(#iq-fill)" stroke="none" />
      {/* curve */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--vivida-violet)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* score marker */}
      <line x1={markX} y1={yOf(iq)} x2={markX} y2={baseY} stroke="var(--vivida-cyan)" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx={markX} cy={yOf(iq)} r="6" fill="var(--vivida-cyan)" />
      <g>
        <rect
          x={Math.min(Math.max(markX - 26, padX), W - padX - 52)}
          y={yOf(iq) - 30}
          width="52"
          height="22"
          rx="6"
          fill="var(--vivida-cyan)"
        />
        <text
          x={Math.min(Math.max(markX, padX + 26), W - padX - 26)}
          y={yOf(iq) - 15}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#0b0814"
        >
          {iq}
        </text>
      </g>
    </svg>
  );
}

/** A slim domain-strength bar. */
export function DomainBar({ label, pct }: { label: string; pct: number }) {
  const tone =
    pct >= 75 ? "var(--vivida-cyan)" : pct >= 45 ? "var(--vivida-violet)" : "var(--vivida-pink)";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground/85">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700")}
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
    </div>
  );
}
