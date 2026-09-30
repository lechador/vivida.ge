/**
 * Collect messages from an Auth.js error chain.
 *
 * `signIn()` from a server action rejects with the provider's original
 * error wrapped in Auth.js error types: a thrown plain Error lands under
 * `cause.err` of a CallbackRouteError (whose own `.message` is just a
 * docs link), while a returned null surfaces as CredentialsSignin.
 * Checking only the top-level `.message` therefore never sees the
 * provider's sentinel text ("EMAIL_NOT_VERIFIED", "PHONE_NO_ACCOUNT", …),
 * so every login-error mapping must go through this walker.
 */
export function authErrorText(err: unknown): string {
  const messages: string[] = [];
  const seen = new Set<unknown>();

  const visit = (value: unknown, depth: number) => {
    if (value == null || depth > 6 || seen.has(value)) return;
    seen.add(value);
    if (value instanceof Error) {
      messages.push(`${value.name}: ${value.message}`);
      visit((value as { cause?: unknown }).cause, depth + 1);
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.message === "string") messages.push(record.message);
      visit(record.err, depth + 1);
      visit(record.cause, depth + 1);
    }
  };

  visit(err, 0);
  return messages.join(" | ");
}
