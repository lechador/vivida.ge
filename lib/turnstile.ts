export const TURNSTILE_ERROR_KA =
  "ვერ დავადასტურეთ, რომ ადამიანი ხარ. სცადე ხელახლა.";

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteip?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    // Allow local/preview environments when Turnstile secret is not configured
    return true;
  }
  if (!token || token === "stub-token") return false;
  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteip) form.set("remoteip", remoteip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: form,
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
