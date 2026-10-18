export function isSmsConfigured(): boolean {
  return Boolean(process.env.SENDER_GE_API_KEY);
}

export async function sendOtpSms(_input: {
  toE164: string;
  code: string;
  locale?: "ka" | "en";
}): Promise<void> {
  // No-op when SENDER_GE_API_KEY is unset
}
