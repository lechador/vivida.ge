export type SiteSearchPageHit = {
  title: string;
  sub: string;
  url: string;
  category: string;
  icon?: string | null;
};

export type SiteSearchUserHit = {
  id: string;
  username: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
  sunSign: string | null;
};

const STATIC_PAGES: SiteSearchPageHit[] = [
  {
    title: "ნატალური რუკა",
    sub: "პირადი ასტროლოგიური რუკის კალკულატორი",
    url: "/nataluri-ruka",
    category: "ასტროლოგია",
    icon: "✦",
  },
  {
    title: "დღის ჰოროსკოპი",
    sub: "12 ზოდიაქოს ნიშნის დღიური პროგნოზი",
    url: "/horoskopi",
    category: "ჰოროსკოპი",
    icon: "☀️",
  },
  {
    title: "ზოდიაქოს თავსებადობა",
    sub: "წყვილების სინასტრია და თავსებადობა",
    url: "/tavsebadoba",
    category: "თავსებადობა",
    icon: "💞",
  },
  {
    title: "ტარო ონლაინ",
    sub: "3-კარტიანი გაშლა და 78 კარტის მნიშვნელობა",
    url: "/taro",
    category: "ტარო",
    icon: "🃏",
  },
  {
    title: "ტესტები და ქვიზები",
    sub: "IQ, EQ, Big Five და პიროვნების ტესტები",
    url: "/tests",
    category: "ტესტები",
    icon: "🧠",
  },
];

export function searchPages(query: string, limit: number = 8): SiteSearchPageHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return STATIC_PAGES.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.sub.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  ).slice(0, limit);
}

export async function searchPublicUsers(
  _query: string,
  _limit: number = 5,
): Promise<SiteSearchUserHit[]> {
  return [];
}
