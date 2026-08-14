/**
 * Live-sky data for /sky — "where is every planet RIGHT NOW, in MY chart?"
 *
 * Computes current transit positions plus each planet's angular speed (two
 * ephemeris samples → deg/hour; negative = retrograde), locates each transit
 * in the user's natal houses, and overlays the pre-generated transit library
 * so every placement ships with a ready interpretation — zero AI calls.
 *
 * The speed is what makes the client page feel alive: the wheel and degree
 * readouts extrapolate `longitude + speed × elapsed` every second, so the
 * Moon visibly creeps through arcminutes while you watch.
 */

import type { NatalChartJson } from "@/db/schema";
import {
  computeTransitsAt,
  detectCrossAspects,
  houseOfLongitude,
} from "./transits";
import { signByIndex } from "./zodiac";
import {
  getTransitLibraryEntries,
  overlayTransitAspects,
  transitHouseKey,
  transitSignKey,
  TRANSIT_SIGN_BODIES,
  type TransitBreakdownItem,
} from "./transit-library";
import type { UserLocale } from "./i18n/locale";

const SPEED_SAMPLE_HOURS = 6;

export type SkyPlanet = {
  key: string;
  /** Ecliptic longitude at `sampledAt` (0–360). */
  longitude: number;
  /** Angular speed in degrees/hour; negative while retrograde. */
  speedDegPerHour: number;
  retrograde: boolean;
  signIndex: number;
  /** Natal house this transit currently occupies (null without houses). */
  house: number | null;
  /** Library text for "this planet through your Nth house", if seeded. */
  houseText: string | null;
  /** Collective mood text for fast bodies in their current sign. */
  signText: string | null;
};

export type SkyData = {
  /** Epoch ms the positions were computed at — client extrapolates from here. */
  sampledAt: number;
  /** Ascendant longitude — orients the wheel exactly like the natal chart. */
  ascLng: number;
  houses: NatalChartJson["houses"];
  natal: Array<{ key: string; longitude: number }>;
  planets: SkyPlanet[];
  /** "Moon is in your Nth house right now" — the hero line. */
  moon: { house: number | null; signIndex: number; houseText: string | null };
  /** Tightest currently-active transit aspects with library interpretations. */
  aspects: TransitBreakdownItem[];
};

export async function composeSkyData(
  natal: NatalChartJson,
  locale: UserLocale = "ka",
): Promise<SkyData> {
  const now = new Date();
  const later = new Date(now.getTime() + SPEED_SAMPLE_HOURS * 3600_000);

  const current = computeTransitsAt(now);
  const future = computeTransitsAt(later);

  // Library keys we'll need in one batched read: house entry per placed
  // planet + sign entry for the fast movers.
  const keys: string[] = [];
  const placements = Object.entries(current).map(([key, pos]) => {
    const house = houseOfLongitude(pos.longitude, natal.houses);
    const signIndex = Math.floor(pos.longitude / 30);
    if (house) keys.push(transitHouseKey(key, house));
    if ((TRANSIT_SIGN_BODIES as readonly string[]).includes(key)) {
      keys.push(transitSignKey(key, signByIndex(signIndex).key));
    }
    return { key, pos, house, signIndex };
  });
  const entries = await getTransitLibraryEntries(keys, locale);

  const planets: SkyPlanet[] = placements.map(({ key, pos, house, signIndex }) => {
    const fut = future[key]?.longitude ?? pos.longitude;
    // Wrap-aware delta (Pisces → Aries crossing shouldn't read as -359°).
    let delta = fut - pos.longitude;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const speed = delta / SPEED_SAMPLE_HOURS;

    const houseEntry = house ? entries.get(transitHouseKey(key, house)) : null;
    const signEntry = (TRANSIT_SIGN_BODIES as readonly string[]).includes(key)
      ? entries.get(transitSignKey(key, signByIndex(signIndex).key))
      : null;

    return {
      key,
      longitude: pos.longitude,
      speedDegPerHour: speed,
      retrograde: speed < 0,
      signIndex,
      house,
      houseText: houseEntry?.body ?? null,
      signText: signEntry?.body ?? null,
    };
  });

  const natalBodies = Object.fromEntries(
    Object.entries(natal.bodies).map(([k, v]) => [k, { longitude: v.longitude }])
  );
  const active = detectCrossAspects(current, natalBodies).filter(
    (a) => a.orb <= 3
  );
  const aspects = await overlayTransitAspects(active, 6, locale);

  const moon = planets.find((p) => p.key === "moon");

  return {
    sampledAt: now.getTime(),
    ascLng: natal.ascendant.longitude,
    houses: natal.houses,
    natal: Object.entries(natal.bodies).map(([key, v]) => ({
      key,
      longitude: v.longitude,
    })),
    planets,
    moon: {
      house: moon?.house ?? null,
      signIndex: moon?.signIndex ?? 0,
      houseText: moon?.houseText ?? null,
    },
    aspects,
  };
}
