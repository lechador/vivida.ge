import type { Metadata } from "next"; import { notFound } from "next/navigation";
import { MoonPhaseDetail } from "@/components/seo/moon-event-pages"; import { moonEvents } from "@/lib/seo/moon-events";
type Props = { params: Promise<{ date: string }> }; export const revalidate = 86400;
export function generateStaticParams() { return moonEvents("full").map((e) => ({ date: e.iso })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { date } = await params; const e = moonEvents("full").find((x) => x.iso === date); if (!e) return {}; const title = `სავსე მთვარე ${e.label} — დრო და ნიშანი`; const description = `${e.label} სავსე მთვარე ${e.snapshot.signKa}-ში: ზუსტი თბილისის დრო, განათება, ასტრონომიული მონაცემები და ასტროლოგიური მნიშვნელობა.`; const url = `https://www.vivida.ge/savse-mtvare/${date}`; return { title: { absolute: title }, description, alternates: { canonical: url } }; }
export default async function Page({ params }: Props) { const { date } = await params; const e = moonEvents("full").find((x) => x.iso === date); if (!e) notFound(); return <MoonPhaseDetail event={e} />; }
