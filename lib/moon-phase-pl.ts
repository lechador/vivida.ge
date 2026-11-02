import type { MoonPhaseReadingResult } from "./openrouter";
import {
  PHASE_LABEL_PL,
  type MoonPhaseSnapshot,
  type PhaseKey,
} from "./moon-phase";
import { plSignLocative, signByIndex } from "./zodiac";

const PHASE_GUIDANCE: Record<
  PhaseKey,
  { focus: string; action: string; themes: string[] }
> = {
  new_moon: {
    focus: "cichy reset, świeżą intencję i pierwsze zarysy nowego cyklu",
    action:
      "Wybierz jedną intencję na tyle prostą, by zacząć ją teraz, i na tyle jasną, by móc do niej wracać przez kolejne cztery tygodnie.",
    themes: ["Nowy początek", "Intencja", "Reset"],
  },
  waxing_crescent: {
    focus:
      "wczesny pęd, eksperymentowanie i ochronę nowego kierunku, gdy dopiero nabiera kształtu",
    action:
      "Wesprzyj pomysł jednym powtarzalnym działaniem, zamiast żądać natychmiastowych dowodów na jego powodzenie.",
    themes: ["Rozwój", "Praktyka", "Zaangażowanie"],
  },
  first_quarter: {
    focus:
      "decyzję, konstruktywne napięcie i potrzebę przekucia intencji w widoczny ruch",
    action:
      "Zmierz się z przeszkodą bezpośrednio i zdecyduj, co zasługuje na Twój wysiłek, zanim presja czasu zdecyduje za Ciebie.",
    themes: ["Decyzja", "Działanie", "Korekta"],
  },
  waxing_gibbous: {
    focus:
      "szlifowanie szczegółów, przygotowanie i doskonalenie tego, co już jest w ruchu",
    action:
      "Przejrzyj detale, poproś o konstruktywną informację zwrotną i wzmocnij tę część planu, która ma przynieść oczekiwany rezultat.",
    themes: ["Dopracowanie", "Przygotowanie", "Koncentracja"],
  },
  full_moon: {
    focus:
      "pełną widoczność, kulminację oraz emocje lub rezultaty, które stają się oczywiste",
    action:
      "Zauważ, co osiągnęło punkt zwrotny, nazwij swoje uczucia bez zbędnego dramatyzowania i odnieś się do widocznych faktów.",
    themes: ["Klarowność", "Kulminacja", "Uwolnienie"],
  },
  waning_gibbous: {
    focus:
      "integrację, perspektywę i dzielenie się tym, czego nauczyła Cię dojrzała faza",
    action:
      "Zatrzymaj to, co okazało się wartościowe, przekaż wnioski dalej i pozwól niepotrzebnemu wysiłkowi naturalnie opaść.",
    themes: ["Integracja", "Perspektywa", "Wymiana"],
  },
  last_quarter: {
    focus:
      "rewizję, odpuszczenie i szczere spojrzenie na nawyki, które nie służą już kolejnemu cyklowi",
    action:
      "Uprość lub zakończ jedno zobowiązanie, które pochłania energię bez przynoszenia wystarczającego sensu czy postępu.",
    themes: ["Odpuszczenie", "Rewizja", "Granice"],
  },
  waning_crescent: {
    focus:
      "odpoczynek, domknięcie i tworzenie przestrzeni przed kolejnym początkiem",
    action:
      "Ogranicz nadmiar bodźców, dokończ to, co możesz domknąć bez pośpiechu, i daj refleksji pierwszeństwo przed wymuszoną produktywnością.",
    themes: ["Odpoczynek", "Domknięcie", "Wyciszenie"],
  },
};

const SIGN_TONE: Record<
  string,
  { tone: string; question: string; theme: string }
> = {
  aries: {
    tone: "bezpośredni, dynamiczny i niecierpliwy wobec zwłoki",
    question: "Co zasługuje na zdecydowany, pierwszy krok?",
    theme: "Inicjatywa",
  },
  taurus: {
    tone: "stabilny, osadzony w ciele i zorientowany na bezpieczeństwo",
    question: "Co można uczynić bardziej trwałym i zrównoważonym?",
    theme: "Stabilność",
  },
  gemini: {
    tone: "ciekawy świata, werbalny i otwarty na inne spojrzenie",
    question: "Jaka rozmowa lub brakujący fakt może zmienić cały obraz?",
    theme: "Komunikacja",
  },
  cancer: {
    tone: "opiekuńczy, wrażliwy i wyczulony na atmosferę emocjonalną",
    question:
      "Co da Ci autentyczne poczucie bezpieczeństwa zamiast chwilowego uspokojenia?",
    theme: "Troska emocjonalna",
  },
  leo: {
    tone: "ekspresyjny, ciepły i gotowy, by pokazać to, co w sercu",
    question:
      "Gdzie pewność siebie może zamienić się w hojne, twórcze działanie?",
    theme: "Ekspresja",
  },
  virgo: {
    tone: "spostrzegawczy, praktyczny i skupiony na użytecznych usprawnieniach",
    question:
      "Jaka mała korekta sprawi, że codzienność zacznie działać sprawniej?",
    theme: "Usprawnienie",
  },
  libra: {
    tone: "relacyjny, dyplomatyczny i wyczulony na równowagę",
    question: "Czego sprawiedliwość i harmonia wymagają od każdej ze stron?",
    theme: "Równowaga",
  },
  scorpio: {
    tone: "intensywny, przenikliwy i gotowy spojrzeć pod powierzchnię",
    question: "Jaka prawda staje się jasna, gdy odpuścisz potrzebę kontroli?",
    theme: "Głębia",
  },
  sagittarius: {
    tone: "otwarty, szczery i poszukujący głębszego sensu oraz perspektyw",
    question: "Jaki kierunek przywraca Ci poczucie celu i inspiracji?",
    theme: "Perspektywa",
  },
  capricorn: {
    tone: "zdyscyplinowany, strategiczny i świadomy długofalowych konsekwencji",
    question: "Jaka struktura uczyni Twój cel bardziej realistycznym?",
    theme: "Odpowiedzialność",
  },
  aquarius: {
    tone: "niezależny, nowatorski i patrzący z szerszej perspektywy społecznej",
    question: "Co się zmieni, gdy zakwestionujesz utarte schematy?",
    theme: "Innowacja",
  },
  pisces: {
    tone: "intuicyjny, pełen wyobraźni i otwarty na subtelne odczucia",
    question: "Które uczucie potrzebuje współczucia, a która granica jasności?",
    theme: "Intuicja",
  },
};

export function polishMoonPhaseReading(
  snapshot: MoonPhaseSnapshot,
): MoonPhaseReadingResult {
  const phase = PHASE_GUIDANCE[snapshot.phaseKey];
  const sign = signByIndex(snapshot.signIndex);
  const signTone = SIGN_TONE[sign.key] ?? SIGN_TONE.aries;
  const phaseLabel = PHASE_LABEL_PL[snapshot.phaseKey];
  const signLocative = plSignLocative(sign.key);

  return {
    headline: `${phaseLabel} ${signLocative}`,
    summary: `Ta faza (${phaseLabel.toLowerCase()}) podkreśla ${phase.focus}. Przy Księżycu w znaku ${sign.labelPl} ton emocjonalny staje się bardziej ${signTone.tone}.`,
    body: `${phase.action}\n\n${signTone.question} Traktuj cykl księżycowy jako ramy do autorefleksji i planowania, a nie jako gwarancję konkretnych zdarzeń.`,
    themes: [phase.themes[0], signTone.theme, phase.themes[1]],
  };
}
