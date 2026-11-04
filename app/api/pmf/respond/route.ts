import { eq } from "drizzle-orm";

import { db } from "@/db";
import { pmfSurveyResponses, users } from "@/db/schema";
import { isPmfAnswer, PMF_WAVE } from "@/lib/pmf-survey-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sean Ellis survey answer landing.
 *
 * Links in the survey email carry the reader's unsubscribe token (the same
 * opaque per-user token every lifecycle email already ships) plus the
 * chosen answer. One response per user per wave: a second tap updates the
 * answer rather than double-counting, so an accidental double-click or a
 * changed mind never distorts the score.
 */
function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#15101f;color:#fff;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px"><main style="max-width:420px;text-align:center"><h1 style="font-size:22px;margin:0 0 12px">${title}</h1><p style="color:#c9c2d9;line-height:1.6;margin:0">${body}</p></main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const answer = url.searchParams.get("a");
  if (!token || !isPmfAnswer(answer)) {
    return page(
      "ბმული არასრულია",
      "ეს ბმული ვერ ამოვიცანით. სცადე თავიდან მეილში არსებული ღილაკი.",
    );
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.unsubscribeToken, token))
    .limit(1);
  if (!user) {
    return page(
      "ბმული ვერ ამოვიცანით",
      "ეს ბმული ვადაგასულია ან არასწორია. მადლობა მაინც, რომ სცადე.",
    );
  }

  await db
    .insert(pmfSurveyResponses)
    .values({ userId: user.id, wave: PMF_WAVE, answer })
    .onConflictDoUpdate({
      target: [pmfSurveyResponses.userId, pmfSurveyResponses.wave],
      set: { answer },
    });

  return page(
    "მადლობა! პასუხი მივიღეთ",
    "შენი პასუხი ჩაიწერა და პირდაპირ გავლენას მოახდენს იმაზე, რასაც შემდეგ ავაშენებთ.",
  );
}
