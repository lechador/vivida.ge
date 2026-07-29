/**
 * The "მკითხაობა" cluster.
 *
 * Why this exists: "მკითხაობა" is the everyday Georgian word for
 * fortune-telling, and it's how a huge share of the audience actually
 * phrases the query — "ტაროზე მკითხაობა", "ონლაინ მკითხაობა უფასოდ",
 * "კარტებზე მკითხაობა". Before this module the string appeared nowhere
 * on the site, so every one of those searches went to competitors even
 * though we own the underlying product (tarot reader, natal chart,
 * numerology). This is a vocabulary gap, not a product gap.
 *
 * The hub at /mkitxaoba is a real directory page: it explains each
 * divination method we actually offer and links to it. We deliberately
 * do NOT invent methods we don't have (palmistry, coffee cup) as landing
 * pages — they're only named in the honest "what we don't do" copy, so
 * the page still matches those queries without promising a fake tool.
 */

export type FortuneMethod = {
  /** Internal link target — must be a route we really ship. */
  href: string;
  /** Card title, keyword-shaped. */
  titleKa: string;
  /** The query family this card is meant to satisfy. */
  taglineKa: string;
  bodyKa: string;
  /** Free / credit-gated — shown as a badge, keeps the page honest. */
  costKa: string;
  glyph: string;
};

export const FORTUNE_METHODS: FortuneMethod[] = [
  {
    href: "/taro",
    titleKa: "ტაროზე მკითხაობა",
    taglineKa: "დაუსვი კითხვა და გაშალე კარტები",
    bodyKa:
      "ყველაზე პირდაპირი მკითხაობა: წერ კონკრეტულ კითხვას, კარტები შემთხვევით იშლება (ფესვი, აწმყო, გზა) და პასუხს ქართულად იღებ — სამივე კარტი შენს სიტუაციაზეა მორგებული, და არა ზოგადი აღწერა. პირველი გაშლა უფასოა.",
    costKa: "პირველი კითხვა უფასო",
    glyph: "🃏",
  },
  {
    href: "/horoskopi",
    titleKa: "ჰოროსკოპი დღეს",
    taglineKa: "დღის, კვირისა და თვის პროგნოზი",
    bodyKa:
      "ყოველდღიური პროგნოზი თორმეტივე ზოდიაქოს ნიშნისთვის, რეალურ პლანეტარულ ტრანზიტებზე დაყრდნობით — და არა წინასწარ დაწერილი ტექსტების როტაციით. ყოველ დილას განახლდება.",
    costKa: "სრულიად უფასო",
    glyph: "🔮",
  },
  {
    href: "/nataluri-ruka",
    titleKa: "ნატალური რუკა",
    taglineKa: "ყველაზე ზუსტი პასუხი შენზე",
    bodyKa:
      "დაბადების თარიღი, დრო და ადგილი ერთ რუკად იკრიბება — მზე, მთვარე, ამომავალი ნიშანი და ცის თორმეტი სახლი. თუ მკითხაობაში სერიოზულად გაინტერესებს „რატომ ვარ ასეთი“, ეს საწყისი წერტილია.",
    costKa: "უფასო რუკა",
    glyph: "🌌",
  },
  {
    href: "/tavsebadoba",
    titleKa: "სიყვარულის თავსებადობა",
    taglineKa: "შენ და ის — რამდენად ხდებით",
    bodyKa:
      "შეადარე ორი ნიშანი ან ორი დაბადების თარიღი და ნახე, სად ემთხვევით და სად გიწევთ მუშაობა. ურთიერთობებზე მკითხაობის ყველაზე ხშირი კითხვა სწორედ ესაა.",
    costKa: "უფასო",
    glyph: "💞",
  },
  {
    href: "/numerologia",
    titleKa: "ნუმეროლოგია — ბედის რიცხვი",
    taglineKa: "შენი რიცხვი დაბადების თარიღიდან",
    bodyKa:
      "დაბადების თარიღი ერთ რიცხვამდე დაიყვანება და ეს რიცხვი ხასიათს, ძლიერ მხარეებსა და ცხოვრების გზას აღწერს. მკითხაობის ის სახეობაა, სადაც შედეგი ყოველთვის ერთი და იგივეა — შემთხვევითობის გარეშე.",
    costKa: "უფასო კალკულატორი",
    glyph: "🔢",
  },
  {
    href: "/chinuri-horoskopi",
    titleKa: "ჩინური ჰოროსკოპი",
    taglineKa: "შენი ცხოველი დაბადების წლით",
    bodyKa:
      "აღმოსავლური სისტემა თორმეტი ცხოველით — ვირთხიდან ღორამდე. დაბადების წელი განსაზღვრავს შენს ნიშანს, ხასიათსა და იმას, თუ ვისთან გიწევს ყველაზე ადვილად.",
    costKa: "უფასო",
    glyph: "🐉",
  },
  {
    href: "/mtvaris-kalendari",
    titleKa: "მთვარის კალენდარი",
    taglineKa: "მთვარის ფაზა და ხელსაყრელი დღეები",
    bodyKa:
      "ტრადიციულად საქმის დაწყებას, თმის შეჭრასა და მნიშვნელოვან გადაწყვეტილებებს მთვარის ფაზას უსადაგებდნენ. კალენდარი დღევანდელ ფაზასა და უახლოეს სავსე და ახალ მთვარეს გიჩვენებს.",
    costKa: "უფასო",
    glyph: "🌙",
  },
  {
    href: "/ighbliani-dgheebi",
    titleKa: "იღბლიანი დღეები",
    taglineKa: "როდის გიწევს ხელი",
    bodyKa:
      "ასტროლოგიური კალენდრის მიხედვით შერჩეული დღეები, როცა ტრანზიტები ხელს გიწყობს — და ცალკე სია იმ დღეებისა, როცა სიფრთხილე გირჩევნია.",
    costKa: "უფასო",
    glyph: "🍀",
  },
];

/**
 * Latin-on-QWERTY spellings of the same queries. Georgians very often
 * type without switching layout, and these produce zero matches against
 * pure-ქართული copy. Surfaced as a visible "ხშირი ძიებები" strip.
 */
export const MKITXAOBA_LATIN_QUERIES = [
  "mkitxaoba",
  "mkitkhaoba",
  "onlain mkitxaoba",
  "taroze mkitxaoba",
  "ufaso mkitxaoba",
  "kartebze mkitxaoba",
  "mkitxaoba onlain ufasod",
  "mkitxavi",
  "momavlis gageba",
  "taros gashla",
  "horoskopi",
  "bedis gageba",
];

/** Georgian-script variants — used for <meta keywords> + FAQ phrasing. */
export const MKITXAOBA_KEYWORDS_KA = [
  "მკითხაობა",
  "ონლაინ მკითხაობა",
  "ტაროზე მკითხაობა",
  "უფასო მკითხაობა",
  "კარტებზე მკითხაობა",
  "მკითხაობა ონლაინ უფასოდ",
  "მკითხაობა ტაროზე ონლაინ",
  "მკითხავი",
  "მომავლის გაგება",
  "ბედის გაგება",
  "სიყვარულზე მკითხაობა",
  "მკითხაობა ქართულად",
];

export const MKITXAOBA_FAQ = [
  {
    q: "სად შემიძლია უფასოდ მკითხაობა ონლაინ?",
    a: "ამ გვერდიდან — ტაროზე მკითხაობის პირველი გაშლა, დღის ჰოროსკოპი, ნატალური რუკა, თავსებადობა და ბედის რიცხვი უფასოა და რეგისტრაციის გარეშე იწყება. ტაროს დამატებითი კითხვები კრედიტებით მუშაობს, კრედიტების უფასოდ დაგროვება კი მარტივია.",
  },
  {
    q: "რა განსხვავებაა ტაროზე მკითხაობასა და ჰოროსკოპს შორის?",
    a: "ჰოროსკოპი პლანეტების რეალურ მოძრაობას ეყრდნობა და ყველასთვის ერთ პერიოდზეა — დღეზე, კვირაზე, თვეზე. ტაროზე მკითხაობა კი კონკრეტულ კითხვას პასუხობს: შენ სვამ შეკითხვას, კარტები შემთხვევით იშლება და პასუხი მხოლოდ შენს სიტუაციას ეხება.",
  },
  {
    q: "მკითხაობა მართლა მუშაობს?",
    a: "მკითხაობა მომავლის გარანტია არაა და ჩვენ ასეთს არც გპირდებით. ის ხედვის ინსტრუმენტია — გეხმარება საკუთარი სიტუაცია სხვა კუთხიდან დაინახო, კითხვა ზუსტად ჩამოაყალიბო და გადაწყვეტილება უფრო გააზრებულად მიიღო. გადაწყვეტილებას ყოველთვის შენ იღებ.",
  },
  {
    q: "ყავის ჭიქაზე ან ხელზე მკითხაობას აკეთებთ?",
    a: "არა — ყავის ჭიქასა და ხელის გულს ფოტოს გარეშე ვერავინ წაიკითხავს, ამიტომ ასეთ სერვისს არ ვთავაზობთ. Vivida-ზე ის მეთოდებია, სადაც შედეგი შენს რეალურ მონაცემებს ეყრდნობა: ტარო, დაბადების რუკა, ნუმეროლოგია და ასტროლოგიური კალენდარი.",
  },
  {
    q: "საჭიროა თუ არა რეგისტრაცია?",
    a: "არა, დასაწყებად არა. ჰოროსკოპს, თავსებადობასა და ბედის რიცხვს რეგისტრაციის გარეშე ნახავ. ანგარიში მაშინ დაგჭირდება, როცა შედეგების შენახვა, პერსონალური დღიური პროგნოზი ან ტაროს დამატებითი კითხვები დაგინტერესდება.",
  },
];
