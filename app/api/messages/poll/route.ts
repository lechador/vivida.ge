import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  pollInboundMessages,
  pollReadReceipts,
  pollTypingIndicators,
} from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PolledMessage = Awaited<ReturnType<typeof pollInboundMessages>>[number];

function serializeMessage(message: PolledMessage) {
  return {
    id: message.id,
    senderId: message.senderId,
    recipientId: message.recipientId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString() ?? null,
    sender: {
      name: message.senderName,
      image: message.senderImage,
      username: message.senderUsername,
      displayName: message.senderDisplayName,
    },
  };
}

/**
 * Short-lived, low-frequency replacement for the site-wide SSE function.
 *
 * Without `with`, /messages is showing the conversation list and this runs a
 * single inbound-message query. With `with`, it additionally returns only that
 * thread's typing state and read receipts. The client stops polling completely
 * while the browser tab is hidden.
 */
export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get("since");
  const partnerId = searchParams.get("with")?.trim() || undefined;
  const since = sinceParam ? new Date(sinceParam) : new Date();
  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "bad_since" }, { status: 400 });
  }

  // Capture before querying: anything committed after this instant belongs to
  // the next poll, so advancing the client cursor cannot create a gap.
  const now = new Date();

  if (!partnerId) {
    const messages = await pollInboundMessages(userId, since);
    return NextResponse.json({
      messages: messages.map(serializeMessage),
      typing: [],
      receipts: [],
      now: now.toISOString(),
    });
  }

  const [messages, typing, receipts] = await Promise.all([
    pollInboundMessages(userId, since, partnerId),
    pollTypingIndicators(userId, partnerId),
    pollReadReceipts(userId, since, partnerId),
  ]);

  return NextResponse.json({
    messages: messages.map(serializeMessage),
    typing,
    receipts,
    now: now.toISOString(),
  });
}
