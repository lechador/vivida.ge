import { describe, expect, it } from "vitest";

import {
  matchesBirthIdentity,
  matchesConfirmedDuplicate,
} from "@/lib/duplicate-account-match";

const birth = {
  name: "  ნინო  ქავთარაძე ",
  dateOfBirth: "1993-05-17",
  timeOfBirth: "08:42",
  latitude: 41.7151,
  longitude: 44.8271,
};

const candidate = {
  name: "ნინო ქავთარაძე",
  dateOfBirth: "1993-05-17",
  timeOfBirth: "08:42:00",
  latitude: 41.716,
  longitude: 44.828,
  verified: new Date(),
};

describe("possible duplicate birth profile", () => {
  it("recognizes a verified account with the same name and birth details", () => {
    expect(matchesBirthIdentity(birth, candidate)).toBe(true);
  });

  it("does not warn on a common date or city alone", () => {
    expect(
      matchesBirthIdentity(birth, { ...candidate, name: "სხვა ადამიანი" }),
    ).toBe(false);
    expect(
      matchesBirthIdentity(birth, { ...candidate, timeOfBirth: null }),
    ).toBe(false);
    expect(matchesBirthIdentity(birth, { ...candidate, longitude: 45.1 })).toBe(
      false,
    );
    expect(matchesBirthIdentity(birth, { ...candidate, verified: null })).toBe(
      false,
    );
  });

  it("matches unknown times only to another unknown time", () => {
    expect(
      matchesBirthIdentity(
        { ...birth, timeOfBirth: null },
        { ...candidate, timeOfBirth: null },
      ),
    ).toBe(true);
  });
});

const newAccount = {
  name: "Lile Kopadze",
  dateOfBirth: "2001-03-11",
  timeOfBirth: "08:42",
  latitude: 41.7151,
  longitude: 44.8271,
  signupIpHash: "shared-ip-hash",
};

const existingAccount = {
  name: "Lili Kopadze",
  dateOfBirth: "2001-03-11",
  timeOfBirth: "08:42:59",
  latitude: 41.716,
  longitude: 44.828,
  verified: new Date(),
  signupIpHash: "shared-ip-hash",
};

describe("confirmed duplicate birth profile", () => {
  it("recognizes a nearby first-name spelling with the same surname, birth details, and signup IP", () => {
    expect(matchesConfirmedDuplicate(newAccount, existingAccount)).toBe(true);
  });

  it("requires a known, matching signup IP for both accounts", () => {
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        signupIpHash: "different-ip-hash",
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        signupIpHash: null,
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(
        { ...newAccount, signupIpHash: null },
        existingAccount,
      ),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(
        { ...newAccount, signupIpHash: null },
        { ...existingAccount, signupIpHash: null },
      ),
    ).toBe(false);
  });

  it("requires verified identity details, including a known and exact birth minute", () => {
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        verified: null,
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        dateOfBirth: "2001-03-12",
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        timeOfBirth: "08:43:00",
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(
        { ...newAccount, timeOfBirth: null },
        { ...existingAccount, timeOfBirth: null },
      ),
    ).toBe(false);
  });

  it("requires nearby birth coordinates", () => {
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        latitude: null,
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        longitude: 45.1,
      }),
    ).toBe(false);
  });

  it("does not treat a different surname or a substantially different first name as the same person", () => {
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        name: "Lili Beridze",
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        name: "Nina Kopadze",
      }),
    ).toBe(false);
    expect(
      matchesConfirmedDuplicate(newAccount, {
        ...existingAccount,
        name: "Li Kopadze",
      }),
    ).toBe(false);
  });

  it("compares Georgian first names by characters after normalizing case and spacing", () => {
    expect(
      matchesConfirmedDuplicate(
        { ...newAccount, name: "  ლილე   ქავთარაძე " },
        { ...existingAccount, name: "ლილი ქავთარაძე" },
      ),
    ).toBe(true);
  });
});
