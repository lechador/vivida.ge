/**
 * One-off: the AI astrologer follows up with a user after a wrong Jupiter
 * transit answer. Inserts an assistant message into her /ask thread and a
 * bell notification (kind=ask_nudge) deep-linking to /ask. Idempotent.
 *
 *   npx tsx --env-file=.env.local scripts/send-chart-correction-note.ts <userId>
 */
import { and, eq, like } from "drizzle-orm";

import { db } from "@/db";
import { chartChatMessages, notifications } from "@/db/schema";

const MARKER = "გიბრუნდები გულახდილი განმარტებით";

const BODY = `მარიამ, გიბრუნდები გულახდილი განმარტებით.

შენი ნატალური რუკა სრულიად სწორია: მზე მორიელში (12°59′), მთვარე თხის რქაში (11°22′), ამომავალი თხის რქაში (26°21′) და სახლების განლაგება ზუსტი ეფემერიდებითაა გამოთვლილი. შეცდომა მხოლოდ იუპიტერის ტრანზიტის დროში დავუშვი, შენს რუკას ეს არ შეხებია.

ზუსტი სურათი ასეთია: იუპიტერი კირჩხიბში იყო 2025 წლის ივნისიდან 2026 წლის 29 ივნისამდე, ლომში გადადის 2026 წლის 30 ივნისს და ქალწულში 2027 წლის 26 ივლისს. ამასთან შენი მე-7 სახლი (პარტნიორობა) კირჩხიბის ბოლო გრადუსებიდან ქალწულის 12°-მდე გრძელდება, ანუ მთელ ლომს მოიცავს. წინა პასუხში ლომი მე-8 სახლში მოვათავსე, ეს არასწორი იყო. იუპიტერი მე-7 სახლს 2027 წლის შუამდეც გადის, ამიტომ პარტნიორობისა და ურთიერთობების თემაზე ხელსაყრელი ფონი მაშინაც რჩება.

ეს არ არის გარანტია კონკრეტულ მოვლენაზე, ეს არის ხელსაყრელი პერიოდი, რომელსაც შენი არჩევანი და ურთიერთობის რეალური დინამიკა განსაზღვრავს. ბოდიში დაბნეულობისთვის, სიამოვნებით გავაგრძელებ საუბარს.`;

async function main() {
  const userId = process.argv[2];
  if (!userId) throw new Error("usage: send-chart-correction-note.ts <userId>");

  const [existing] = await db
    .select({ id: chartChatMessages.id })
    .from(chartChatMessages)
    .where(
      and(
        eq(chartChatMessages.userId, userId),
        eq(chartChatMessages.role, "assistant"),
        like(chartChatMessages.content, `%${MARKER}%`),
      ),
    )
    .limit(1);
  if (existing) {
    console.log("already sent, skipping");
    return;
  }

  await db.insert(chartChatMessages).values({
    userId,
    role: "assistant",
    content: BODY,
  });
  await db.insert(notifications).values({
    userId,
    kind: "ask_nudge",
    payload: {
      reminderTitle: "შენი ასტროლოგისგან შეტყობინება",
      reminderBody:
        "შენი რუკა სწორია. იუპიტერის ტრანზიტის დროს შევასწორე, დეტალები ჩატშია.",
      reminderUrl: "/ask",
    },
  });
  console.log("sent");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
