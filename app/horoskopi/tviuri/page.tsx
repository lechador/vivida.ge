import type { Metadata } from "next";

import {
  PeriodHoroscopeHub,
  periodHubMetadata,
} from "@/components/seo/period-horoscope-hub";

// ISR hourly — the underlying monthly horoscope rows are cached per month.
export const revalidate = 3600;

export const metadata: Metadata = periodHubMetadata("month");

export default function MonthlyHoroscopeHubPage() {
  return <PeriodHoroscopeHub period="month" />;
}
