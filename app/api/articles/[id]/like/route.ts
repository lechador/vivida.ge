import { auth } from "@/auth";
import { toggleArticleLike } from "@/lib/article-engagement";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const result = await toggleArticleLike(userId, id);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 422 });
    }
    return Response.json(result.data);
  } catch (error) {
    console.error("[articles.like] failed", error);
    return Response.json({ error: "like_failed" }, { status: 500 });
  }
}
