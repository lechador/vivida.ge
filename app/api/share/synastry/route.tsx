import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, profiles, users } from "@/db/schema";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL_KA,
  computeSynastry,
  overallVerdict,
  type SynastryCategory,
} from "@/lib/synastry";
import { signByIndex } from "@/lib/zodiac";

import { readFontBuffer } from "@/app/_fonts/load";

/**
 * GET /api/share/synastry?with={username}
 *
 * Renders a 1080×1920 (Instagram Story) PNG of the viewer's compatibility
 * with the named profile. Auth required so the directory isn't a public
 * scrape vector.
 *
 * Layout is intentionally satori-friendly: no `filter: blur`, no nested
 * radial-gradient backgrounds, no negative `inset`. Those make the
 * renderer hang in production on Vercel's Node runtime.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NOTO_REGULAR_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Regular.ttf",
  import.meta.url
);
const NOTO_BOLD_URL = new URL(
  "../../../_fonts/NotoSansGeorgian-Bold.ttf",
  import.meta.url
);

const TOP_CATEGORIES: SynastryCategory[] = [
  "love",
  "chemistry",
  "communication",
  "friendship",
];

export async function GET(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    const message = (err as Error)?.message ?? "unknown";
    console.error("[share/synastry]", err);
    return new Response(`Render failed: ${message}`, { status: 500 });
  }
}

async function handle(req: Request): Promise<Response> {
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

  const [viewerRow] = await db
    .select({
      name: users.name,
      displayName: profiles.displayName,
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

  const [targetRow] = await db
    .select({
      userId: users.id,
      name: users.name,
      displayName: profiles.displayName,
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
  const overall = Math.round(synastry.overall);
  const verdict = overallVerdict(synastry.overall);

  const viewerName =
    viewerRow.displayName ?? viewerRow.name?.split(" ")[0] ?? "შენ";
  const targetName =
    targetRow.displayName ?? targetRow.name?.split(" ")[0] ?? withUsername;

  const viewerSunIdx = viewerRow.chart.bodies?.sun?.signIndex;
  const targetSunIdx = targetRow.chart.bodies?.sun?.signIndex;
  if (typeof viewerSunIdx !== "number" || typeof targetSunIdx !== "number") {
    return new Response("Chart missing sun position", { status: 400 });
  }
  const viewerSun = signByIndex(viewerSunIdx);
  const targetSun = signByIndex(targetSunIdx);

  const [regular, bold] = await Promise.all([
    readFontBuffer(NOTO_REGULAR_URL),
    readFontBuffer(NOTO_BOLD_URL),
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
            "linear-gradient(160deg, #1a0f33 0%, #0b0814 50%, #2a1145 100%)",
          color: "#ffffff",
          fontFamily: "Noto",
          padding: "100px 80px",
        }}
      >
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
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#a78bfa",
              display: "flex",
              lineHeight: 1,
            }}
          >
            ✦ vivida
          </div>
        </div>

        {/* Names + signs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <NamePill
            name={viewerName}
            signLabel={viewerSun.labelKa}
            tint="#a78bfa"
          />
          <div
            style={{
              fontSize: 60,
              color: "#f472b6",
              display: "flex",
              fontWeight: 700,
            }}
          >
            ✦
          </div>
          <NamePill
            name={targetName}
            signLabel={targetSun.labelKa}
            tint="#22d3ee"
          />
        </div>

        {/* Big number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#c4b5fd",
              letterSpacing: "0.4em",
              marginBottom: 8,
              display: "flex",
            }}
          >
            თავსებადობა
          </div>
          <div
            style={{
              fontSize: 320,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              color: "#f472b6",
              lineHeight: 0.95,
              display: "flex",
            }}
          >
            {overall}%
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#a78bfa",
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
            gap: 18,
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

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#9ca3af",
              display: "flex",
            }}
          >
            გაიგე შენი თავსებადობა
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#22d3ee",
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
        "Cache-Control": "private, max-age=3600",
      },
    }
  );
}

function NamePill({
  name,
  signLabel,
  tint,
}: {
  name: string;
  signLabel: string;
  tint: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: `2px solid ${tint}`,
        borderRadius: 9999,
        padding: "20px 56px",
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          display: "flex",
        }}
      >
        {truncate(name, 16)}
      </div>
      <div
        style={{
          fontSize: 28,
          color: tint,
          marginTop: 4,
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
          width: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#ffffff",
          width: 280,
          display: "flex",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 18,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 9999,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            backgroundColor: "#a78bfa",
            display: "flex",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#ffffff",
          width: 100,
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
