/**
 * Seed a disposable local Postgres with enough data to audit signed-in
 * mobile layouts. Never run against production: it hard-checks the host.
 */
import crypto from "node:crypto";
import { Client } from "pg";

const connectionString = process.env.SEED_DATABASE_URL;
if (!connectionString || !/127\.0\.0\.1|localhost/.test(connectionString)) {
  throw new Error("SEED_DATABASE_URL must point at localhost");
}

const ids = {
  nino: "11111111-1111-4111-8111-111111111111",
  luka: "22222222-2222-4222-8222-222222222222",
  ana: "33333333-3333-4333-8333-333333333333",
  newbie: "44444444-4444-4444-8444-444444444444",
  giorgi: "55555555-5555-4555-8555-555555555555",
  mariam: "66666666-6666-4666-8666-666666666666",
  saba: "77777777-7777-4777-8777-777777777777",
  tamar: "88888888-8888-4888-8888-888888888888",
  david: "99999999-9999-4999-8999-999999999999",
  elene: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  nikoloz: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  sofia: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
};

const people = [
  {
    id: ids.nino,
    name: "ნინო ტესტაძე",
    username: "nino-audit",
    displayName: "ნინო ტესტაძე",
    email: "nino.audit@vivida.test",
    dob: "1994-07-14",
    tob: "14:30:00",
    gender: "female",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "ასტროლოგიის მოყვარული, ვკითხულობ ნატალურ რუკებს და მიყვარს გრძელი, დაწვრილებითი ანალიზები. მაინტერესებს მთვარის ფაზები, ტრანზიტები და თავსებადობა.",
  },
  {
    id: ids.luka,
    name: "ლუკა მეგობრიშვილი",
    username: "luka-audit",
    displayName: "ლუკა მეგობრიშვილი",
    email: "luka.audit@vivida.test",
    dob: "1990-03-02",
    tob: "08:15:00",
    gender: "male",
    city: "ბათუმი",
    lat: 41.6168,
    lon: 41.6367,
    bio: "მოგზაური და ფოტოგრაფი. ვეძებ ადამიანებს, ვისაც ვარსკვლავებზე საუბარი უყვარს.",
  },
  {
    id: ids.ana,
    name: "ანა კალანდაძე",
    username: "ana-audit",
    displayName: "ანა კალანდაძე",
    email: "ana.audit@vivida.test",
    dob: "1988-11-21",
    tob: "21:05:00",
    gender: "female",
    city: "ქუთაისი",
    lat: 42.2679,
    lon: 42.6946,
    bio: "ტაროს მკითხავი, პრემიუმ მომხმარებელი. ვწერ ხელნაწერ დღიურს და ვაკვირდები მთვარის ციკლებს.",
  },
  {
    id: ids.newbie,
    name: "ახალი მომხმარებელი",
    username: "new-audit",
    displayName: "ახალი მომხმარებელი",
    email: "new.audit@vivida.test",
    dob: null,
    tob: null,
    gender: null,
    city: null,
    lat: null,
    lon: null,
    bio: null,
  },
  {
    id: ids.giorgi,
    name: "გიორგი მაღალაშვილი",
    username: "giorgi-audit",
    displayName: "გიორგი მაღალაშვილი",
    email: "giorgi.audit@vivida.test",
    dob: "1992-05-09",
    tob: "06:40:00",
    gender: "male",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "პროგრამისტი, ღამის ფილოსოფოსი. მჯერა, რომ სატურნი ყველაფერს ხსნის.",
  },
  {
    id: ids.mariam,
    name: "მარიამ ჩხეიძე",
    username: "mariam-audit",
    displayName: "მარიამ ჩხეიძე",
    email: "mariam.audit@vivida.test",
    dob: "1996-02-18",
    tob: "12:10:00",
    gender: "female",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "ფსიქოლოგიის სტუდენტი. მაინტერესებს ემოციური ინტელექტი და ადამიანური ურთიერთობები.",
  },
  {
    id: ids.saba,
    name: "საბა ბერიძე",
    username: "saba-audit",
    displayName: "საბა ბერიძე",
    email: "saba.audit@vivida.test",
    dob: "1985-09-30",
    tob: "18:55:00",
    gender: "male",
    city: "რუსთავი",
    lat: 41.5495,
    lon: 44.9932,
    bio: "მუსიკოსი. ვეძებ შთაგონებას მთვარის კალენდარში.",
  },
  {
    id: ids.tamar,
    name: "თამარ გელაშვილი",
    username: "tamar-audit",
    displayName: "თამარ გელაშვილი",
    email: "tamar.audit@vivida.test",
    dob: "1999-12-12",
    tob: "23:25:00",
    gender: "female",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "დიზაინერი. ვქმნი პატარა რიტუალებს ყოველდღიურობისთვის.",
  },
  {
    id: ids.david,
    name: "დავით ჯაფარიძე",
    username: "david-audit",
    displayName: "დავით ჯაფარიძე",
    email: "david.audit@vivida.test",
    dob: "1983-06-07",
    tob: "04:05:00",
    gender: "male",
    city: "ზუგდიდი",
    lat: 42.5088,
    lon: 41.8709,
    bio: "მასწავლებელი და მოყვარული ასტronომი. ვაკვირდები პლანეტების მოძრაობას.",
  },
  {
    id: ids.elene,
    name: "ელენე ნოზაძე",
    username: "elene-audit",
    displayName: "ელენე ნოზაძე",
    email: "elene.audit@vivida.test",
    dob: "1997-08-25",
    tob: "09:50:00",
    gender: "female",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "ჟურნალისტი. ვწერ ადამიანებზე და მათ ისტორიებზე.",
  },
  {
    id: ids.nikoloz,
    name: "ნიკოლოზ ქავთარაძე",
    username: "nikoloz-audit",
    displayName: "ნიკოლოზ ქავთარაძე",
    email: "nikoloz.audit@vivida.test",
    dob: "1991-01-16",
    tob: "17:35:00",
    gender: "male",
    city: "გორი",
    lat: 41.9841,
    lon: 44.1086,
    bio: "სპორტსმენი. მჯერა დისციპლინისა და მზის ენერგიის.",
  },
  {
    id: ids.sofia,
    name: "სოფია ლომიძე",
    username: "sofia-audit",
    displayName: "სოფია ლომიძე",
    email: "sofia.audit@vivida.test",
    dob: "2000-04-03",
    tob: "11:11:00",
    gender: "female",
    city: "თბილისი",
    lat: 41.6938,
    lon: 44.8015,
    bio: "სტუდენტი, მკითხველი, მეოცნებე. ახალი ვარ აქ და ვეძებ მეგობრებს.",
  },
];

const client = new Client({ connectionString });
await client.connect();

async function q(sql, params = []) {
  return client.query(sql, params);
}

await q("BEGIN");

// Reset only our seeded identities.
const allIds = Object.values(ids);
// Test-result rows survive user deletion (user_id ON DELETE SET NULL).
await q(
  `DELETE FROM iq_result WHERE user_id = ANY($1::text[]) OR id LIKE '%audit%'`,
  [allIds],
);
await q(
  `DELETE FROM eq_result WHERE user_id = ANY($1::text[]) OR id LIKE '%audit%'`,
  [allIds],
);
await q(
  `DELETE FROM big_five_result WHERE user_id = ANY($1::text[]) OR id LIKE '%audit%'`,
  [allIds],
);
await q(`DELETE FROM "user" WHERE id = ANY($1::text[])`, [allIds]);

for (const p of people) {
  await q(
    `INSERT INTO "user" (id, name, email, "emailVerified", interface_language, is_premium, premium_until, created_at)
     VALUES ($1,$2,$3,now(),$7,$4,$5, now() - ($6 || ' days')::interval)`,
    [
      p.id,
      p.name,
      p.email,
      p.id === ids.ana,
      p.id === ids.ana ? new Date(Date.now() + 30 * 864e5) : null,
      Math.floor(Math.random() * 40) + 1,
      p.id === ids.ana ? "en" : "ka",
    ],
  );

  await q(
    `INSERT INTO profile (user_id, date_of_birth, time_of_birth, gender, latitude, longitude, city_name, timezone, username, display_name, bio, discoverable)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)`,
    [
      p.id,
      p.dob,
      p.tob,
      p.gender,
      p.lat,
      p.lon,
      p.city,
      "Asia/Tbilisi",
      p.username,
      p.displayName,
      p.bio,
    ],
  );

  await q(`INSERT INTO credit_account (user_id, balance) VALUES ($1,$2)`, [
    p.id,
    p.id === ids.nino ? 42 : p.id === ids.newbie ? 4 : 12,
  ]);
}

// Credit history for the main account.
for (const [amount, reason, days] of [
  [4, "signup_bonus", 40],
  [20, "referral", 30],
  [25, "purchase", 20],
  [-2, "spend_synastry", 10],
  [-5, "spend_iq", 5],
]) {
  await q(
    `INSERT INTO credit_transaction (id, user_id, amount, reason, created_at)
     VALUES ($1,$2,$3,$4, now() - ($5 || ' days')::interval)`,
    [crypto.randomUUID(), ids.nino, amount, reason, days],
  );
}

// Friendships: Nino ↔ Luka accepted, Ana ↔ Nino accepted, Davit → Nino pending.
await q(
  `INSERT INTO friendship (requester_id, recipient_id, status, created_at, responded_at)
   VALUES ($1,$2,'accepted',now() - interval '30 days',now() - interval '29 days'),
          ($3,$1,'accepted',now() - interval '12 days',now() - interval '11 days'),
          ($4,$1,'pending',now() - interval '2 days',NULL)`,
  [ids.nino, ids.luka, ids.ana, ids.david],
);

// Posts with varied content lengths, including a long unbroken token.
const posts = [
  {
    id: "post-1",
    user: ids.luka,
    body: "დღეს ვიყავი ბათუმის ბორდინგზე და დავინახე, როგორ ჩადიოდა მზე ზღვაში. იცით, რა საინტერესოა? ვენერა ისევ ჩემს მეშვიდე სახლშია და ყველა საუბარი უფრო თბილი ხდება. ვინც აქ ხართ, მოყევით, როგორ გაატარეთ დღე.",
    days: 1,
  },
  {
    id: "post-2",
    user: ids.mariam,
    body: "ემოციური ინტელექტის ტესტი დავასრულე და საკმაოდ საინტერესო შედეგი მივიღე. ჩემი ყველაზე ძლიერი მხარე ემპათიაა, ყველაზე რთული კი საკუთარი ემოციების რეგულირება. გირჩევთ, სცადოთ, საინტერესოა საკუთარი თავის შეცნობა.",
    days: 2,
  },
  {
    id: "post-3",
    user: ids.tamar,
    body: "https://vivida.ge/articles/rogor-davibrunot-yuradgheba-cifrul-samyaroshi?utm_source=feed&utm_medium=social&utm_campaign=mobile_audit_very_long_link_check",
    days: 3,
  },
  {
    id: "post-4",
    user: ids.giorgi,
    body: "მთვარე დღეს ვერძშია. ეს ნიშნავს, რომ ყველას უნდა სწრაფად მოქმედება და ახალი საქმის დაწყება. მე პირადად ვიწყებ ახალ პროექტს, ვნახოთ რა გამოვა. ვისაც მსგავსი გეგმები აქვს, გაგიზიაროთ.",
    days: 4,
  },
  {
    id: "post-5",
    user: ids.ana,
    body: "ტაროს სამი კარტი დღევანდელი დღისთვის: ვარსკვლავი, მთვარე და მზე. საოცარი კომბინაციაა, რომელიც ამბობს, რომ სიგნალებს უნდა ვენდოთ და არ გავჩერდეთ. ვისაც გინდათ, დაწერეთ, რას ნიშნავს ეს თქვენთვის.",
    days: 5,
  },
  {
    id: "post-6",
    user: ids.sofia,
    body: "ახალი ვარ აქ, გამარჯობა ყველას! მზის ნიშანი მაქვს ვერძი, მთვარე კირჩხიბში, ასცენდენტი კი სასწორში. ვეძებ მეგობრებს, ვისაც ასტროლოგია აინტერესებს.",
    days: 6,
  },
];

for (const post of posts) {
  await q(
    `INSERT INTO post (id, user_id, body, created_at) VALUES ($1,$2,$3, now() - ($4 || ' days')::interval)`,
    [post.id, post.user, post.body, String(post.days)],
  );
}

for (const [id, postId, user, body, days] of [
  [
    "comment-1",
    "post-1",
    ids.nino,
    "მშვენიერია! ბათუმის მზის ჩასვლა ნამდვილად განსაკუთრებულია.",
    1,
  ],
  [
    "comment-2",
    "post-1",
    ids.mariam,
    "მადლობა ამ სიტყვებისთვის, ძალიან თბილი პოსტია.",
    1,
  ],
  [
    "comment-3",
    "post-2",
    ids.ana,
    "მეც დავასრულე და ემპათიაც მაღალი მქონდა. საინტერესო ტესტია.",
    2,
  ],
  [
    "comment-4",
    "post-5",
    ids.luka,
    "მთვარე და ვარსკვლავი, ჩემი საყვარელი კომბინაციაა.",
    4,
  ],
]) {
  await q(
    `INSERT INTO post_comment (id, post_id, user_id, body, created_at) VALUES ($1,$2,$3,$4, now() - ($5 || ' days')::interval)`,
    [id, postId, user, body, String(days)],
  );
}

for (const [postId, user, kind] of [
  ["post-1", ids.nino, "like"],
  ["post-1", ids.ana, "like"],
  ["post-1", ids.tamar, "funny"],
  ["post-2", ids.nino, "like"],
  ["post-5", ids.nino, "like"],
  ["post-3", ids.mariam, "like"],
]) {
  await q(
    `INSERT INTO post_reaction (post_id, user_id, kind) VALUES ($1,$2,$3)`,
    [postId, user, kind],
  );
}

// Messages: Nino ↔ Luka, Nino ↔ Ana (unread).
const messages = [
  [
    ids.luka,
    ids.nino,
    "გამარჯობა ნინო! როგორ ხარ? მინდოდა მეთქვა, რომ შენი ნატალური რუკის ანალიზი ძალიან საინტერესო იყო.",
    3,
    true,
  ],
  [
    ids.nino,
    ids.luka,
    "გამარჯობა ლუკა! მადლობა, ძალიან სასიამოვნოა. რას ამბობს შენი ვენერა?",
    3,
    true,
  ],
  [
    ids.luka,
    ids.nino,
    "ვენერა მერწყულში მყავს, ამიტომ ვეძებ ღრმა და თავისუფალ ურთიერთობას. შენ რას ფიქრობ თავსებადობაზე?",
    2,
    false,
  ],
  [
    ids.ana,
    ids.nino,
    "ნინო, შენი ტაროს განლაგება ძალიან საინტერესო იყო. მინდა, ერთად განვიხილოთ ერთი დეტალი, რომელიც გამომრჩა. დამიკავშირდი, როცა თავისუფალი იქნები.",
    1,
    false,
  ],
];

for (const [sender, recipient, body, days, read] of messages) {
  await q(
    `INSERT INTO message (id, sender_id, recipient_id, body, read_at, created_at)
     VALUES ($1,$2,$3,$4,$5, now() - ($6 || ' days')::interval)`,
    [
      crypto.randomUUID(),
      sender,
      recipient,
      body,
      read ? new Date(Date.now() - 864e5) : null,
      String(days),
    ],
  );
}

// Notifications.
for (const [kind, payload, days, read] of [
  [
    "friend_request",
    { requesterId: ids.david, requesterName: "დავით ჯაფარიძე" },
    2,
    false,
  ],
  [
    "post_reaction",
    {
      actorId: ids.ana,
      actorName: "ანა კალანდაძე",
      postId: "post-1",
      kind: "like",
    },
    1,
    false,
  ],
  ["credit", { amount: 4, reason: "signup_bonus" }, 30, true],
]) {
  await q(
    `INSERT INTO notification (id, user_id, kind, payload, read_at, created_at)
     VALUES ($1,$2,$3,$4,$5, now() - ($6 || ' days')::interval)`,
    [
      crypto.randomUUID(),
      ids.nino,
      kind,
      JSON.stringify(payload),
      read ? new Date(Date.now() - 864e5) : null,
      String(days),
    ],
  );
}

// Library entries.
const libraryEntries = [
  {
    id: "lib-1",
    kind: "daily",
    sourceId: "daily-2026-10-31",
    title: "დღის ჰოროსკოპი",
    summary: "მთვარე ვერძში, დღე აქტიური და ენერგიულია.",
    content: {
      type: "daily",
      summary: "მთვარე ვერძში, დღე აქტიური და ენერგიულია.",
      body: "დღეს ენერგია მაღალია და კარგი დროა ახალი საქმის დასაწყებად. მოერიდეთ ნაჩქარევ გადაწყვეტილებებს.",
      themes: ["ენერგია", "ინიციატივა"],
    },
    days: 1,
  },
  {
    id: "lib-2",
    kind: "tarot",
    sourceId: "tarot-spread-1",
    title: "სამი კარტის განლაგება",
    summary: "ვარსკვლავი, მთვარე და მზე.",
    content: {
      type: "tarot",
      question: "რა მელოდება ამ კვირაში?",
      cards: [],
      reading:
        "ვარსკვლავი მიუთითებს იმედზე, მთვარე ინტუიციაზე, მზე კი სიცხადეზე. დაეყრდენი შენს შინაგან ხმას.",
      advice: "ნუ იჩქარებ, მიეცი საკუთარ თავს დრო.",
    },
    days: 4,
  },
  {
    id: "lib-3",
    kind: "ai",
    sourceId: "ai-chat-1",
    title: "საუბარი ვივიდას ასტროლოგთან",
    summary: "კარიერისა და ტრანზიტების შესახებ.",
    content: {
      type: "ai",
      question: "რას ნიშნავს სატურნის ტრანზიტი ჩემს მეათე სახლში?",
      answer:
        "სატურნის ტრანზიტი მეათე სახლში პასუხისმგებლობისა და კარიერული სიმწიფის პერიოდია.",
    },
    days: 9,
  },
];

for (const entry of libraryEntries) {
  await q(
    `INSERT INTO library_entry (id, user_id, kind, source_id, title, summary, content, favorite, occurred_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now() - ($9 || ' days')::interval)`,
    [
      entry.id,
      ids.nino,
      entry.kind,
      entry.sourceId,
      entry.title,
      entry.summary,
      JSON.stringify(entry.content),
      entry.kind === "tarot",
      String(entry.days),
    ],
  );
}

// Test results: one unlocked IQ, one locked IQ, EQ, Big Five, MBTI.
await q(
  `INSERT INTO iq_result (id, user_id, attempt_id, iq, theta, percentile, correct, total, domain_scores, answers, time_used_sec, created_at)
   VALUES
   ($1,$2,'attempt-audit-1',118,0.82,88,32,40,$3,'{}'::jsonb,1140, now() - interval '7 days'),
   ($4,$2,'attempt-audit-2',104,0.18,61,26,40,$3,'{}'::jsonb,1260, now() - interval '3 days')`,
  [
    "iq-audit-1",
    ids.nino,
    JSON.stringify({ numeric: 78, logic: 74, spatial: 69, pattern: 82 }),
    "iq-audit-2",
  ],
);

const answers = {};
for (let i = 1; i <= 200; i += 1) answers[i] = 3;

await q(
  `INSERT INTO eq_result (id, user_id, attempt_id, overall, band, domain_scores, answers, created_at)
   VALUES ($1,$2,'eq-attempt-audit',70,'high',$3,$4, now() - interval '6 days')`,
  ["eq-audit-1", ids.nino, JSON.stringify({}), JSON.stringify(answers)],
);

await q(
  `INSERT INTO big_five_result (id, user_id, attempt_id, trait_scores, answers, created_at)
   VALUES ($1,$2,'bf-attempt-audit',$3,$4, now() - interval '5 days')`,
  ["bf-audit-1", ids.nino, JSON.stringify({}), JSON.stringify(answers)],
);

for (const [id, type, days] of [
  ["mbti-audit-1", "INFJ", 8],
  ["mbti-audit-2", "INTJ", 20],
]) {
  await q(
    `INSERT INTO mbti_test_results (id, user_id, mbti_type, archetype_name_ge, scores, ai_synthesis_text, model, language, created_at)
     VALUES ($1,$2,$3,'მოაზროვნე ინტროვერტი',$4,$5,'audit','ka', now() - ($6 || ' days')::interval)`,
    [
      id,
      ids.nino,
      type,
      JSON.stringify({
        E: 32,
        I: 68,
        S: 40,
        N: 60,
        T: 55,
        F: 45,
        J: 62,
        P: 38,
      }),
      "შენ ხარ ღრმად მოაზროვნე და შთამაგონებელი ადამიანი, რომელიც სამყაროს საკუთარი ხედვით აღიქვამს.",
      String(days),
    ],
  );
}

// Unlock the first IQ result for Nino.
await q(
  `INSERT INTO credit_transaction (id, user_id, amount, reason, ref, created_at)
   VALUES ($1,$2,-5,'spend_iq','iq-audit-1', now() - interval '7 days')`,
  [crypto.randomUUID(), ids.nino],
);

// Reminder + reputation settings.
await q(
  `INSERT INTO reminder_setting (user_id, transit_push, transit_cadence, forecast_push, relationship_push)
   VALUES ($1,true,'weekly',true,true)`,
  [ids.nino],
);
await q(
  `INSERT INTO user_reputation (user_id, total) VALUES ($1, 120), ($2, 40), ($3, 260)`,
  [ids.nino, ids.luka, ids.ana],
);

// A pending friend request from Ana to Nino's friend list, plus a couple of
// pending incoming requests so the UI has real rows.
await q(
  `INSERT INTO friendship (requester_id, recipient_id, status) VALUES ($1,$2,'pending')
   ON CONFLICT DO NOTHING`,
  [ids.sofia, ids.nino],
);

await q("COMMIT");
await client.end();
console.log("seeded", people.length, "users");
