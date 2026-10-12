// One-off campaign: "Vivida is now free + credits" announcement.
// Usage:
//   node scripts/announce-free-email.mjs test        → sends only to FOUNDER (preview)
//   node scripts/announce-free-email.mjs all --dry   → prints recipients, sends nothing
//   node scripts/announce-free-email.mjs all         → sends to ALL marketing-opted-in users
// Reads RESEND_API_KEY / RESEND_FROM / DATABASE_URL from process.env / .env.local.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// Load .env.local (simple parser, no dotenv dependency).
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const FOUNDER = "endeladzegivi@gmail.com";
const SITE = "https://www.vivida.ge";
const rawFrom = process.env.RESEND_FROM || "hello@vivida.ge";
const FROM = rawFrom.includes("<") ? rawFrom : `Vivida <${rawFrom}>`;
const KEY = process.env.RESEND_API_KEY;

const mode = process.argv[2] || "test";
const dry = process.argv.includes("--dry");

const C = {
  subject: "დღეიდან Vivida უფასოა ✨",
  intro:
    "დიდი სიახლე გვინდა გაგიზიაროთ: დღეიდან Vivida სრულიად უფასოა. ყველა ფუნქცია, რაც აქამდე გამოწერას საჭიროებდა, ახლა ღიაა ყველასთვის, ყოველდღიური ჰოროსკოპი, ნატალური რუკა, თავსებადობა და მეტი.",
  creditsIntro:
    "ზოგიერთი განსაკუთრებული ფუნქცია მუშაობს კრედიტებით, ჰოროსკოპის მოსმენა ხმით, AI ასტროლოგთან საუბარი, 7-დღიანი პროგნოზი, ღრმა თავსებადობა და ნატალური რუკის PDF ანგარიში. კრედიტების მოპოვება კი ძალიან მარტივია და უფასო:",
  earn: [
    { e: "👥", t: "მოიწვიე მეგობარი", d: "+10 კრედიტი ყოველ მოწვეულ მეგობარზე, ვინც დარეგისტრირდება." },
    { e: "🔥", t: "ყოველდღიური ვიზიტების სერია", d: "შემოდი ყოველ დღე, და მიიღე კრედიტები სერიის გაგრძელებისთვის." },
    { e: "✍️", t: "დღის პირველი პოსტი ფიდში", d: "+5 კრედიტი ყოველ დღე." },
    { e: "📸", t: "დაამატე პროფილის ფოტო", d: "+3 კრედიტი, ერთხელ." },
    { e: "🗓️", t: "ყოველთვიური ბონუსი", d: "+5 კრედიტი ყოველი თვის დასაწყისში, ავტომატურად." },
  ],
  giftTitle: "🎁 შენს ბალანსზე უკვე გელოდება კრედიტები",
  giftBody:
    "როგორც ჩვენს ერთ-ერთ პირველ მომხმარებელს, კრედიტები უკვე გერიცხება, შემოდი და ნახე შენი ბალანსი, დააგროვე მეტი და გახსენი ის, რაც გინდა.",
  button: "შემოდი და მიიღე კრედიტები",
  closing: "სითბოთი და ვარსკვლავური ენერგიით,<br/>Vivida-ს გუნდი",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function html(name) {
  const greeting = name ? `გამარჯობა, ${esc(name)}` : "გამარჯობა";
  const earn = C.earn
    .map(
      (f) => `
      <tr><td style="padding:10px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="34" valign="top" style="font-size:22px;line-height:1;">${f.e}</td>
          <td valign="top">
            <div style="color:#f1eef8;font-weight:700;font-size:16px;">${esc(f.t)}</div>
            <div style="color:#c2bcdd;font-size:14px;line-height:1.55;margin-top:3px;">${esc(f.d)}</div>
          </td>
        </tr></table>
      </td></tr>`
    )
    .join("");
  return `<!doctype html><html lang="ka"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(C.subject)}</title></head>
<body style="margin:0;padding:0;background:#0b0814;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0814;">
<tr><td align="center" style="padding:28px 14px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#14102a;border:1px solid #2a2247;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <tr><td style="height:6px;background:#8b5cf6;background:linear-gradient(120deg,#a78bfa,#f472b6,#22d3ee);"></td></tr>
    <tr><td style="padding:30px 34px 8px;text-align:center;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-.5px;color:#b884f2;">vivida</div>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <div style="color:#f1eef8;font-size:20px;font-weight:700;">${greeting}</div>
      <p style="color:#c2bcdd;font-size:15px;line-height:1.6;margin:12px 0 0;">${esc(C.intro)}</p>
      <p style="color:#c2bcdd;font-size:15px;line-height:1.6;margin:12px 0 0;">${esc(C.creditsIntro)}</p>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <div style="color:#8d82a6;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-bottom:4px;">როგორ დააგროვო კრედიტები უფასოდ</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${earn}</table>
    </td></tr>
    <tr><td style="padding:14px 34px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(234,195,88,.07);border:1px solid rgba(234,195,88,.35);border-radius:12px;">
        <tr><td style="padding:18px 18px;">
          <div style="color:#eac358;font-weight:700;font-size:16px;">${esc(C.giftTitle)}</div>
          <p style="color:#d8d2ee;font-size:14px;line-height:1.6;margin:8px 0 0;">${esc(C.giftBody)}</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:22px 34px 0;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
        <td style="border-radius:12px;background:#8b5cf6;background:linear-gradient(120deg,#a78bfa,#f472b6);">
          <a href="${SITE}/credits" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;">${esc(C.button)}</a>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:26px 34px 30px;">
      <p style="color:#c2bcdd;font-size:14px;line-height:1.6;margin:0;">${C.closing}</p>
    </td></tr>
    <tr><td style="padding:16px 34px;border-top:1px solid #2a2247;text-align:center;">
      <div style="color:#7a7196;font-size:12px;">Vivida · ასტროლოგია ქართულად</div>
      <div style="color:#5f5880;font-size:11px;margin-top:6px;">
        <a href="${SITE}/account" style="color:#7a7196;">იმეილის პარამეტრები</a>
      </div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

async function send(to, name) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject: C.subject, html: html(name) }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(body)}`);
  return body.id;
}

async function main() {
  if (!KEY) throw new Error("RESEND_API_KEY missing");
  const sql = neon(process.env.DATABASE_URL);

  let recipients;
  if (mode === "test") {
    const r = await sql`SELECT email, name FROM "user" WHERE email=${FOUNDER}`;
    recipients = r.length ? r : [{ email: FOUNDER, name: "Givi" }];
  } else if (mode === "all") {
    // Every marketing-opted-in user (no birth-data requirement this time).
    recipients = await sql`SELECT u.email, u.name FROM "user" u
      WHERE u.email_marketing = true AND u.email IS NOT NULL`;
  } else {
    throw new Error(`unknown mode: ${mode}`);
  }

  console.log(`mode=${mode} recipients=${recipients.length}${dry ? " (DRY RUN, nothing sent)" : ""}`);
  if (dry) {
    recipients.slice(0, 10).forEach((r) => console.log(" -", r.email, r.name ?? ""));
    return;
  }

  let ok = 0;
  for (const r of recipients) {
    try {
      const id = await send(r.email, r.name?.split(" ")[0] ?? null);
      ok++;
      console.log("sent", r.email, id);
    } catch (e) {
      console.log("FAIL", r.email, e.message);
    }
    await new Promise((res) => setTimeout(res, 600)); // stay under Resend rate limit
  }
  console.log(`done: ${ok}/${recipients.length} sent`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
