import type { Metadata } from "next";
import { ThematicHoroscopeHub, thematicHubMetadata } from "@/components/seo/thematic-horoscope-pages";
export const metadata: Metadata = thematicHubMetadata("love");
export default function LoveHoroscopePage() { return <ThematicHoroscopeHub theme="love" />; }
