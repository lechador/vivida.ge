export async function setSmsMarketingConsent(
  _userId: string,
  _phone: string,
  _enabled: boolean,
): Promise<
  | { ok: true; changed: boolean }
  | { ok: false; reason: "phone_changed" | "verification_required" | "unavailable" }
> {
  return { ok: true, changed: true };
}
