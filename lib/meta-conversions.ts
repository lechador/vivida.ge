import { createHash } from "node:crypto";

type MetaEventName = "InitiateCheckout" | "Purchase" | "Subscribe";

export type MetaConversionInput = {
  eventName: MetaEventName;
  eventId: string;
  eventSourceUrl: string;
  email?: string | null;
  externalId?: string | null;
  countryCode?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  value: number;
  currency: string;
  contentId: string;
};

function hash(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function metaEventPayload(input: MetaConversionInput) {
  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [hash(input.email)];
  if (input.externalId) userData.external_id = [hash(input.externalId)];
  if (input.countryCode) userData.country = [hash(input.countryCode)];
  if (input.clientIpAddress) userData.client_ip_address = input.clientIpAddress;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  return {
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    event_source_url: input.eventSourceUrl,
    action_source: "website" as const,
    user_data: userData,
    custom_data: {
      value: input.value,
      currency: input.currency.toUpperCase(),
      content_ids: [input.contentId],
      content_type: "product",
    },
  };
}

/** Best-effort CAPI delivery; commerce must never fail because Meta is down. */
export async function sendMetaConversion(input: MetaConversionInput): Promise<boolean> {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  const datasetId = process.env.META_DATASET_ID ?? process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!token || !datasetId) return false;

  const version = process.env.META_GRAPH_API_VERSION ?? "v24.0";
  const body: Record<string, unknown> = { data: [metaEventPayload(input)] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${datasetId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.error("[meta/capi] delivery failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[meta/capi] delivery failed", error instanceof Error ? error.message : "unknown");
    return false;
  }
}

export function requestClientIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}
