/**
 * Cloudflare R2 client. R2 is S3-API-compatible, so we use the standard
 * AWS SDK pointed at R2's endpoint.
 *
 * Uploads use **presigned URLs**: the server generates a short-lived signed
 * URL the browser PUTs the file directly to. Bytes never proxy through us.
 */

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  const accountId = requireEnv("R2_ACCOUNT_ID");
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // AWS SDK v3 (≥3.730) defaults to "WHEN_SUPPORTED" which bakes a
    // checksum requirement into presigned PUT URLs. Browsers' XHR/fetch
    // don't send that header, so R2 returns 403 / signature mismatch and
    // the upload silently dies. Force the SDK back to the legacy
    // behavior so the URL only requires what the browser actually sends.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return _client;
}

/** Generate a presigned URL the browser can PUT a file directly to. */
export async function presignedUploadUrl({
  key,
  contentType,
  expiresIn = 5 * 60,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: requireEnv("R2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client(), cmd, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(
    new DeleteObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
    })
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await client().send(
      new HeadObjectCommand({
        Bucket: requireEnv("R2_BUCKET_NAME"),
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

export function publicUrlFor(key: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  return `${base}/${key}`;
}

export const PHOTO_LIMITS = {
  MAX_PER_USER: 6,
  // Pre-compression cap. The browser shrinks every photo to a long-side
  // ≤ 2000 px JPEG before PUT-ing, so the actual bytes that hit R2 are
  // typically ~300-700 KB. The 10 MB cap is a safety net for raw input.
  MAX_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
};
