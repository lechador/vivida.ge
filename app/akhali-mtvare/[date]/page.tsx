import type { Metadata } from "next"; import { notFound } from "next/navigation";
import { MoonPhaseDetail } from "@/components/seo/moon-event-pages"; import { moonEvents } from "@/lib/seo/moon-events";
type Props = { params: Promise<{ date: string }> }; export const revalidate = 86400;
export function generateStaticParams() { return moonEvents("new").map((e) => ({ date: e.iso })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { date } = await params; const e = moonEvents("new").find((x) => x.iso === date); if (!e) return {}; const title = `ახალი მთვარე ${e.label} — დრო და ნიშანი`; const description = `${e.label} ახალი მთვარე ${e.snapshot.signKa}-ში: ზუსტი თბილისის დრო, განათება, ასტრონომიული მონაცემები და პრაქტიკული გზამკვლევი.`; const url = `https://www.vivida.ge/akhali-mtvare/${date}`; return { title: { absolute: title }, description, alternates: { canonical: url } }; }
export default async function Page({ params }: Props) { const { date } = await params; const e = moonEvents("new").find((x) => x.iso === date); if (!e) notFound(); return <MoonPhaseDetail event={e} />; }
