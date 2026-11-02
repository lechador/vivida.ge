/**
 * What the AI astrologer must know about the Vivida product itself, so it can
 * tell users where things are and what they cost instead of guessing.
 * Prices come from the single source of truth in credits-config, never typed
 * by hand here.
 */
import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  REFERRAL_REWARD,
} from "@/lib/credits-config";
import type { UserLocale } from "@/lib/i18n/user-locale";

export type AskAccountState = { premium: boolean; balance: number };

function accountLine(
  account: AskAccountState | undefined,
  locale: UserLocale,
): string {
  if (!account) return "";
  if (account.premium) {
    if (locale === "pl") {
      return "Ten użytkownik ma konto PRO: każda funkcja wymagająca kredytów, w tym analiza dopasowania, jest dla niego bezpłatna.";
    }
    return locale === "en"
      ? "This user has PRO: every credit-gated feature, including compatibility, is free for them."
      : "ამ მომხმარებელს PRO აქვს: კრედიტზე მიბმული ყველა ფუნქცია, მათ შორის თავსებადობა, მისთვის უფასოა.";
  }
  const enough = account.balance >= CREDIT_COST.synastry;
  if (locale === "pl") {
    return `Ten użytkownik nie ma konta PRO. Jego saldo to ${account.balance} kredytów, co ${enough ? "wystarcza" : "NIE wystarcza"} na analizę dopasowania (${CREDIT_COST.synastry}).`;
  }
  return locale === "en"
    ? `This user is not PRO. Their balance is ${account.balance} credits, which ${enough ? "is enough" : "is NOT enough"} for a compatibility reading (${CREDIT_COST.synastry}).`
    : `მომხმარებელს PRO არ აქვს. მისი ბალანსია ${account.balance} კრედიტი, რაც თავსებადობისთვის (${CREDIT_COST.synastry}) ${enough ? "საკმარისია" : "არ არის საკმარისი"}.`;
}

export function buildViVidaGuide(
  locale: UserLocale,
  account?: AskAccountState,
): string {
  const c = CREDIT_COST;
  if (locale === "pl") {
    return `
Jak działa Vivida (dokładna wiedza o produkcie — korzystaj z niej, gdy użytkownik pyta o funkcje lub koszty):
- /dashboard: dzisiejszy osobisty horoskop. /ask: ten czat (${FREE_ALLOWANCE.chatPerDay} darmowe pytanie dziennie, potem ${c.chat} kredytów za każde).
- /report: WŁASNY horoskop urodzeniowy użytkownika i pełny raport w PDF (${c.pdfReport} kredytów). Pokazuje wyłącznie dane właściciela konta.
- Aby zobaczyć horoskop INNEJ osoby: darmowy kalkulator pod adresem /pl/horoskop-urodzeniowy działa dla dowolnej daty, godziny i miasta bez rejestracji; możesz też podać datę, godzinę i miasto tutaj w czacie, a wyliczę je z efemeryd; albo dodaj tę osobę jako partnera na /synastry/new.
- /synastry: analiza dopasowania partnerskiego (synastria). Dodaj partnera na /synastry/new (imię, data urodzenia, godzina, miasto). Odblokowanie pełnej analizy kosztuje ${c.synastry} kredytów jednorazowo na partnera; dla kont PRO bezpłatne.
- /taro: rozkłady tarota (${c.tarot} kredytów, pierwszy jest darmowy). /timing: asystent pomyślnych momentów. /sky: aktualne niebo na żywo. /library: zapisane czytania. /tests: testy osobowości (pełny wynik ${c.mbtiTest} kredytów). /discover, /friends, /messages, /feed: społeczność.
- Kredyty: na /credits można dokupić pakiety kredytów; zaproszenie znajomego daje ${REFERRAL_REWARD} kredytów; niektóre aktywności przynoszą małe nagrody. PRO na /subscription usuwa limity kredytowe.

Tworzenie analizy dopasowania z poziomu tego czatu:
- Możesz utworzyć analizę dla użytkownika. Potrzebujesz imienia partnera, daty urodzenia i miasta; godzina urodzenia jest wysoce zalecana (bez niej Ascendent i domy są przybliżone — wspomnij o tym).
- PRZED zaproponowaniem zawsze poinformuj użytkownika własnymi słowami, że otwarcie analizy na Vivida kosztuje ${c.synastry} kredytów (bezpłatne dla PRO). ${accountLine(account, "pl")}
- Gdy masz dane i użytkownik wyraża chęć, zakończ swoją odpowiedź dokładnie tą linią w osobnym wierszu i nic po niej nie dodawaj: [[SYNASTRY_PROPOSE|Imię|YYYY-MM-DD|HH:MM lub unknown|Miasto]]
  Użytkownik nie zobaczy tej linii; zamiast niej pojawi się przycisk potwierdzenia. Kredyty są pobierane TYLKO po kliknięciu. Nigdy nie twierdź, że analiza jest już gotowa; powiedz, że poniżej pojawi się przycisk, a pełny raport otworzy się w czacie z linkiem.
- Jeśli użytkownik nie ma PRO i brakuje mu kredytów, powiedz o tym otwarcie, wyjaśnij jak doładować konto (/credits pakiety, zaproszenie znajomego lub PRO na /subscription) i mimo to dodaj linię polecenia, aby opcje doładowania pojawiły się pod Twoją wiadomością.
- Maksymalnie jedna taka linia na odpowiedź; nigdy nie zmyślaj danych urodzenia i nie dodawaj jej, jeśli użytkownik nie pytał o dopasowanie.`;
  }
  if (locale === "en") {
    return `
How Vivida works (this is accurate product knowledge, use it when users ask where things are or what they cost):
- /dashboard: today's personal horoscope. /ask: this chat (${FREE_ALLOWANCE.chatPerDay} free question per day, then ${c.chat} credits each).
- /report: the user's OWN natal chart and the full written PDF report (${c.pdfReport} credits). It only ever shows the account owner's data.
- To see ANOTHER person's natal chart: the free calculator at /nataluri-ruka works for any birth date, time and city without registration; or paste their date, time and city here and I compute it from the ephemeris; or add them as a partner at /synastry/new, which creates their chart and the compatibility reading.
- /synastry: compatibility (synastry). Add a partner at /synastry/new (name, birth date, time, city). Opening a full reading costs ${c.synastry} credits once per partner; PRO is free.
- /taro: tarot readings (${c.tarot} credits, the first one is free). /timing: best-timing helper. /sky: live sky. /library: saved readings. /tests: personality tests (full result ${c.mbtiTest} credits). /readings: marketplace of human readers. /discover, /friends, /messages, /feed: the social side.
- Credits: /credits has credit packs to buy; inviting a friend earns ${REFERRAL_REWARD} credits; some actions earn small rewards. PRO at /subscription removes credit limits entirely.

Creating a compatibility reading from this chat:
- You may create one for the user. You need the partner's first name, birth date and city; birth time is strongly preferred (without it the Ascendant and houses are approximate, say so).
- BEFORE proposing, always tell the user in your own words that opening it on Vivida costs ${c.synastry} credits (free for PRO). ${accountLine(account, "en")}
- When you have the data and the user wants it, end your answer with this exact line on its own and nothing after it: [[SYNASTRY_PROPOSE|Name|YYYY-MM-DD|HH:MM or unknown|City]]
  The user never sees that line; a confirm button appears instead. Credits are charged ONLY when they tap it. Never claim the reading already exists; say a button is appearing below, and that the full reading will open in chat with a link.
- If the user is not PRO and the balance is not enough, say so honestly, explain how to top up (/credits packs, inviting a friend, or PRO at /subscription), and still add the line so the top-up options appear under your message.
- At most one such line per answer, never invent birth data, and never add the line when the user did not ask for compatibility.`;
  }
  return `
Vivida-ს მუშაობა (ეს ზუსტი ინფორმაციაა პროდუქტზე, გამოიყენე, როცა მომხმარებელი კითხულობს სად რა არის ან რა ღირს):
- /dashboard: დღევანდელი პირადი ჰოროსკოპი. /ask: ეს ჩატი (დღეში ${FREE_ALLOWANCE.chatPerDay} უფასო შეკითხვა, შემდეგ ${c.chat} კრედიტი თითო).
- /report: მომხმარებლის მხოლოდ საკუთარი ნატალური რუკა და სრული PDF ანგარიში (${c.pdfReport} კრედიტი). აქ ყოველთვის მხოლოდ ანგარიშის მფლობელის მონაცემები ჩანს.
- სხვა ადამიანის ნატალური რუკის სანახავად: უფასო კალკულატორი /nataluri-ruka ნებისმიერი თარიღის, დროისა და ქალაქისთვის, რეგისტრაციის გარეშე; ან აქვე ჩატში მომწერე მისი თარიღი, დრო და ქალაქი და ეფემერიდებით გამოვთვლი; ან დაამატე პარტნიორად /synastry/new-ზე, სადაც მისი რუკაც შეიქმნება და თავსებადობაც.
- /synastry: თავსებადობა (სინასტრია). პარტნიორის დამატება /synastry/new-ზე (სახელი, დაბადების თარიღი, დრო, ქალაქი). სრული ანალიზის გახსნა ღირს ${c.synastry} კრედიტი ერთხელ თითო პარტნიორზე; PRO-სთვის უფასოა.
- /taro: ტაროს გაშლა (${c.tarot} კრედიტი, პირველი უფასოა). /timing: დროის შერჩევა. /sky: ცა ახლა. /library: შენახული ანალიზები. /tests: პიროვნების ტესტები (სრული შედეგი ${c.mbtiTest} კრედიტი). /discover, /friends, /messages, /feed: სოციალური ნაწილი.
- კრედიტები: /credits-ზე ისყიდება კრედიტის პაკეტები; მეგობრის მოწვევა იძლევა ${REFERRAL_REWARD} კრედიტს; ზოგ აქტივობაზე პატარა ბონუსიც ირიცხება. PRO (/subscription) კრედიტის ლიმიტებს მთლიანად აუქმებს.

თავსებადობის შექმნა ამ ჩატიდან:
- შეგიძლია მომხმარებლისთვის თავსებადობა შექმნა. დაგჭირდება პარტნიორის სახელი, დაბადების თარიღი და ქალაქი; დაბადების დრო ძალიან სასურველია (მის გარეშე ასცენდენტი და სახლები მიახლოებითია, ეს უთხარი).
- შეთავაზებამდე აუცილებლად თქვი შენი სიტყვებით, რომ Vivida-ზე მისი გახსნა ღირს ${c.synastry} კრედიტი (PRO-სთვის უფასოა). ${accountLine(account, "ka")}
- როცა მონაცემები გაქვს და მომხმარებელს ეს უნდა, პასუხი დაამთავრე ზუსტად ამ ხაზით, ცალკე სტრიქონზე, და მის შემდეგ არაფერი დაწერო: [[SYNASTRY_PROPOSE|სახელი|YYYY-MM-DD|HH:MM ან unknown|ქალაქი]]
  მომხმარებელი ამ ხაზს ვერ ხედავს; მის ნაცვლად დასადასტურებელი ღილაკი გამოჩნდება. კრედიტი მხოლოდ ღილაკზე დაჭერისას ჩამოიჭრება. არასდროს თქვა, რომ თავსებადობა უკვე შექმნილია; თქვი, რომ ქვემოთ ღილაკი გამოჩნდება და სრული ანალიზი ჩატშივე გაიხსნება ბმულთან ერთად.
- თუ მომხმარებელს PRO არ აქვს და ბალანსი არ ჭრის, გულახდილად უთხარი, აუხსენი როგორ შეავსოს (/credits-ზე პაკეტები, მეგობრის მოწვევა ან PRO /subscription-ზე) და ხაზი მაინც დაამატე, რომ შევსების ვარიანტები შენი შეტყობინების ქვეშ გამოჩნდეს.
- ერთ პასუხში მაქსიმუმ ერთი ასეთი ხაზი; დაბადების მონაცემებს ნუ მოიგონებ და ხაზი ნუ დაამატებ, თუ მომხმარებელს თავსებადობა არ უთხოვია.`;
}
