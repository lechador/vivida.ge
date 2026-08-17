import type {
  AstrologyCalendarDay,
  CalendarTone,
} from "@/lib/seo/astrology-calendar";
import { formatAmDate } from "@/lib/i18n/am-date";
import { BODIES } from "@/lib/zodiac";

const PLANET_AM: Record<string, string> = {
  მზე: "Արև",
  მთვარე: "Լուսին",
  მერკური: "Մերկուրի",
  ვენერა: "Վեներա",
  მარსი: "Մարս",
  იუპიტერი: "Յուպիտեր",
  სატურნი: "Սատուրն",
  ურანი: "Ուրան",
  ნეპտუნი: "Նեպտուն",
  პლუტონი: "Պլուտոն",
};

const ASPECT_AM: Record<string, string> = {
  შეერთება: "միացում",
  სექსტილი: "սեքստիլ",
  კვადრატი: "քառակուսի",
  ტრიგონი: "տրին",
  ოპოზიცია: "օպոզիցիա",
};

const WEEKDAYS_AM = [
  "Կիրակի",
  "Երկուշաբթի",
  "Երեքշաբթի",
  "Չորեքշաբթի",
  "Հինգշաբթի",
  "Ուրբաթ",
  "Շաբաթ",
];

export const TONE_AM: Record<
  CalendarTone,
  { label: string; color: string; icon: string }
> = {
  lucky: { label: "Բարենպաստ", color: "var(--vivida-cyan)", icon: "✦" },
  balanced: {
    label: "Հավասարակշռված",
    color: "var(--vivida-violet)",
    icon: "◐",
  },
  careful: { label: "Զգուշության օր", color: "var(--vivida-pink)", icon: "△" },
};

export function calendarDateLabelAm(date: Date) {
  return formatAmDate(date);
}

export function weekdayAm(date: Date) {
  return WEEKDAYS_AM[date.getUTCDay()];
}

export function planetAm(labelKa: string) {
  return (
    Object.values(BODIES).find((body) => body.labelKa === labelKa)?.labelAm ??
    PLANET_AM[labelKa] ??
    labelKa
  );
}

export function aspectAm(kindKa: string) {
  return ASPECT_AM[kindKa] ?? kindKa;
}

export function dayLeadAm(day: AstrologyCalendarDay) {
  const strongest = day.sky.aspects[0];
  return strongest
    ? `${planetAm(strongest.aKa)}–${planetAm(strongest.bKa)} ${aspectAm(
        strongest.kindKa,
      )} ասպեկտը սահմանում է օրվա գլխավոր աստղաբանական տոնայնությունը:`
    : "Քանի որ ուժեղ լարված ասպեկտներ չկան, օրվա ընդհանուր ռիթմը համեմատաբար հանգիստ և ճկուն է:";
}

export function dayAdviceAm(day: AstrologyCalendarDay) {
  if (day.tone === "lucky") {
    return {
      title: "Բարենպաստ օր",
      summary:
        "Ներդաշնակ ասպեկտները գերակշռում են: Օրը բարենպաստ է նախաձեռնությունների, արդյունավետ երկխոսությունների և առաջընթացի համար:",
      do: [
        "Կատարեք կոնկրետ քայլ կարևոր նպատակի ուղղությամբ",
        "Օգտագործեք համագործակցության և անկեղծ շփման հնարավորությունները",
        "Գրի առեք նոր ծագած գաղափարներն ու առաջարկները",
      ],
      avoid: [
        "Մի ապավինեք միայն հաջողությանը",
        "Խուսափեք չմտածված ֆինանսական կամ անձնական խոստումներից",
      ],
    };
  }
  if (day.tone === "careful") {
    return {
      title: "Զգուշության օր",
      summary:
        "Լարված ասպեկտները պահանջում են առավել մեծ ուշադրություն: Կշռադատեք որոշումները, մի շտապեք և խուսափեք կոնֆլիկտներից:",
      do: [
        "Ստուգեք փաստերն ու մանրուքները որոշում կայացնելուց առաջ",
        "Լրացուցիչ ժամանակ նախատեսեք ճանապարհի և կարևոր գործերի համար",
        "Արձագանքեք միայն հույզերը հանդարտվելուց հետո",
      ],
      avoid: [
        "Խուսափեք իմպուլսիվ վեճերից և առճակատումից",
        "Աստղաբանական գնահատականը մի ընկալեք որպես անխուսափելի կանխորոշում",
      ],
    };
  }
  return {
    title: "Հավասարակշռված օր",
    summary:
      "Ներդաշնակ և լարված ազդեցությունները հավասարակշռված են: Չափավոր տեմպը և հստակ առաջնահերթությունները կապահովեն լավագույն արդյունքը:",
    do: [
      "Ավարտին հասցրեք արդեն սկսված աշխատանքները",
      "Պահպանեք ճկունություն ծրագրերում",
      "Առանձնացրեք գլխավոր առաջադրանքները երկրորդականներից",
    ],
    avoid: [
      "Մի շտապեք միայն արտաքին ճնշման պատճառով",
      "Խուսափեք ուժերը չափից դուրս շատ ուղղություններով ցրելուց",
    ],
  };
}
