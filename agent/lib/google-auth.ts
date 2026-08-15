import { importPKCS8, SignJWT } from "jose";
import { fetchJson } from "./http";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

let cachedToken:
  | { accessToken: string; expiresAtMs: number; scopeKey: string }
  | undefined;

function credentialsFromEnv(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SEO_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SEO_SERVICE_ACCOUNT_JSON is not valid JSON");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("client_email" in parsed) ||
    !("private_key" in parsed) ||
    typeof parsed.client_email !== "string" ||
    typeof parsed.private_key !== "string"
  ) {
    throw new Error(
      "GOOGLE_SEO_SERVICE_ACCOUNT_JSON must contain client_email and private_key",
    );
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function hasGoogleServiceAccount(): boolean {
  return Boolean(process.env.GOOGLE_SEO_SERVICE_ACCOUNT_JSON);
}

export async function getGoogleAccessToken(
  scopes: string[],
  signal?: AbortSignal,
): Promise<string> {
  const credentials = credentialsFromEnv();
  if (!credentials) {
    throw new Error("GOOGLE_SEO_SERVICE_ACCOUNT_JSON is not configured");
  }

  const scopeKey = [...scopes].sort().join(" ");
  if (
    cachedToken &&
    cachedToken.scopeKey === scopeKey &&
    cachedToken.expiresAtMs > Date.now() + 60_000
  ) {
    return cachedToken.accessToken;
  }

  const nowSeconds = Math.floor(Date.now() / 1_000);
  const key = await importPKCS8(credentials.private_key, "RS256");
  const assertion = await new SignJWT({ scope: scopeKey })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(credentials.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + 3_600)
    .sign(key);

  const body = new URLSearchParams({
    assertion,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
  });
  const token = await fetchJson<TokenResponse>(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal,
    },
  );

  cachedToken = {
    accessToken: token.access_token,
    expiresAtMs: Date.now() + token.expires_in * 1_000,
    scopeKey,
  };
  return token.access_token;
}
