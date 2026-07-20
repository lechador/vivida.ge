import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
export const metadata: Metadata = thematicHubMetadata("career");
export default function CareerHoroscopePage() { return <ThematicHoroscopeHub theme="career" />; }
