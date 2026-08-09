import type { GeocodeResult } from "@/lib/geocoding";

const STORAGE_KEY = "vivida_pending_natal_profile_v1";
export const PENDING_NATAL_PROFILE_TTL_MS = 2 * 60 * 60 * 1000;

export type PendingNatalProfile = {
  dateOfBirth: string;
  timeOfBirth: string | null;
  place: GeocodeResult;
};

type StoredPendingNatalProfile = PendingNatalProfile & {
  version: 1;
  savedAt: number;
};

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1900 &&
    year <= new Date().getUTCFullYear() &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

function isShortString(value: unknown, max = 300): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function isValidPlace(value: unknown): value is GeocodeResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    isShortString(value.name) &&
    isShortString(value.displayName) &&
    isShortString(value.country) &&
    isShortString(value.countryCode, 10) &&
    (value.admin1 === undefined || isShortString(value.admin1)) &&
    typeof value.latitude === "number" &&
    Number.isFinite(value.latitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    typeof value.longitude === "number" &&
    Number.isFinite(value.longitude) &&
    value.longitude >= -180 &&
    value.longitude <= 180 &&
    isShortString(value.timezone, 100) &&
    isOptionalNumber(value.population)
  );
}

/**
 * Keep the calculator draft in the current tab only. Session storage survives
 * the Google OAuth round-trip but disappears when the tab closes; the TTL is
 * an additional bound because birth inputs are sensitive personal data.
 */
export function savePendingNatalProfile(input: PendingNatalProfile): boolean {
  const target = storage();
  if (!target) return false;
  const payload: StoredPendingNatalProfile = {
    version: 1,
    savedAt: Date.now(),
    ...input,
  };
  try {
    target.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function readPendingNatalProfile(): PendingNatalProfile | null {
  const target = storage();
  if (!target) return null;
  try {
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      typeof value.savedAt !== "number" ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > Date.now() ||
      Date.now() - value.savedAt > PENDING_NATAL_PROFILE_TTL_MS ||
      !isValidDate(value.dateOfBirth) ||
      !isValidTime(value.timeOfBirth) ||
      !isValidPlace(value.place)
    ) {
      target.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      dateOfBirth: value.dateOfBirth,
      timeOfBirth: value.timeOfBirth,
      place: value.place,
    };
  } catch {
    try {
      target.removeItem(STORAGE_KEY);
    } catch {
      /* storage became unavailable */
    }
    return null;
  }
}

export function clearPendingNatalProfile(): void {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    /* best effort */
  }
}
