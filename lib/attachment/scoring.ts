/**
 * მიჯაჭვულობის ტესტის სქორინგი, ორიგინალური, სერვერ-კლიენტზე საერთო.
 *
 * თითო პუნქტი: 1..5, შებრუნებული ფასდება `6 - raw`. თითო ღერძი (12 პუნქტი)
 * ჯამდება 12..60 და ნორმდება 0..100-ზე. სტილი კვადრანტით განისაზღვრება
 * (ზღვარი 50): დაბალი შფოთი + დაბალი აცილება = უსაფრთხო; მაღალი შფოთი =
 * შფოთიანი; მაღალი აცილება = აცილებადი; ორივე მაღალი = შიშით-აცილებადი.
 */

import {
  ATTACHMENT_QUESTIONS,
  type AttachmentAxis,
  type AttachmentQuestion,
} from "./questions";

export type AttachmentStyleKey = "secure" | "anxious" | "avoidant" | "fearful";

export type AttachmentCard = { title: string; text: string };

export type AttachmentResult = {
  /** 0–100. */
  anxiety: number;
  /** 0–100. */
  avoidance: number;
  style: AttachmentStyleKey;
  /** true, როცა რომელიმე ღერძი 50-ის ზღვართან ±12-შია, შედეგი რბილია. */
  lean: boolean;
  labelKa: string;
  labelEn: string;
  glyph: string;
  hue: string;
  summaryKa: string;
  summaryEn: string;
  strengths: AttachmentCard[];
  strengthsEn: AttachmentCard[];
  growth: AttachmentCard[];
  growthEn: AttachmentCard[];
  partnerTipsKa: string[];
  partnerTipsEn: string[];
  nextStepsKa: string[];
  nextStepsEn: string[];
};

export function scoreAttachmentItem(
  question: Pick<AttachmentQuestion, "reverse">,
  answer: number,
): number {
  if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
    throw new RangeError("Attachment answers must be integers from 1 to 5.");
  }
  return question.reverse ? 6 - answer : answer;
}

function axisScore(
  axis: AttachmentAxis,
  answers: Record<number, number>,
): number {
  const items = ATTACHMENT_QUESTIONS.filter((q) => q.axis === axis);
  let sum = 0;
  for (const q of items) {
    const answer = answers[q.id];
    if (answer === undefined) {
      throw new RangeError("Missing attachment answer for item " + q.id + ".");
    }
    sum += scoreAttachmentItem(q, answer);
  }
  // 12..60 → 0..100
  return Math.round(((sum - 12) / 48) * 100);
}

export function attachmentStyleFor(
  anxiety: number,
  avoidance: number,
): AttachmentStyleKey {
  if (anxiety >= 50 && avoidance >= 50) return "fearful";
  if (anxiety >= 50) return "anxious";
  if (avoidance >= 50) return "avoidant";
  return "secure";
}

const STYLE_CONTENT: Record<
  AttachmentStyleKey,
  {
    labelKa: string;
    labelEn: string;
    glyph: string;
    hue: string;
    summaryKa: string;
    summaryEn: string;
    strengths: AttachmentCard[];
    strengthsEn: AttachmentCard[];
    growth: AttachmentCard[];
    growthEn: AttachmentCard[];
    partnerTipsKa: string[];
    partnerTipsEn: string[];
    nextStepsKa: string[];
    nextStepsEn: string[];
  }
> = {
  secure: {
    labelKa: "უსაფრთხო მიჯაჭვულობა",
    labelEn: "Secure attachment",
    glyph: "⚓",
    hue: "oklch(0.80 0.15 200)",
    summaryKa:
      "შენი პასუხების მიხედვით, სიახლოვეც კომფორტულია და დამოუკიდებლობაც, არც მიტოვების შიში გმართავს და არც სიახლოვისგან გაქცევა. კონფლიქტს პრობლემად აღიქვამ და არა კატასტროფად, პარტნიორზე დაყრდნობა კი სისუსტედ არ მიგაჩნია. ეს ის საყრდენია, რომელზეც ჯანსაღი ურთიერთობა შენდება.",
    summaryEn:
      "Your answers suggest that both closeness and independence feel comfortable to you: you are neither ruled by fear of abandonment nor by the urge to pull away from closeness. You treat conflict as a problem to solve rather than a catastrophe, and leaning on your partner does not feel like weakness to you. This is the foundation on which healthy relationships are built.",
    strengths: [
      {
        title: "ღია კომუნიკაცია",
        text: "გრძნობებზე საუბარი ბუნებრივად გამოგდის, არც მალავ და არც აზვიადებ.",
      },
      {
        title: "ბალანსი",
        text: "„ჩვენ“ და „მე“ ჰარმონიაშია: სიახლოვეც გიხარია და საკუთარი სივრცის შენარჩუნებაც შეგიძლია.",
      },
    ],
    strengthsEn: [
      {
        title: "Open communication",
        text: "Talking about feelings comes naturally to you — you neither hide them nor exaggerate them.",
      },
      {
        title: "Balance",
        text: "'We' and 'me' live in harmony for you: you enjoy closeness and can also keep your own space.",
      },
    ],
    growth: [
      {
        title: "პარტნიორის სტილის გაგება",
        text: "შენი სიმშვიდე პარტნიორის შფოთს ან დისტანციას ყოველთვის ვერ აქრობს, მისი სტილის ცოდნა კონფლიქტებს გაამარტივებს.",
      },
      {
        title: "პირადი საზღვრების დაცვა",
        text: "უსაფრთხო სტილის ადამიანები ზოგჯერ სხვის ემოციებს ზედმეტად იტვირთავენ, დახმარებასა და საკუთარი თავის დავიწყებას შორის ზღვარი დაიცავი.",
      },
    ],
    growthEn: [
      {
        title: "Understanding your partner's style",
        text: "Your calm does not always dissolve your partner's anxiety or distance — knowing their style will make conflicts easier.",
      },
      {
        title: "Protecting your boundaries",
        text: "Secure people sometimes carry too much of other people's emotions — keep the line between helping and forgetting yourself.",
      },
    ],
    partnerTipsKa: [
      "უსაფრთხო პარტნიორთან ურთიერთობა მარტივი და სანდოა, დააფასე მისი გახსნილობა და ნუ აღიქვამ მის სიმშვიდეს გულგრილობად.",
      "პირდაპირი და მშვიდი საუბარი მასთან საუკეთესო გზაა, თქვი პირდაპირ, რა გაწუხებს, მინიშნებების გარეშე.",
      "პატივი ეცი მის პირად სივრცესა და ინტერესებს, ეს მისი შინაგანი სტაბილურობის საყრდენია.",
    ],
    partnerTipsEn: [
      "A relationship with a secure partner feels easy and trustworthy — value their openness, and do not mistake their calm for indifference.",
      "Direct, calm conversation works best with them — say plainly what troubles you, without hints.",
      "Respect their personal space and interests — it is the foundation of their inner stability.",
    ],
    nextStepsKa: [
      "გაიგე პარტნიორის სტილიც, სთხოვე, მანაც გაიაროს ეს ტესტი და შედეგები ერთად განიხილეთ.",
      "კონფლიქტის დროს დაიმახსოვრე ფორმულა: ფაქტი → გრძნობა → საჭიროება („როცა X ხდება, მე ვგრძნობ Y-ს, მჭირდება Z“).",
      "შეინარჩუნე საკუთარი ცხოვრება ურთიერთობის გარეთაც, მეგობრები, ინტერესები, მიზნები.",
    ],
    nextStepsEn: [
      "Learn your partner's style too — ask them to take this test and discuss the results together.",
      "In conflict, remember the formula: fact → feeling → need ('When X happens, I feel Y, I need Z').",
      "Keep a life of your own outside the relationship — friends, interests, goals.",
    ],
  },
  anxious: {
    labelKa: "შფოთიანი მიჯაჭვულობა",
    labelEn: "Anxious attachment",
    glyph: "🌊",
    hue: "oklch(0.78 0.18 350)",
    summaryKa:
      "შენ ღრმად განიცდი ურთიერთობას და პარტნიორთან კავშირი შენთვის ძალიან მნიშვნელოვანია, ამიტომ დისტანცირების მცირე ნიშანსაც კი მტკივნეულად აღიქვამ. გვიანი პასუხი, ხმის ტონის ცვლილება, ერთი ცივი საღამო, გონება მაშინვე ყველაზე ცუდ სცენარს ქმნის. ეს არ ნიშნავს, რომ „ზედმეტი“ ხარ, ეს ნიშნავს, რომ შენი მიჯაჭვულობის სისტემა მგრძნობიარეა და დამშვიდების მკაფიო სიგნალები სჭირდება.",
    summaryEn:
      "You feel relationships deeply, and connection with your partner matters enormously to you — so even small signs of distance can hurt. A late reply, a shift in tone, one cold evening, and your mind instantly builds the worst-case scenario. That does not mean you are 'too much' — it means your attachment system is sensitive and needs clear signals of reassurance.",
    strengths: [
      {
        title: "ემოციური სიღრმე",
        text: "გრძნობებს ვერ მალავ, და არც გინდა: შენი ურთიერთობები ცოცხალი, თბილი და ნამდვილია.",
      },
      {
        title: "ერთგულება",
        text: "როცა გიყვარს, ბოლომდე იხარჯები, პარტნიორი შენს გვერდით თავს მნიშვნელოვნად გრძნობს.",
      },
    ],
    strengthsEn: [
      {
        title: "Emotional depth",
        text: "You cannot hide your feelings — and you do not want to: your relationships are alive, warm, and real.",
      },
      {
        title: "Devotion",
        text: "When you love, you give everything — beside you, your partner feels like they matter.",
      },
    ],
    growth: [
      {
        title: "განგაშის შემოწმება",
        text: "სანამ დასკვნას გამოიტან („გაცივდა“, „აღარ ვუყვარვარ“), ჰკითხე საკუთარ თავს: რა ფაქტი მაქვს და რა, ჩემი შიშის ხმა?",
      },
      {
        title: "თვითდამშვიდება",
        text: "როცა დამშვიდების ერთადერთი წყარო პარტნიორი აღარ არის, შფოთიც იკლებს: იპოვე საყრდენი საკუთარ რიტუალებში, მეგობრებთან ურთიერთობასა და საყვარელ საქმეში.",
      },
    ],
    growthEn: [
      {
        title: "Checking the alarm",
        text: "Before drawing conclusions ('they have gone cold', 'I am not loved anymore'), ask yourself: what is the fact, and what is the voice of my fear?",
      },
      {
        title: "Self-soothing",
        text: "When your partner is no longer your only source of calm, anxiety eases too: find grounding in your own rituals, friendships, and the things you love.",
      },
    ],
    partnerTipsKa: [
      "შფოთიან პარტნიორს ყველაზე მეტად პროგნოზირებადობა ამშვიდებს, უთხარი, როდის დარეკავ, როდის დაბრუნდები, რა ხდება.",
      "კონფლიქტში „დრო მჭირდება“ მარტო არ თქვა, დაამატე: „დავმშვიდდები და დავბრუნდები, ეს შენზე არ არის გაბრაზება“.",
      "დადასტურება მისთვის მანიპულაცია არ არის, ემოციური მოთხოვნილებაა. პატარა, რეგულარული სითბო დიდ შფოთს აქრობს.",
    ],
    partnerTipsEn: [
      "Nothing calms an anxious partner like predictability — tell them when you will call, when you will be back, what is going on.",
      "In conflict, do not say 'I need time' on its own — add: 'I will calm down and come back; this is not anger at you.'",
      "Reassurance is not manipulation for them — it is an emotional need. Small, steady warmth dissolves great anxiety.",
    ],
    nextStepsKa: [
      "ჩამოიყალიბე „ფაქტი თუ შიში“ ჩვევა: ნერვიულობისას ჩაიწერე ერთი რეალური ფაქტი და ერთი შენი ინტერპრეტაცია, გაარჩიე ისინი ერთმანეთისგან.",
      "კონფლიქტის შემდეგ პირველი 24 საათის განმავლობაში ნუ გამოიტან ნაჩქარევ დასკვნას ურთიერთობის მომავალზე.",
      "თუ შფოთი ყოველდღიურობას გირთულებს, ფსიქოლოგთან რამდენიმე სესია მიჯაჭვულობის თემაზე ძალიან შედეგიანია.",
    ],
    nextStepsEn: [
      "Build a 'fact or fear' habit: when you feel nervous, write down one real fact and one interpretation of yours, and separate them from each other.",
      "In the first 24 hours after a conflict, hold off on rushed conclusions about the future of the relationship.",
      "If anxiety complicates your daily life, a few sessions with a psychologist on the topic of attachment can be very effective.",
    ],
  },
  avoidant: {
    labelKa: "აცილებადი მიჯაჭვულობა",
    labelEn: "Avoidant attachment",
    glyph: "🏔️",
    hue: "oklch(0.82 0.16 85)",
    summaryKa:
      "შენ დამოუკიდებლობას აფასებ და საკუთარ თავზე დაყრდნობით ცხოვრობ, ეს ძალაა. მაგრამ სიახლოვე ზოგჯერ წნეხად აღიქმება: როცა პარტნიორი ძალიან ახლოს მოდის, უკან დახევის, მარტო დარჩენის, „ჰაერის“ სურვილი ჩნდება. პრობლემებსაც მარტო აგვარებ და დახმარების თხოვნა სისუსტედ მიგაჩნია. შედეგად პარტნიორი შეიძლება თავს ზედმეტად გრძნობდეს, შენ კი, რომ შენი არ ესმით.",
    summaryEn:
      "You value independence and stand on your own two feet — that is a strength. But closeness can sometimes feel like pressure: when your partner comes very close, the urge to pull back, to be alone, to get some 'air' appears. You solve problems alone too, and asking for help feels like weakness. As a result, your partner may feel like too much — while you feel misunderstood.",
    strengths: [
      {
        title: "თვითკმარობა",
        text: "კრიზისში პანიკაში არ ვარდები, ფხიზლად მოქმედებ და საკუთარ ფეხზე მყარად დგახარ.",
      },
      {
        title: "სიმშვიდე",
        text: "ემოციურ ქარიშხალში სტაბილური ხარ, ეს ურთიერთობისთვის ძვირფასი საყრდენია, როცა მას შეგნებულად იყენებ.",
      },
    ],
    strengthsEn: [
      {
        title: "Self-reliance",
        text: "You do not panic in a crisis — you act with a clear head and stand firmly on your own feet.",
      },
      {
        title: "Steadiness",
        text: "You stay stable in emotional storms — a precious anchor for a relationship, when you use it consciously.",
      },
    ],
    growth: [
      {
        title: "ნაბიჯ-ნაბიჯ გახსნა",
        text: "სიახლოვე კუნთივითაა, პატარა დოზებით იზრდება. დაიწყე მცირით: ერთი გრძნობის გაზიარება დღეში („დღეს დაღლილი ვარ და მხარდაჭერა მჭირდება“).",
      },
      {
        title: "დახმარების თხოვნა",
        text: "პარტნიორისთვის დახმარების თხოვნა სისუსტე კი არა, ნდობის ნიშანია, მას თავს საჭიროდ და დაფასებულად აგრძნობინებს.",
      },
    ],
    growthEn: [
      {
        title: "Opening up step by step",
        text: "Closeness works like a muscle — it grows in small doses. Start small: sharing one feeling a day ('I am tired today and need support').",
      },
      {
        title: "Asking for help",
        text: "Asking your partner for help is not weakness — it is a sign of trust, and it makes them feel needed and valued.",
      },
    ],
    partnerTipsKa: [
      "აცილებად პარტნიორს სივრცე მიეცი, მაგრამ კარი ღია დატოვე: „როცა მზად იქნები, მომიყევი, ზეწოლის გარეშე“.",
      "კრიტიკის ნაცვლად საჭიროება დაასახელე: „შენ არასდროს...“-ის ნაცვლად, „მჭირდება, რომ...“.",
      "მის გახსნის მცდელობას (იშვიათსაც კი) სითბოთი უპასუხე, ასე ნელ-ნელა სწავლობს, რომ სიახლოვე უსაფრთხოა.",
    ],
    partnerTipsEn: [
      "Give an avoidant partner space, but leave the door open: 'When you are ready, tell me — no pressure.'",
      "Name your need instead of criticizing: 'I need you to…' rather than 'You never….'",
      "Meet their attempts to open up — even rare ones — with warmth; that is how they slowly learn that closeness is safe.",
    ],
    nextStepsKa: [
      "კვირაში ერთხელ 20-წუთიანი „ჩვენი საუბარი“ დანიშნე, გრძნობებზე, არა საქმეებზე. რეგულარულობა წნეხს ხსნის.",
      "როცა უკან დახევის სურვილი გიჩნდება, თქვი ხმამაღლა: „ცოტა დრო მჭირდება, მაგრამ აუცილებლად დავბრუნდები“, გაუჩინარების ნაცვლად.",
      "დააკვირდი, რომელ მომენტებში იკეტები (კრიტიკა? ცრემლები? კონტროლი?), ეს შენი ემოციების რუკის გასაღებია.",
    ],
    nextStepsEn: [
      "Schedule a 20-minute 'us talk' once a week — about feelings, not logistics. Regularity relieves the pressure.",
      "When the urge to pull back appears, say it out loud: 'I need a little time, but I will definitely be back' — instead of disappearing.",
      "Notice the moments when you shut down (criticism? tears? control?) — that is the key to your emotional map.",
    ],
  },
  fearful: {
    labelKa: "შიშით-აცილებადი სტილი",
    labelEn: "Fearful-avoidant attachment",
    glyph: "🌗",
    hue: "oklch(0.78 0.18 305)",
    summaryKa:
      "შენში ორი ძლიერი ძალა ერთდროულად მოქმედებს: სიახლოვის ღრმა სურვილი და მისი თანაბრად ძლიერი შიში. გინდა, რომ გიყვარდეს და უყვარდე, და ამავდროულად გეშინია, რომ გახსნა ტკივილით დასრულდება. ამიტომ ურთიერთობაში საქანელასავით მოძრაობ: მოშორება → მონატრება → მიახლოება → შიში → ისევ მოშორება. ეს დამღლელია, მაგრამ არ ნიშნავს, რომ რამე „გჭირს“, ხშირად ეს წარსული ტკივილის კვალია, რომლის გადალახვაც შესაძლებელია.",
    summaryEn:
      "Two strong forces act in you at once: a deep longing for closeness and an equally strong fear of it. You want to love and be loved — and at the same time you fear that opening up will end in pain. So you move through relationships like on a swing: pulling away → missing → drawing close → fear → pulling away again. It is exhausting, but it does not mean anything is 'wrong' with you — often it is the trace of past pain, and it can be healed.",
    strengths: [
      {
        title: "ემპათია",
        text: "სხვის ტკივილს მთელი სხეულით გრძნობ, შენი მგრძნობელობა ღრმა, ნამდვილი კავშირის ნიჭია.",
      },
      {
        title: "გულწრფელობა",
        text: "როცა ენდობი, ბოლომდე იხსნები, ასეთ სიღრმეს ყველა ვერ სთავაზობს პარტნიორს.",
      },
    ],
    strengthsEn: [
      {
        title: "Empathy",
        text: "You feel other people's pain with your whole body — your sensitivity is a gift for deep, genuine connection.",
      },
      {
        title: "Honesty",
        text: "When you trust, you open up completely — a depth not everyone can offer a partner.",
      },
    ],
    growth: [
      {
        title: "საქანელას შენელება",
        text: "როცა მოშორების იმპულსი გიჩნდება, 48 საათი დაიცადე დიდ გადაწყვეტილებამდე, ჩამოწერე, რა გაშინებს კონკრეტულად.",
      },
      {
        title: "ნდობის პატარა ნაბიჯები",
        text: "ნდობა ერთბაშად არ შენდება: ერთი პატარა გახსნა → დადებითი გამოცდილება → შემდეგი ნაბიჯი. ტემპი შენ განსაზღვრე.",
      },
    ],
    growthEn: [
      {
        title: "Slowing the swing",
        text: "When the urge to pull away appears, wait 48 hours before big decisions — write down what exactly frightens you.",
      },
      {
        title: "Small steps of trust",
        text: "Trust is not built all at once: one small opening → a positive experience → the next step. You set the pace.",
      },
    ],
    partnerTipsKa: [
      "ასეთ პარტნიორთან თანმიმდევრულობა ყველაფერია, ნათქვამი შეასრულე, მოულოდნელად ნუ გაუჩინარდები, პროგნოზირებადი იყავი.",
      "მის უკან დახევას ნუ აღიქვამ უარყოფად, ხშირად ეს თავდაცვაა და არა შენი უარყოფა. მშვიდად ჰკითხე, რა სჭირდება.",
      "ზეწოლა („გადაწყვიტე, გინდა თუ არა“) აშორებს; მოთმინება და მკაფიო სითბო („აქ ვარ, არ მივდივარ“) აახლოვებს.",
    ],
    partnerTipsEn: [
      "With such a partner, consistency is everything — keep your word, do not vanish unexpectedly, be predictable.",
      "Do not take their withdrawal as rejection — it is often self-defense, not a rejection of you. Calmly ask what they need.",
      "Pressure ('decide whether you want this or not') pushes them away; patience and clear warmth ('I am here, I am not leaving') bring them closer.",
    ],
    nextStepsKa: [
      "ეს ერთადერთი სტილია, სადაც ფსიქოლოგთან მუშაობას განსაკუთრებით გირჩევ, მიჯაჭვულობაზე ორიენტირებული თერაპია აქ ყველაზე შედეგიანია.",
      "წარსულის რომელი გამოცდილება ახდენს გავლენას აწმყოზე? მისი გაცნობიერება აწმყოსგან გარჩევაში გეხმარება.",
      "აირჩიე ერთი უსაფრთხო ადამიანი (მეგობარი, ოჯახის წევრი) და ივარჯიშე მასთან ეტაპობრივად გახსნაში.",
    ],
    nextStepsEn: [
      "This is the one style where working with a psychologist comes especially recommended — attachment-focused therapy is most effective here.",
      "Which past experience affects the present? Recognizing it helps you tell the present apart from the past.",
      "Choose one safe person (a friend, a family member) and practice opening up gradually with them.",
    ],
  },
};

export function calculateAttachment(
  answers: Record<number, number>,
): AttachmentResult {
  const anxiety = axisScore("anxiety", answers);
  const avoidance = axisScore("avoidance", answers);
  const style = attachmentStyleFor(anxiety, avoidance);
  const lean = Math.abs(anxiety - 50) < 12 || Math.abs(avoidance - 50) < 12;
  return { anxiety, avoidance, style, lean, ...STYLE_CONTENT[style] };
}
