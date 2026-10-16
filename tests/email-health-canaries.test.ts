import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { WATCHED_LIFECYCLE_KINDS } from "@/lib/email-health-canaries";

/**
 * Guards the alerting canary list.
 *
 * The original list watched `verification`, which despite the name is the
 * ordinary signup verification email and sends continuously — so the health
 * check would have reported "healthy" for the exact nine-week outage it was
 * written to detect. The re-nudge sequence is logged as `verify_reminder`.
 *
 * This was caught only by running the query against production. These tests keep
 * the list honest.
 */
describe("watched lifecycle kinds", () => {
  it("watches the re-nudge sequence, not the signup verification email", () => {
    expect(WATCHED_LIFECYCLE_KINDS).toContain("verify_reminder");
    // `verification` sends on every signup and would mask a dead re-nudge.
    expect(WATCHED_LIFECYCLE_KINDS).not.toContain("verification");
  });

  it("watches the two sequences that actually went silent", () => {
    expect(WATCHED_LIFECYCLE_KINDS).toContain("profile_incomplete");
    expect(WATCHED_LIFECYCLE_KINDS).toContain("winback");
  });

  it("excludes genuinely sparse kinds so the alert does not cry wolf", () => {
    // Birthday sends are a few dozen a year; a 14-day window would always fire.
    expect(WATCHED_LIFECYCLE_KINDS).not.toContain("birthday");
  });

  it("uses kind strings that the senders actually write", () => {
    const renudge = readFileSync(
      join(__dirname, "..", "lib", "renudge.ts"),
      "utf8",
    );
    const winback = readFileSync(
      join(__dirname, "..", "lib", "winback.ts"),
      "utf8",
    );

    // Each watched kind must be a real value written to email_send_log.kind.
    expect(renudge).toContain('"verify_reminder"');
    expect(renudge).toContain('"profile_incomplete"');
    expect(winback).toMatch(/kind:\s*"winback"/);
  });
});
