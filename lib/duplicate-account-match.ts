export type BirthIdentity = {
  name: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  latitude: number;
  longitude: number;
};

export function normalizeAccountName(value: string | null): string {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesBirthIdentity(
  birth: BirthIdentity,
  candidate: {
    name: string | null;
    dateOfBirth: string | null;
    timeOfBirth: string | null;
    latitude: number | null;
    longitude: number | null;
    verified: Date | null;
  },
): boolean {
  if (!candidate.verified) return false;
  if (candidate.dateOfBirth !== birth.dateOfBirth) return false;
  const name = normalizeAccountName(birth.name);
  if (!name || normalizeAccountName(candidate.name) !== name) return false;
  if ((candidate.timeOfBirth?.slice(0, 5) ?? null) !== birth.timeOfBirth)
    return false;
  if (candidate.latitude === null || candidate.longitude === null) return false;
  // Geocoders may resolve the same city a little differently.
  return (
    Math.abs(candidate.latitude - birth.latitude) <= 0.03 &&
    Math.abs(candidate.longitude - birth.longitude) <= 0.03
  );
}
