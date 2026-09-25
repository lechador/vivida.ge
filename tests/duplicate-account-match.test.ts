import { describe, expect, it } from "vitest";

import { matchesBirthIdentity } from "@/lib/duplicate-account-match";

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
