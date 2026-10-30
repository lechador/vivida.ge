/**
 * Pure, client-safe helpers for creating a synastry from the AI chat.
 *
 * Protocol:
 *  1. The model ends an answer with a directive line
 *     `[[SYNASTRY_PROPOSE|name|YYYY-MM-DD|HH:MM or unknown|city]]`. It never
 *     moves credits by itself.
 *  2. The server strips the directive from the stream and appends a
 *     "proposal" marker (resolved place + cost status) that the chat UI
 *     renders as a confirm card.
 *  3. Tapping confirm calls /api/ask/synastry, which charges exactly like the
 *     website unlock and appends a "result" marker the UI renders as a card.
 *
 * Markers are stored inline in `chart_chat_message.content`, so history
 * re-renders the cards without any schema change.
 */

export const DIRECTIVE_OPEN = "[[SYNASTRY_PROPOSE";

export type SynastryDirective = {
  name: string;
  date: string;
  time: string | null;
  city: string;
};

const DIRECTIVE_RE =
  /\[\[SYNASTRY_PROPOSE\|([^|\]]{1,60})\|(\d{4}-\d{2}-\d{2})\|([^|\]]{0,12})\|([^\]]{2,80})\]\]/;

export function parseDirective(raw: string): SynastryDirective | null {
  const m = DIRECTIVE_RE.exec(raw);
  if (!m) return null;
  const timeRaw = m[3].trim();
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(timeRaw) ? timeRaw : null;
  return {
    name: m[1].trim(),
    date: m[2],
    time,
    city: m[4].trim(),
  };
}

/** Length of the longest suffix of `s` that is a proper prefix of `needle`. */
function partialSuffix(s: string, needle: string): number {
  const max = Math.min(s.length, needle.length - 1);
  for (let len = max; len > 0; len--) {
    if (needle.startsWith(s.slice(s.length - len))) return len;
  }
  return 0;
}

/**
 * Streaming filter that hides the directive from the user. Text is released
 * as soon as it cannot be the start of a directive, so streaming stays live.
 */
export class DirectiveFilter {
  private held = "";
  private directive = "";
  private inDirective = false;

  push(chunk: string): string {
    if (this.inDirective) {
      this.directive += chunk;
      return "";
    }
    const s = this.held + chunk;
    this.held = "";
    const idx = s.indexOf(DIRECTIVE_OPEN);
    if (idx >= 0) {
      this.inDirective = true;
      this.directive = s.slice(idx);
      return s.slice(0, idx);
    }
    const keep = partialSuffix(s, DIRECTIVE_OPEN);
    this.held = s.slice(s.length - keep);
    return s.slice(0, s.length - keep);
  }

  /** Call once at end of stream: remaining visible text + raw directive. */
  end(): { text: string; directive: string | null } {
    const text = this.inDirective ? "" : this.held;
    this.held = "";
    return { text, directive: this.inDirective ? this.directive : null };
  }
}

// ── Inline markers ──────────────────────────────────────────────────────

export type SynastryProposalStatus = "pro" | "pay" | "insufficient" | "already";

export type SynastryProposal = {
  /** Stable id of this request, pairs a proposal with its later result. */
  key: string;
  name: string;
  date: string;
  time: string | null;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: SynastryProposalStatus;
  /** Credits the unlock costs a non-PRO user. */
  cost: number;
  balance: number;
};

export type SynastryChatResult = {
  key: string;
  partnerId: string;
  name: string;
  url: string;
  overall: number;
  verdict: string;
  scores: Array<{ id: string; label: string; emoji: string; value: number }>;
  aspects: string[];
  summary: string | null;
  strengths: string[];
  growth: string[];
};

type MarkerKind = "synastry-proposal" | "synastry-result";

const OPEN = "⟦vivida:";
const CLOSE = "⟧";

export function synastryKey(
  name: string,
  date: string,
  time: string | null,
): string {
  return `${name.trim().toLowerCase()}|${date}|${time ?? ""}`;
}

export function encodeMarker(kind: MarkerKind, payload: unknown): string {
  // The closing glyph must never appear inside the JSON body.
  const json = JSON.stringify(payload).replaceAll(CLOSE, "\\u27e7");
  return `\n\n${OPEN}${kind} ${json}${CLOSE}`;
}

export type ChatSegment =
  | { type: "text"; text: string }
  | { type: "proposal"; data: SynastryProposal }
  | { type: "result"; data: SynastryChatResult };

const MARKER_RE = /⟦vivida:(synastry-proposal|synastry-result) ([\s\S]*?)⟧/g;

/** Split a stored message into text and card segments. */
export function splitMarkers(raw: string): ChatSegment[] {
  // A marker still streaming in (opened, not yet closed) must never flash
  // as raw text.
  let content = raw;
  const openIdx = content.lastIndexOf(OPEN);
  if (openIdx >= 0 && content.indexOf(CLOSE, openIdx) === -1) {
    content = content.slice(0, openIdx);
  }
  const out: ChatSegment[] = [];
  let last = 0;
  // Text right before a card is trimmed: encodeMarker separates cards with
  // blank lines, and the chat bubble trims anyway.
  const pushText = (text: string) => {
    const t = text.replace(/\s+$/, "");
    if (t) out.push({ type: "text", text: t });
  };
  for (const m of content.matchAll(MARKER_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) pushText(content.slice(last, idx));
    try {
      const data = JSON.parse(m[2]);
      out.push(
        m[1] === "synastry-proposal"
          ? { type: "proposal", data: data as SynastryProposal }
          : { type: "result", data: data as SynastryChatResult },
      );
    } catch {
      /* corrupt marker is dropped, never shown raw */
    }
    last = idx + m[0].length;
  }
  if (last < content.length) {
    pushText(content.slice(last));
  }
  return out;
}

/** What the model should see for a stored message (no card JSON). */
export function stripMarkersForModel(content: string): string {
  return content.replace(MARKER_RE, (_m, kind: string) =>
    kind === "synastry-result"
      ? "[the compatibility reading was created and shown to the user]"
      : "[a confirmation card for the compatibility reading was shown]",
  );
}

/** Message text without any marker, for library summaries and previews. */
export function stripMarkers(content: string): string {
  return content.replace(MARKER_RE, "").trim();
}
