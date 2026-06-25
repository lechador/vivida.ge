import type { Metadata } from "next";

import {
  PeriodHoroscopeHub,
  periodHubMetadata,
} from "@/components/seo/period-horoscope-hub";

// ISR hourly — the underlying weekly horoscope rows are cached per ISO week.
export const revalidate = 3600;

export const metadata: Metadata = periodHubMetadata("week");

export default function WeeklyHoroscopeHubPage() {
  return <PeriodHoroscopeHub period="week" />;
}
