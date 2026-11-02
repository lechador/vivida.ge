import type { LifePathNumber } from "@/lib/numerology";

export type LifePathContentPl = {
  number: LifePathNumber;
  title: string;
  archetype: string;
  essence: string;
  traits: string[];
  strengths: string;
  challenges: string;
  love: string;
  career: string;
  advice: string;
};

export const LIFE_PATH_CONTENT_PL: Record<LifePathNumber, LifePathContentPl> = {
  "1": {
    number: "1",
    title: "Droga Życia 1, Lider",
    archetype: "Lider",
    essence:
      "Pionier, który toruje nowe ścieżki i inspiruje innych do działania.",
    traits: [
      "Niezależny",
      "Zdeterminowany",
      "Ambitny",
      "Odważny",
      "Innowacyjny",
    ],
    strengths:
      "Osoby z Drogą Życia 1 są naturalnymi liderami, obdarzonymi silną wolą i niezależnością. Mają zdolność do inicjowania nowych projektów i przewodzenia innym. Są pewne siebie, ambitne i nie boją się podejmować ryzyka, aby osiągnąć swoje cele. Ich kreatywność i oryginalność pozwalają im znajdować innowacyjne rozwiązania.",
    challenges:
      "Wyzwania dla Jedynki to tendencja do bycia zbyt dominującym, upartym lub egocentrycznym. Mogą mieć trudności z przyjmowaniem rad od innych i czasami czują się samotne na szczycie. Ważne jest, aby nauczyły się współpracować i doceniać wkład innych, unikając izolacji i nadmiernej rywalizacji.",
    love: "W miłości Jedynki szukają partnera, który szanuje ich niezależność i ambicje. Potrzebują kogoś, kto będzie ich wspierał, ale jednocześnie pozwoli im zachować własną przestrzeń. Są lojalne i namiętne, ale mogą mieć trudności z wyrażaniem wrażliwości. Ważne jest, aby nauczyły się otwierać i dzielić się swoimi uczuciami.",
    career:
      "Jedynki najlepiej sprawdzają się na stanowiskach kierowniczych, przedsiębiorczych lub w zawodach wymagających innowacyjności i samodzielności. Doskonale radzą sobie jako właściciele firm, menedżerowie, wynalazcy czy sportowcy. Potrzebują pracy, która daje im poczucie kontroli i możliwość realizacji własnych wizji.",
    advice:
      "Pamiętaj o równowadze między niezależnością a współpracą. Ucz się słuchać innych i doceniać ich perspektywy. Pozwól sobie na wrażliwość i nie bój się prosić o pomoc. Twoja siła tkwi w odwadze, ale prawdziwe przywództwo to także empatia i umiejętność budowania zespołu.",
  },
  "2": {
    number: "2",
    title: "Droga Życia 2, Dyplomata",
    archetype: "Dyplomata",
    essence:
      "Harmonijny mediator, który łączy ludzi i buduje mosty porozumienia.",
    traits: [
      "Współczujący",
      "Dyplomatyczny",
      "Wrażliwy",
      "Współpracujący",
      "Intuicyjny",
    ],
    strengths:
      "Dwójki są naturalnymi dyplomatami i mediatorami, obdarzonymi niezwykłą empatią i wrażliwością. Potrafią dostrzegać różne perspektywy i dążyć do harmonii w relacjach. Są doskonałymi słuchaczami, wspierającymi przyjaciółmi i partnerami. Ich intuicja pozwala im wyczuwać nastroje i potrzeby innych.",
    challenges:
      "Wyzwania dla Dwójki to tendencja do bycia zbyt uległym, niezdecydowanym lub poświęcającym własne potrzeby dla dobra innych. Mogą mieć trudności z asertywnością i stawianiem granic, co prowadzi do poczucia wykorzystania. Ważne jest, aby nauczyły się dbać o siebie i wyrażać swoje zdanie, nie obawiając się konfliktu.",
    love: "W miłości Dwójki są oddanymi i czułymi partnerami, którzy pragną głębokiej więzi i intymności. Szukają harmonii i wzajemnego zrozumienia. Mogą jednak stać się zbyt zależne od partnera lub poświęcać swoje pragnienia. Kluczowe jest znalezienie równowagi między dawaniem a braniem.",
    career:
      "Dwójki najlepiej sprawdzają się w zawodach wymagających współpracy, empatii i umiejętności interpersonalnych. Doskonale radzą sobie jako doradcy, terapeuci, nauczyciele, pracownicy socjalni, mediatorzy czy dyplomaci. Potrzebują pracy, która pozwala im pomagać innym i tworzyć pozytywne relacje.",
    advice:
      "Naucz się stawiać granice i wyrażać swoje potrzeby. Twoja wrażliwość jest darem, ale nie pozwól, aby inni ją wykorzystywali. Pamiętaj, że dbanie o siebie nie jest egoizmem. Zaufaj swojej intuicji i pozwól sobie na asertywność, aby budować zdrowe i zrównoważone relacje.",
  },
  "3": {
    number: "3",
    title: "Droga Życia 3, Twórca",
    archetype: "Twórca",
    essence:
      "Ekspresyjny artysta, który inspiruje świat swoją radością i kreatywnością.",
    traits: [
      "Kreatywny",
      "Ekspresyjny",
      "Optymistyczny",
      "Charyzmatyczny",
      "Towarzyski",
    ],
    strengths:
      "Trójki są naturalnymi twórcami i komunikatorami, obdarzonymi niezwykłą wyobraźnią i zdolnością do wyrażania siebie. Są optymistyczne, pełne radości życia i potrafią zarażać innych swoim entuzjazmem. Ich charyzma i poczucie humoru sprawiają, że są duszą towarzystwa i inspirują do działania.",
    challenges:
      "Wyzwania dla Trójki to tendencja do rozpraszania się, powierzchowności lub unikania głębszych problemów. Mogą mieć trudności z konsekwencją i dokończeniem projektów, a także z nadmiernym krytycyzmem wobec siebie. Ważne jest, aby nauczyły się skupiać, rozwijać dyscyplinę i akceptować swoje niedoskonałości.",
    love: "W miłości Trójki są namiętne, zabawne i pełne życia. Szukają partnera, który doceni ich kreatywność i poczucie humoru. Potrzebują swobody i przestrzeni do wyrażania siebie. Mogą jednak mieć trudności z zaangażowaniem lub unikać głębszych emocji. Kluczowe jest nauczenie się otwartości i szczerości.",
    career:
      "Trójki najlepiej sprawdzają się w zawodach artystycznych, komunikacyjnych i rozrywkowych. Doskonale radzą sobie jako aktorzy, pisarze, muzycy, dziennikarze, marketingowcy czy mówcy motywacyjni. Potrzebują pracy, która pozwala im wyrażać swoją kreatywność i inspirować innych.",
    advice:
      "Skup się na rozwijaniu swoich talentów, ale pamiętaj o dyscyplinie i konsekwencji. Nie bój się zagłębiać w swoje emocje i wyrażać je w zdrowy sposób. Twoja radość i kreatywność są darem, ale prawdziwa sztuka wymaga także głębi i zaangażowania. Dziel się swoim światłem, ale pamiętaj o uziemieniu.",
  },
  "4": {
    number: "4",
    title: "Droga Życia 4, Budowniczy",
    archetype: "Budowniczy",
    essence:
      "Solidny fundament, który buduje trwałe struktury i zapewnia stabilność.",
    traits: [
      "Praktyczny",
      "Pracowity",
      "Odpowiedzialny",
      "Uporządkowany",
      "Lojalny",
    ],
    strengths:
      "Czwórki są naturalnymi budowniczymi i organizatorami, obdarzonymi niezwykłą pracowitością i odpowiedzialnością. Są praktyczne, metodyczne i dążą do stabilności i bezpieczeństwa. Ich sumienność i lojalność sprawiają, że są niezawodnymi partnerami i pracownikami. Potrafią tworzyć solidne fundamenty dla siebie i innych.",
    challenges:
      "Wyzwania dla Czwórki to tendencja do bycia zbyt sztywnym, upartym lub pesymistycznym. Mogą mieć trudności z elastycznością i akceptacją zmian, a także z nadmiernym perfekcjonizmem. Ważne jest, aby nauczyły się relaksować, otwierać na nowe pomysły i akceptować, że nie wszystko musi być idealne.",
    love: "W miłości Czwórki są oddanymi i lojalnymi partnerami, którzy cenią stabilność i bezpieczeństwo. Szukają trwałego związku opartego na zaufaniu i wzajemnym szacunku. Mogą jednak mieć trudności z wyrażaniem uczuć lub być zbyt wymagające. Kluczowe jest nauczenie się elastyczności i otwartości na spontaniczność.",
    career:
      "Czwórki najlepiej sprawdzają się w zawodach wymagających precyzji, organizacji i odpowiedzialności. Doskonale radzą sobie jako inżynierowie, architekci, księgowi, menedżerowie projektów, rzemieślnicy czy naukowcy. Potrzebują pracy, która daje im poczucie celu i możliwość budowania czegoś trwałego.",
    advice:
      "Pozwól sobie na elastyczność i otwartość na zmiany. Nie wszystko musi być idealne, a spontaniczność może przynieść wiele radości. Pamiętaj, że odpoczynek jest równie ważny jak praca. Twoja siła tkwi w solidności, ale prawdziwy rozwój wymaga także adaptacji i otwartości na nowe możliwości.",
  },
  "5": {
    number: "5",
    title: "Droga Życia 5, Poszukiwacz Wolności",
    archetype: "Poszukiwacz Wolności",
    essence:
      "Dynamiczny odkrywca, który pragnie wolności i doświadcza życia w pełni.",
    traits: [
      "Wolny duch",
      "Adaptacyjny",
      "Ciekawy",
      "Odważny",
      "Wszechstronny",
    ],
    strengths:
      "Piątki są naturalnymi poszukiwaczami wolności i przygód, obdarzonymi niezwykłą ciekawością i zdolnością do adaptacji. Są dynamiczne, wszechstronne i uwielbiają doświadczać życia w pełni. Ich odwaga i otwartość na nowe doświadczenia sprawiają, że są inspirującymi towarzyszami i innowatorami.",
    challenges:
      "Wyzwania dla Piątki to tendencja do rozpraszania się, unikania zobowiązań lub nadmiernego ryzyka. Mogą mieć trudności z konsekwencją i dokończeniem projektów, a także z niecierpliwością. Ważne jest, aby nauczyły się skupiać, rozwijać dyscyplinę i znajdować równowagę między wolnością a odpowiedzialnością.",
    love: "W miłości Piątki szukają partnera, który doceni ich niezależność i pragnienie przygód. Potrzebują swobody i przestrzeni, ale jednocześnie pragną głębokiej więzi. Mogą mieć trudności z zaangażowaniem lub nudzić się w rutynowych związkach. Kluczowe jest znalezienie partnera, który rozumie ich potrzebę wolności.",
    career:
      "Piątki najlepiej sprawdzają się w zawodach wymagających elastyczności, podróży i różnorodności. Doskonale radzą sobie jako podróżnicy, dziennikarze, sprzedawcy, marketingowcy, konsultanci czy artyści. Potrzebują pracy, która daje im poczucie wolności i możliwość ciągłego rozwoju.",
    advice:
      "Znajdź równowagę między wolnością a odpowiedzialnością. Twoja potrzeba doświadczania jest cenna, ale pamiętaj o konsekwencji i dokończeniu tego, co zaczynasz. Naucz się cenić stabilność, nie tracąc przy tym swojej spontaniczności. Twoja wszechstronność jest darem, ale skupienie przyniesie prawdziwe mistrzostwo.",
  },
  "6": {
    number: "6",
    title: "Droga Życia 6, Opiekun",
    archetype: "Opiekun",
    essence:
      "Troskliwy opiekun, który służy innym miłością i odpowiedzialnością.",
    traits: [
      "Odpowiedzialny",
      "Wspierający",
      "Empatyczny",
      "Lojalny",
      "Rodzinny",
    ],
    strengths:
      "Szóstki są naturalnymi opiekunami i doradcami, obdarzonymi niezwykłą empatią i poczuciem odpowiedzialności. Są troskliwe, lojalne i zawsze gotowe pomagać innym. Ich miłość do rodziny i społeczności sprawia, że są filarami wsparcia i harmonii. Potrafią tworzyć ciepłe i bezpieczne środowiska.",
    challenges:
      "Wyzwania dla Szóstki to tendencja do nadmiernego poświęcania się, kontrolowania lub martwienia się o innych. Mogą mieć trudności z asertywnością i stawianiem granic, a także z perfekcjonizmem. Ważne jest, aby nauczyły się dbać o siebie, delegować obowiązki i akceptować, że nie wszystko jest pod ich kontrolą.",
    love: "W miłości Szóstki są oddanymi i troskliwymi partnerami, którzy pragną stabilności i bezpieczeństwa. Szukają głębokiej więzi i rodziny. Mogą jednak stać się zbyt kontrolujące lub martwić się o partnera. Kluczowe jest nauczenie się zaufania i pozwolenie innym na samodzielność.",
    career:
      "Szóstki najlepiej sprawdzają się w zawodach wymagających opieki, doradztwa i odpowiedzialności. Doskonale radzą sobie jako nauczyciele, lekarze, pielęgniarki, terapeuci, pracownicy socjalni czy doradcy. Potrzebują pracy, która pozwala im służyć innym i tworzyć pozytywne zmiany.",
    advice:
      "Pamiętaj o dbaniu o siebie i stawianiu granic. Twoja zdolność do opieki jest darem, ale nie pozwól, aby inni ją wykorzystywali. Naucz się delegować obowiązki i ufać, że inni też potrafią sobie poradzić. Twoja miłość jest potężna, ale prawdziwa opieka to także pozwolenie na wolność i rozwój innym.",
  },
  "7": {
    number: "7",
    title: "Droga Życia 7, Poszukiwacz Prawdy",
    archetype: "Poszukiwacz Prawdy",
    essence:
      "Głęboki myśliciel, który dąży do wiedzy i zrozumienia tajemnic życia.",
    traits: ["Analityczny", "Introspektywny", "Duchowy", "Niezależny", "Mądry"],
    strengths:
      "Siódemki są naturalnymi poszukiwaczami prawdy i mądrości, obdarzonymi niezwykłą inteligencją i intuicją. Są analityczne, introspektywne i dążą do głębokiego zrozumienia świata. Ich niezależność myślenia i duchowość sprawiają, że są inspirującymi przewodnikami i filozofami. Potrafią dostrzegać ukryte wzorce i znaczenia.",
    challenges:
      "Wyzwania dla Siódemki to tendencja do izolowania się, bycia zbyt krytycznym lub cynicznym. Mogą mieć trudności z wyrażaniem emocji i budowaniem bliskich relacji, a także z nadmiernym perfekcjonizmem. Ważne jest, aby nauczyły się otwierać na innych, akceptować niedoskonałości i dzielić się swoją wiedzą.",
    love: "W miłości Siódemki szukają partnera, który doceni ich intelekt i potrzebę przestrzeni. Potrzebują głębokiej rozmowy i zrozumienia, ale mogą mieć trudności z wyrażaniem uczuć. Mogą wydawać się zdystansowane lub zbyt analityczne. Kluczowe jest nauczenie się otwartości i zaufania w relacjach.",
    career:
      "Siódemki najlepiej sprawdzają się w zawodach wymagających analizy, badań i głębokiego myślenia. Doskonale radzą sobie jako naukowcy, badacze, filozofowie, pisarze, analitycy, programiści czy duchowi nauczyciele. Potrzebują pracy, która pozwala im zgłębiać wiedzę i odkrywać prawdę.",
    advice:
      "Pozwól sobie na otwartość i dzielenie się swoją wiedzą z innymi. Twoja mądrość jest darem, ale prawdziwe zrozumienie przychodzi także poprzez interakcję. Nie bój się wyrażać swoich emocji i budować bliskich relacji. Izolacja może prowadzić do samotności, a prawdziwa mądrość obejmuje także serce.",
  },
  "8": {
    number: "8",
    title: "Droga Życia 8, Człowiek Sukcesu",
    archetype: "Człowiek Sukcesu",
    essence:
      "Potężny realizator, który manifestuje obfitość i osiąga wielkie cele.",
    traits: [
      "Ambitny",
      "Skuteczny",
      "Pewny siebie",
      "Zorientowany na cel",
      "Władczy",
    ],
    strengths:
      "Ósemki są naturalnymi liderami i realizatorami, obdarzonymi niezwykłą ambicją i zdolnością do manifestowania obfitości. Są pewne siebie, zorientowane na cel i potrafią przekształcać wizje w rzeczywistość. Ich siła woli i determinacja sprawiają, że osiągają wielkie sukcesy w świecie materialnym i biznesowym.",
    challenges:
      "Wyzwania dla Ósemki to tendencja do bycia zbyt materialistycznym, kontrolującym lub autorytarnym. Mogą mieć trudności z empatią i wrażliwością, a także z nadmiernym stresem. Ważne jest, aby nauczyły się równowagi między sukcesem materialnym a duchowym, dbać o relacje i rozwijać współczucie.",
    love: "W miłości Ósemki są lojalne i oddane, ale mogą mieć trudności z wyrażaniem wrażliwości. Szukają partnera, który doceni ich ambicje i siłę, ale jednocześnie pomoże im otworzyć się na emocje. Mogą być zbyt dominujące lub skupione na karierze. Kluczowe jest nauczenie się równowagi i intymności.",
    career:
      "Ósemki najlepiej sprawdzają się na stanowiskach kierowniczych, przedsiębiorczych i w zawodach wymagających zarządzania i strategii. Doskonale radzą sobie jako dyrektorzy, menedżerowie, inwestorzy, politycy czy właściciele firm. Potrzebują pracy, która daje im poczucie władzy i możliwość osiągania wielkich celów.",
    advice:
      "Pamiętaj o równowadze między sukcesem materialnym a duchowym. Twoja siła jest darem, ale prawdziwa władza to także empatia i służba innym. Naucz się dbać o relacje i wyrażać swoje emocje. Prawdziwa obfitość obejmuje nie tylko bogactwo, ale także miłość, zdrowie i szczęście w życiu osobistym.",
  },
  "9": {
    number: "9",
    title: "Droga Życia 9, Humanitarysta",
    archetype: "Humanitarysta",
    essence:
      "Współczujący altruista, który służy ludzkości i inspiruje do globalnej zmiany.",
    traits: [
      "Współczujący",
      "Altruistyczny",
      "Tolerancyjny",
      "Idealistyczny",
      "Mądry",
    ],
    strengths:
      "Dziewiątki są naturalnymi humanitarystami i altruistami, obdarzonymi niezwykłym współczuciem i pragnieniem służenia ludzkości. Są tolerancyjne, idealistyczne i dążą do tworzenia lepszego świata. Ich mądrość i uniwersalna miłość sprawiają, że są inspirującymi liderami i orędownikami zmian społecznych.",
    challenges:
      "Wyzwania dla Dziewiątki to tendencja do bycia zbyt idealistycznym, rozczarowanym lub poświęcającym własne potrzeby. Mogą mieć trudności z asertywnością i stawianiem granic, a także z poczuciem beznadziejności. Ważne jest, aby nauczyły się dbać o siebie, akceptować niedoskonałości świata i działać lokalnie.",
    love: "W miłości Dziewiątki są oddanymi i współczującymi partnerami, którzy pragną głębokiej więzi i zrozumienia. Szukają partnera, który podziela ich wartości i pragnienie służenia. Mogą jednak poświęcać swoje potrzeby lub być zbyt idealistyczne. Kluczowe jest nauczenie się równowagi i dbania o siebie.",
    career:
      "Dziewiątki najlepiej sprawdzają się w zawodach wymagających służby, doradztwa i wpływu społecznego. Doskonale radzą sobie jako pracownicy organizacji pozarządowych, nauczyciele, terapeuci, artyści, pisarze czy politycy. Potrzebują pracy, która pozwala im pomagać innym i tworzyć pozytywne zmiany.",
    advice:
      "Pamiętaj o dbaniu o siebie i stawianiu granic. Twoje współczucie jest darem, ale nie pozwól, aby inni cię wykorzystywali. Naucz się akceptować niedoskonałości świata i działać lokalnie, aby tworzyć realne zmiany. Twoja miłość do ludzkości jest potężna, ale prawdziwa służba zaczyna się od miłości do siebie.",
  },
  "11": {
    number: "11",
    title: "Droga Życia 11, Mistrz Intuicji",
    archetype: "Mistrz Intuicji",
    essence: "Inspirujący wizjoner, który łączy świat duchowy z materialnym.",
    traits: ["Intuicyjny", "Wizjonerski", "Inspirujący", "Wrażliwy", "Duchowy"],
    strengths:
      "Jedenastki to Mistrzowskie Liczby, obdarzone niezwykłą intuicją, wrażliwością i zdolnością do inspirowania innych. Są wizjonerami, którzy potrafią łączyć świat duchowy z materialnym, przynosząc nowe idee i perspektywy. Ich charyzma i głębokie zrozumienie sprawiają, że są naturalnymi nauczycielami i przewodnikami.",
    challenges:
      "Wyzwania dla Jedenastki to tendencja do bycia zbyt nerwowym, lękliwym lub przytłoczonym swoją wrażliwością. Mogą mieć trudności z uziemieniem i praktycznym działaniem, a także z nadmiernym perfekcjonizmem. Ważne jest, aby nauczyły się ufać swojej intuicji, dbać o swoje zdrowie psychiczne i działać z odwagą.",
    love: "W miłości Jedenastki szukają partnera, który doceni ich głębię i duchowość. Potrzebują partnera, który będzie ich wspierał w ich misji i rozumiał ich wrażliwość. Mogą mieć trudności z uziemieniem w relacjach lub być zbyt idealistyczne. Kluczowe jest znalezienie równowagi między duchowością a codziennością.",
    career:
      "Jedenastki najlepiej sprawdzają się w zawodach wymagających inspiracji, nauczania i wizjonerstwa. Doskonale radzą sobie jako duchowi nauczyciele, terapeuci, artyści, pisarze, mówcy motywacyjni czy innowatorzy. Potrzebują pracy, która pozwala im dzielić się swoją mądrością i inspirować innych.",
    advice:
      "Ufaj swojej intuicji i nie bój się dzielić swoją wizją ze światem. Pamiętaj o uziemieniu i dbaniu o swoje zdrowie psychiczne. Twoja wrażliwość jest darem, ale wymaga ochrony. Działaj z odwagą, ale pamiętaj o praktycznym podejściu. Jesteś mostem między światami, a twoja misja jest potężna.",
  },
  "22": {
    number: "22",
    title: "Droga Życia 22, Mistrz Budowniczy",
    archetype: "Mistrz Budowniczy",
    essence:
      "Potężny realizator, który buduje wielkie dzieła dla dobra ludzkości.",
    traits: [
      "Wizjonerski",
      "Praktyczny",
      "Ambitny",
      "Humanitarny",
      "Skuteczny",
    ],
    strengths:
      "Dwudziestki Dwójki to Mistrzowskie Liczby, obdarzone niezwykłą zdolnością do przekształcania wielkich wizji w rzeczywistość. Są praktycznymi wizjonerami, którzy potrafią budować trwałe struktury i systemy dla dobra ludzkości. Ich ambicja i skuteczność sprawiają, że są potężnymi realizatorami i liderami globalnych projektów.",
    challenges:
      "Wyzwania dla Dwudziestki Dwójki to tendencja do bycia zbyt przytłoczonym swoją misją, perfekcjonistycznym lub kontrolującym. Mogą mieć trudności z delegowaniem obowiązków i dbaniem o siebie, a także z nadmiernym stresem. Ważne jest, aby nauczyły się równowagi, zaufania do innych i dbania o swoje zdrowie.",
    love: "W miłości Dwudziestki Dwójki szukają partnera, który doceni ich misję i wspiera ich w działaniu. Potrzebują partnera, który będzie ich uziemiał i pomagał im znaleźć równowagę. Mogą być zbyt skupione na pracy lub mieć trudności z wyrażaniem wrażliwości. Kluczowe jest znalezienie równowagi między misją a intymnością.",
    career:
      "Dwudziestki Dwójki najlepiej sprawdzają się w zawodach wymagających zarządzania, budowania i wpływu globalnego. Doskonale radzą sobie jako liderzy organizacji międzynarodowych, architekci, inżynierowie, politycy, przedsiębiorcy czy twórcy systemów. Potrzebują pracy, która pozwala im budować wielkie dzieła dla dobra ludzkości.",
    advice:
      "Ufaj swojej wizji i nie bój się działać na wielką skalę. Pamiętaj o równowadze między pracą a życiem osobistym. Twoja zdolność do budowania jest darem, ale wymaga także dbania o siebie i delegowania obowiązków. Jesteś potężnym budowniczym, a twoja misja jest globalna.",
  },
  "33": {
    number: "33",
    title: "Droga Życia 33, Mistrz Nauczyciel",
    archetype: "Mistrz Nauczyciel",
    essence:
      "Uniwersalny uzdrowiciel, który służy światu bezwarunkową miłością.",
    traits: [
      "Współczujący",
      "Uzdrowiciel",
      "Bezwarunkowa miłość",
      "Inspirujący",
      "Duchowy",
    ],
    strengths:
      "Trzydziestki Trójki to Mistrzowskie Liczby, obdarzone niezwykłą zdolnością do bezwarunkowej miłości i uzdrawiania. Są uniwersalnymi nauczycielami, którzy służą światu swoim współczuciem i mądrością. Ich zdolność do inspirowania i podnoszenia innych sprawia, że są potężnymi przewodnikami duchowymi i liderami zmian społecznych.",
    challenges:
      "Wyzwania dla Trzydziestki Trójki to tendencja do nadmiernego poświęcania się, bycia przytłoczonym cierpieniem świata lub unikania własnych potrzeb. Mogą mieć trudności z uziemieniem i praktycznym działaniem, a także z nadmiernym idealizmem. Ważne jest, aby nauczyły się dbać o siebie, stawiać granice i działać z mądrością.",
    love: "W miłości Trzydziestki Trójki są oddanymi i bezwarunkowo kochającymi partnerami. Szukają partnera, który podziela ich misję i wspiera ich w służbie. Mogą jednak poświęcać swoje potrzeby lub być zbyt idealistyczne. Kluczowe jest nauczenie się równowagi między dawaniem a braniem i dbania o siebie.",
    career:
      "Trzydziestki Trójki najlepiej sprawdzają się w zawodach wymagających uzdrawiania, nauczania i służby. Doskonale radzą sobie jako duchowi nauczyciele, terapeuci, uzdrowiciele, pracownicy humanitarni, artyści czy liderzy społeczni. Potrzebują pracy, która pozwala im służyć ludzkości i szerzyć miłość.",
    advice:
      "Pamiętaj o dbaniu o siebie i stawianiu granic. Twoja bezwarunkowa miłość jest darem, ale wymaga także ochrony. Naucz się uziemienia i praktycznego działania, aby twoja misja była skuteczna. Jesteś uniwersalnym uzdrowicielem, a twoja miłość ma moc transformacji świata.",
  },
};

export const NUMEROLOGY_FAQ_PL = [
  {
    q: "Czym jest Liczba Drogi Życia?",
    a: "Liczba Drogi Życia to jedna z najważniejszych liczb w numerologii, która ujawnia Twoją główną ścieżkę w życiu, wrodzone talenty, wyzwania i cel istnienia. Jest ona obliczana na podstawie pełnej daty urodzenia i symbolizuje energię, która będzie Ci towarzyszyć przez całe życie.",
  },
  {
    q: "Jak obliczyć swoją Liczbę Drogi Życia?",
    a: "Aby obliczyć swoją Liczbę Drogi Życia, należy zredukować każdą część daty urodzenia (dzień, miesiąc, rok) do pojedynczej cyfry, a następnie zsumować te cyfry i ponownie zredukować wynik do pojedynczej cyfry (od 1 do 9). Wyjątkiem są Liczby Mistrzowskie 11, 22 i 33, których nie redukujemy dalej. Przykład: Data urodzenia 15.08.1985 -> Dzień: 1+5=6. Miesiąc: 0+8=8. Rok: 1+9+8+5=23 -> 2+3=5. Suma: 6+8+5=19 -> 1+9=10 -> 1+0=1. Liczba Drogi Życia to 1.",
  },
  {
    q: "Co oznaczają Liczby Mistrzowskie 11, 22 i 33?",
    a: "Liczby Mistrzowskie 11, 22 i 33 są uważane za szczególnie potężne i niosą ze sobą większy potencjał, ale także większe wyzwania. Osoby z tymi liczbami Drogi Życia mają misję służenia ludzkości na wyższym poziomie. 11 to Mistrz Intuicji, 22 to Mistrz Budowniczy, a 33 to Mistrz Nauczyciel. Wymagają one od osoby większej świadomości i pracy nad sobą, aby w pełni wykorzystać swój potencjał.",
  },
  {
    q: "Jak numerologia łączy się z astrologią?",
    a: "Zarówno numerologia, jak i astrologia są starożytnymi systemami, które oferują wgląd w naszą osobowość, potencjał i ścieżkę życiową. Astrologia analizuje położenie planet w momencie urodzenia, aby stworzyć mapę naszej psychiki i przeznaczenia, podczas gdy numerologia wykorzystuje liczby z daty urodzenia i imienia. Oba systemy uzupełniają się, dostarczając kompleksowego obrazu jednostki i pomagając w zrozumieniu jej unikalnej drogi rozwoju.",
  },
];

export const NUMEROLOGY_HUB_PL = {
  title: "Kalkulator Numerologiczny Online – Droga Życia i Znaczenie Liczb",
  description:
    "Oblicz swoją Liczbę Drogi Życia z daty urodzenia (darmowy kalkulator) i poznaj znaczenie wszystkich liczb: od 1 do 9 oraz Liczb Mistrzowskich 11, 22 i 33.",
};
