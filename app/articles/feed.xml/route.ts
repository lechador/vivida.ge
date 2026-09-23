import { articleUrl, listPublishedArticles } from "@/lib/articles";
import { getRequestLocale } from "@/lib/i18n/request-locale";

function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/gu, "")
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");
}

export async function GET(): Promise<Response> {
  const locale = await getRequestLocale();
  const articles = await listPublishedArticles(locale, { limit: 60 });
  const hub = articleUrl(locale);
  const title = locale === "ka" ? "Vivida · სტატიები" : "Vivida · Articles";
  const description =
    locale === "ka"
      ? "ახალი სტატიები ფსიქოლოგიაზე, ურთიერთობებზე, თვითგანვითარებასა და ასტროლოგიაზე."
      : "New articles on psychology, relationships, self-development and astrology.";

  const items = articles
    .slice()
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    )
    .map((article) => {
      const url = articleUrl(locale, article.slug);
      const image = new URL(article.imageUrl, hub).toString();
      return `
    <item>
      <title>${xml(article.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(article.excerpt)}</description>
      <pubDate>${article.publishedAt?.toUTCString() ?? article.createdAt.toUTCString()}</pubDate>
      <category>${xml(article.category)}</category>
      <media:content url="${xml(image)}" medium="image" type="image/webp" />
    </item>`;
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xml(title)}</title>
    <link>${xml(hub)}</link>
    <description>${xml(description)}</description>
    <language>${locale === "ka" ? "ka-GE" : "en"}</language>${items}
  </channel>
</rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
