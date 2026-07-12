import type { GeocodeResult } from "@/lib/geocoding";

export type DateValue = { day: string; month: string; year: string };
export type TimeValue = { hour: string; minute: string; unknown: boolean };
export type PlaceValue = GeocodeResult | null;
export type Gender = "male" | "female";
export type VisibilityValue = {
  username: string;
};

export type WizardData = {
  date: DateValue;
  time: TimeValue;
  place: PlaceValue;
  gender: Gender | null;
  visibility: VisibilityValue;
};
