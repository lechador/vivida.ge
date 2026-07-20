import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
export const metadata: Metadata = thematicHubMetadata("finance");
export default function FinanceHoroscopePage() { return <ThematicHoroscopeHub theme="finance" />; }
