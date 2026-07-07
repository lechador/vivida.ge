/**
 * Global spacing between Resend API calls within one invocation.
 *
 * The Resend account is rate-limited to 2 requests/second. The daily blast
 * used to stay under it by accident — each send was preceded by a ~30s
 * per-user AI generation. Since the interpretation libraries made
 * generation instant, a drain pass fires sends back-to-back and gets
 * 429-ed (2026-07-07: 121 of 141 daily emails failed). This gate is the
 * real throttle: every send reserves a slot ≥600ms after the previous one,
 * keeping a full blast safely under 2/s regardless of caller concurrency.
 *
 * Module state is per serverless instance, which is exactly the scope that
 * matters: the cron (email blast + birthday emails) runs in a single
 * invocation. One-off transactional emails in their own invocations pass
 * through without waiting.
 */

// 2 req/s nominal limit, but 600ms spacing still tripped sporadic 429s —
// network jitter compresses arrivals so a rolling 1s window at Resend's
// edge occasionally sees >2. ≥1s spacing keeps every window at 1 request.
const RESEND_MIN_INTERVAL_MS = 1100;

let nextSendSlot = 0;

/** Await a send slot. Reserves synchronously, so concurrent callers queue. */
export async function acquireResendSlot(): Promise<void> {
  const now = Date.now();
  const at = Math.max(now, nextSendSlot);
  nextSendSlot = at + RESEND_MIN_INTERVAL_MS;
  if (at > now) {
    await new Promise((resolve) => setTimeout(resolve, at - now));
  }
}
