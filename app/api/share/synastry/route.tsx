import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, profiles, users } from "@/db/schema";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  computeSynastry,
  overallVerdict,
  type SynastryCategory,
} from "@/lib/synastry";
import { signByIndex } from "@/lib/zodiac";

/**
 * GET /api/share/synastry?with={username}
 *
 * Renders a 1080×1920 (Instagram Story) PNG of the viewer's compatibility
 * with the named profile. Auth required so the directory isn't a public
 * scrape vector.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTO_REGULAR =
  "https://fonts.gstatic.com/s/notosansgeorgian/v46/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdpvnzFj-f5WK0OQV.ttf";
const NOTO_BOLD =
  "https://fonts.gstatic.com/s/notosansgeorgian/v46/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdptnyVj-f5WK0OQV.ttf";

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`font fetch failed: ${url}`);
  return res.arrayBuffer();
}

const TOP_CATEGORIES: SynastryCategory[] = [
  "love",
  "chemistry",
  "communication",
  "friendship",
];

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const viewerId = session.user.id;

  const url = new URL(req.url);
  const withUsername = url.searchParams.get("with");
  if (!withUsername) {
    return new Response("Missing 'with' query param", { status: 400 });
  }

  // Viewer's chart + display info
  const [viewerRow] = await db
    .select({
      name: users.name,
      image: users.image,
      displayName: profiles.displayName,
      username: profiles.username,
      chart: charts.data,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(charts, eq(charts.userId, users.id))
    .where(eq(users.id, viewerId))
    .limit(1);

  if (!viewerRow?.chart) {
    return new Response("Viewer has no chart", { status: 400 });
  }

  // Target user via username
  const [targetRow] = await db
    .select({
      userId: users.id,
      name: users.name,
      image: users.image,
      displayName: profiles.displayName,
      username: profiles.username,
      chart: charts.data,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .leftJoin(charts, eq(charts.userId, profiles.userId))
    .where(eq(profiles.username, withUsername))
    .limit(1);

  if (!targetRow?.chart) {
    return new Response("Profile not found", { status: 404 });
  }

  if (targetRow.userId === viewerId) {
    return new Response("Cannot share self-synastry", { status: 400 });
  }

  const synastry = computeSynastry(viewerRow.chart, targetRow.chart);

  const viewerName =
    viewerRow.displayName ?? viewerRow.name?.split(" ")[0] ?? "შენ";
  const targetName =
    targetRow.displayName ?? targetRow.name?.split(" ")[0] ?? withUsername;

  const viewerSun = signByIndex(viewerRow.chart.bodies.sun.signIndex);
  const targetSun = signByIndex(targetRow.chart.bodies.sun.signIndex);

  const verdict = overallVerdict(synastry.overall);
  const overall = Math.round(synastry.overall);

  const [regular, bold] = await Promise.all([
    loadFont(NOTO_REGULAR),
    loadFont(NOTO_BOLD),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0b0814",
          backgroundImage:
            "radial-gradient(60% 35% at 50% 18%, rgba(167,139,250,0.5), transparent 70%), radial-gradient(50% 30% at 85% 60%, rgba(34,211,238,0.32), transparent 70%), radial-gradient(45% 30% at 15% 80%, rgba(244,114,182,0.32), transparent 70%)",
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "80px 70px",
          position: "relative",
        }}
      >
        {/* Sparkle stars sprinkled across the canvas */}
        {[
          { top: 120, left: 160, size: 6 },
          { top: 200, left: 880, size: 8 },
          { top: 380, left: 80, size: 5 },
          { top: 1200, left: 60, size: 6 },
          { top: 1340, left: 970, size: 9 },
          { top: 1640, left: 200, size: 5 },
          { top: 1750, left: 880, size: 7 },
          { top: 880, left: 1000, size: 4 },
          { top: 980, left: 70, size: 5 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: "9999px",
              backgroundColor: "#ffffff",
              opacity: 0.85,
              boxShadow: "0 0 16px rgba(167,139,250,0.8)",
              display: "flex",
            }}
          />
        ))}

        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            ✦
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            vivida
          </div>
        </div>

        {/* Two avatars */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
            marginTop: -40,
          }}
        >
          <Avatar
            imageUrl={viewerRow.image ?? null}
            fallback={viewerName}
            sunSymbol={viewerSun.symbol}
            tint="#a78bfa"
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              backgroundImage:
                "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1,
            }}
          >
            ✦
          </div>

          <Avatar
            imageUrl={targetRow.image ?? null}
            fallback={targetName}
            sunSymbol={targetSun.symbol}
            tint="#f472b6"
          />
        </div>

        {/* Names + signs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginTop: -20,
          }}
        >
          <NameLabel name={viewerName} signLabel={viewerSun.labelKa} />
          <div
            style={{
              fontSize: 44,
              color: "rgba(255,255,255,0.4)",
              display: "flex",
              fontWeight: 300,
            }}
          >
            ×
          </div>
          <NameLabel name={targetName} signLabel={targetSun.labelKa} />
        </div>

        {/* Big number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 0,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginBottom: 12,
              display: "flex",
            }}
          >
            თავსებადობა
          </div>
          <div
            style={{
              fontSize: 280,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 0.95,
              display: "flex",
            }}
          >
            {overall}%
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              backgroundImage:
                "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginTop: 8,
              display: "flex",
            }}
          >
            {verdict}
          </div>
        </div>

        {/* Category bars */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 14,
            marginTop: 0,
          }}
        >
          {TOP_CATEGORIES.map((cat) => {
            const score = Math.round(synastry.scores[cat]);
            return (
              <CategoryBar
                key={cat}
                emoji={CATEGORY_EMOJI[cat]}
                label={CATEGORY_LABEL_KA[cat]}
                score={score}
              />
            );
          })}
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.55)",
              display: "flex",
            }}
          >
            გაიგე შენი თავსებადობა
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            vivida.ge
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: "Noto", data: regular, weight: 400, style: "normal" },
        { name: "Noto", data: bold, weight: 700, style: "normal" },
      ],
      headers: {
        // Browser caches for an hour; CDN can keep it the same. Per-user
        // image so we keep it private.
        "Cache-Control": "private, max-age=3600",
      },
    }
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────

// Avatar circle with conic-gradient ring + sun symbol badge.
// next/og doesn't support conic-gradient, so we approximate the ring with
// nested coloured circles + a soft glow.
function Avatar({
  imageUrl,
  fallback,
  sunSymbol,
  tint,
}: {
  imageUrl: string | null;
  fallback: string;
  sunSymbol: string;
  tint: string;
}) {
  const SIZE = 280;
  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -18,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${tint}88 0%, transparent 70%)`,
          filter: "blur(30px)",
          display: "flex",
        }}
      />
      {/* Outer gradient ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          backgroundImage:
            "linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #22d3ee 100%)",
          padding: 6,
          display: "flex",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 9999,
            backgroundColor: "#0b0814",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              width={SIZE - 12}
              height={SIZE - 12}
              style={{
                width: SIZE - 12,
                height: SIZE - 12,
                borderRadius: 9999,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 130,
                fontWeight: 700,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                backgroundImage:
                  "linear-gradient(135deg, rgba(167,139,250,0.4), rgba(34,211,238,0.3))",
              }}
            >
              {(fallback?.[0] ?? "★").toUpperCase()}
            </div>
          )}
        </div>
      </div>
      {/* Sun symbol badge */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          right: -6,
          width: 86,
          height: 86,
          borderRadius: 9999,
          backgroundColor: "#0b0814",
          border: "4px solid",
          borderColor: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          color: tint,
          boxShadow: `0 0 28px ${tint}88`,
        }}
      >
        {sunSymbol}
      </div>
    </div>
  );
}

function NameLabel({
  name,
  signLabel,
}: {
  name: string;
  signLabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        maxWidth: 380,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          display: "flex",
          textAlign: "center",
        }}
      >
        {truncate(name, 14)}
      </div>
      <div
        style={{
          fontSize: 26,
          color: "rgba(255,255,255,0.55)",
          display: "flex",
        }}
      >
        {signLabel}
      </div>
    </div>
  );
}

function CategoryBar({
  emoji,
  label,
  score,
}: {
  emoji: string;
  label: string;
  score: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 36,
          width: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          fontSize: 30,
          color: "rgba(255,255,255,0.85)",
          width: 240,
          display: "flex",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 18,
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: 9999,
          overflow: "hidden",
          position: "relative",
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            backgroundImage:
              "linear-gradient(90deg, #a78bfa, #f472b6, #22d3ee)",
            borderRadius: 9999,
            display: "flex",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#ffffff",
          width: 90,
          textAlign: "right",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {score}%
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}
