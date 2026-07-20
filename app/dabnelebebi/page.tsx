import type { Metadata } from "next"; import { EclipseHub } from "@/components/seo/moon-event-pages";
export const metadata: Metadata = { title: { absolute: "მზისა და მთვარის დაბნელებები — 2026–2028" }, description: "მზისა და მთვარის დაბნელებების თარიღები, ტიპები, ხილვადობა და ცალკეული გზამკვლევები 2026–2028 წლებში NASA-ს მონაცემებით.", alternates: { canonical: "https://www.vivida.ge/dabnelebebi" }, keywords: ["დაბნელება", "მზის დაბნელება", "მთვარის დაბნელება", "შემდეგი დაბნელება"] };
export default function Page() { return <EclipseHub />; }
