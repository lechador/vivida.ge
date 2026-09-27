export type BirthIdentity = {
  name: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  latitude: number;
  longitude: number;
};

type ExistingBirthIdentity = {
  name: string | null;
  dateOfBirth: string | null;
  timeOfBirth: string | null;
  latitude: number | null;
  longitude: number | null;
  verified: Date | null;
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
  candidate: ExistingBirthIdentity,
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

/** One Unicode character insertion, deletion, or substitution at most. */
function firstNamesWithinOneEdit(left: string, right: string): boolean {
  const a = Array.from(left);
  const b = Array.from(right);
  // Short names are too easy to collide, even with otherwise matching data.
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1)
    return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * High-confidence repeat registration: same signup IP and birth details,
 * with the same family name and at most a one-character given-name change.
 * Require a known birth minute and family name before refusing onboarding;
 * the older exact-name check remains an advisory warning for weaker matches.
 */
export function matchesConfirmedDuplicate(
  birth: BirthIdentity & { signupIpHash: string | null },
  candidate: ExistingBirthIdentity & { signupIpHash: string | null },
): boolean {
  if (!birth.signupIpHash || birth.signupIpHash !== candidate.signupIpHash)
    return false;
  if (!birth.timeOfBirth || !candidate.timeOfBirth) return false;
  if (!candidate.verified || candidate.dateOfBirth !== birth.dateOfBirth)
    return false;
  if (candidate.timeOfBirth.slice(0, 5) !== birth.timeOfBirth) return false;
  if (candidate.latitude === null || candidate.longitude === null) return false;
  if (
    Math.abs(candidate.latitude - birth.latitude) > 0.03 ||
    Math.abs(candidate.longitude - birth.longitude) > 0.03
  )
    return false;

  const currentName = normalizeAccountName(birth.name).split(" ");
  const existingName = normalizeAccountName(candidate.name).split(" ");
  if (currentName.length < 2 || existingName.length < 2) return false;
  if (currentName.slice(1).join(" ") !== existingName.slice(1).join(" "))
    return false;
  return firstNamesWithinOneEdit(currentName[0], existingName[0]);
}
