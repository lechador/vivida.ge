/**
 * Deliberately narrow account-identity signal for accounts from one IP.
 * Shared networks contain unrelated people, so IP alone is never a duplicate.
 * Require a full two-or-more-part name with the same surname and a one-edit
 * given-name difference, plus a one-edit email local-part difference. Short
 * names/locals are ignored because one changed letter is too ambiguous there.
 */

function nameParts(value: string | null | undefined): string[] | null {
  const parts = (value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}]+/gu, " ")
    .trim()
    .split(/\s+/);
  if (parts.length < 2 || parts.some((part) => !part)) return null;
  if (parts.join("").length < 10) return null;
  if (parts.at(-1)!.length < 5) return null;
  if (parts.slice(0, -1).join("").length < 4) return null;
  return parts;
}

function emailLocal(value: string | null | undefined): string | null {
  const email = (value ?? "").trim().normalize("NFKC").toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  // The +suffix is a delivery tag, not a separate mailbox identity.
  const local = email
    .slice(0, at)
    .split("+", 1)[0]
    .replace(/[^\p{L}]+/gu, "");
  return local.length >= 10 ? local : null;
}

/** Exact match or one substitution/insertion/deletion; no broad fuzzy score. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
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
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}

export function isLikelySameSignupPerson(
  incoming: {
    name: string | null | undefined;
    email: string | null | undefined;
  },
  existing: {
    name: string | null | undefined;
    email: string | null | undefined;
  },
): boolean {
  const aName = nameParts(incoming.name);
  const bName = nameParts(existing.name);
  const aLocal = emailLocal(incoming.email);
  const bLocal = emailLocal(existing.email);
  if (!aName || !bName || !aLocal || !bLocal) return false;
  if (aName.length !== bName.length) return false;
  if (aName.at(-1) !== bName.at(-1)) return false;
  return (
    withinOneEdit(aName.slice(0, -1).join(""), bName.slice(0, -1).join("")) &&
    withinOneEdit(aLocal, bLocal)
  );
}
