import { z } from "zod";

import { auth } from "@/auth";
import {
  addArticleComment,
  ARTICLE_COMMENT_MAX,
} from "@/lib/article-engagement";

export const runtime = "nodejs";

const Body = z.object({
  body: z.string().min(1).max(ARTICLE_COMMENT_MAX),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json().catch(() => null);
    const parsed = Body.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "invalid_comment" }, { status: 400 });
    }
    const { id } = await context.params;
    const result = await addArticleComment(userId, id, parsed.data.body);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 422 });
    }
    return Response.json(result.data, { status: 201 });
  } catch (error) {
    console.error("[articles.comment] failed", error);
    return Response.json({ error: "comment_failed" }, { status: 500 });
  }
}
