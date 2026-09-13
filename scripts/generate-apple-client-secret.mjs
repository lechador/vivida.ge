import { readFile, writeFile } from "node:fs/promises";

import { importPKCS8, SignJWT } from "jose";

const {
  VIVIDA_APPLE_CLIENT_ID: clientId,
  VIVIDA_APPLE_KEY_ID: keyId,
  VIVIDA_APPLE_KEY_PATH: keyPath,
  VIVIDA_APPLE_SECRET_OUT: outputPath,
  VIVIDA_APPLE_TEAM_ID: teamId,
} = process.env;

const missing = Object.entries({
  VIVIDA_APPLE_CLIENT_ID: clientId,
  VIVIDA_APPLE_KEY_ID: keyId,
  VIVIDA_APPLE_KEY_PATH: keyPath,
  VIVIDA_APPLE_SECRET_OUT: outputPath,
  VIVIDA_APPLE_TEAM_ID: teamId,
})
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

const privateKey = await importPKCS8(await readFile(keyPath, "utf8"), "ES256");
const issuedAt = Math.floor(Date.now() / 1000);
const expiresAt = issuedAt + 180 * 24 * 60 * 60;
const clientSecret = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setSubject(clientId)
  .setAudience("https://appleid.apple.com")
  .setIssuedAt(issuedAt)
  .setExpirationTime(expiresAt)
  .sign(privateKey);

await writeFile(outputPath, `${clientSecret}\n`, { mode: 0o600 });
console.log(
  `Apple client secret written to ${outputPath}; expires ${new Date(expiresAt * 1000).toISOString()}`,
);
