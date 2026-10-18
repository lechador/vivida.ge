import crypto from "crypto";

export function hashSignupIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex");
}

export async function checkNewSignup(_input: {
  email?: string;
  name?: string;
  ip?: string | null;
}): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  return { allowed: true };
}
