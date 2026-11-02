import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type ZodiacSignPolish = {
  tagline: string;
  core: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
};

export const ZODIAC_SIGN_PL: Record<ZodiacSlug, ZodiacSignPolish> = {
  aries: {
    tagline: "Jestem, więc działam – z odwagą i pasją toruję nowe ścieżki.",
    core: "Baran to pionier zodiaku, ucieleśnienie czystej energii i inicjatywy. Kierowany przez Marsa, symbolizuje początek, impuls i odwagę. Osoby urodzone pod tym znakiem są naturalnymi liderami, pełnymi entuzjazmu i gotowymi do podjęcia każdego wyzwania. Ich wewnętrzny ogień napędza ich do działania, często bez wahania, co czyni ich niezwykle skutecznymi w rozpoczynaniu nowych projektów i przecieraniu szlaków. Pod wpływem stresu Baran może stać się impulsywny, niecierpliwy i skłonny do konfrontacji, reagując złością na przeszkody. Jego podstawowym darem jest zdolność do inspirowania innych do działania i bezkompromisowa wiara w siebie.",
    strengths: [
      "Odwaga i inicjatywa",
      "Entuzjazm i optymizm",
      "Energia i dynamizm",
      "Bezpośredniość i szczerość",
    ],
    challenges: [
      "Impulsywność i niecierpliwość",
      "Skłonność do dominacji",
      "Agresja i wybuchowość",
      "Brak konsekwencji w długoterminowych projektach",
    ],
    love: "W miłości Baran jest namiętny, spontaniczny i pełen zapału. Potrzebuje partnera, który dorówna mu energią i będzie gotów na wspólne przygody. Ceni niezależność i wolność, zarówno swoją, jak i partnera. W związku może być nieco egoistyczny, ale jego lojalność i oddanie są niezaprzeczalne. Szuka partnera, który będzie go podziwiał i wspierał w jego dążeniach, ale jednocześnie potrafi postawić mu granice. Najlepsze dopasowanie znajdzie ze znakami ognistymi (Lew, Strzelec) lub powietrznymi (Bliźnięta, Waga, Wodnik), które cenią dynamikę i intelektualną stymulację.",
    career:
      "Baran doskonale sprawdza się w zawodach wymagających inicjatywy, odwagi i szybkiego podejmowania decyzji. Jest naturalnym liderem i przedsiębiorcą. Idealne środowiska pracy to te, które oferują autonomię, wyzwania i możliwość bycia na czele. Nie znosi rutyny i biurokracji. Może być świetnym menedżerem, sportowcem, żołnierzem, chirurgiem czy przedsiębiorcą. Jego styl pracy jest dynamiczny, bezpośredni i skoncentrowany na osiąganiu celów. Potrzebuje projektów, które pozwalają mu wykorzystać jego pionierskiego ducha.",
  },
  taurus: {
    tagline:
      "Posiadam, więc buduję – z cierpliwością i wytrwałością tworzę trwałe fundamenty.",
    core: "Byk to ucieleśnienie stabilności, zmysłowości i praktyczności. Rządzony przez Wenus, symbolizuje piękno, komfort, wartości materialne i głębokie połączenie z naturą. Osoby urodzone pod tym znakiem cenią sobie bezpieczeństwo, spokój i luksus. Są niezwykle cierpliwe, wytrwałe i konsekwentne w dążeniu do celu, budując trwałe fundamenty w każdej dziedzinie życia. Pod wpływem stresu Byk może stać się uparty, nieugięty i oporny na zmiany, kurczowo trzymając się tego, co znane i bezpieczne. Jego podstawowym darem jest zdolność do tworzenia piękna, stabilności i obfitości, a także niezachwiana lojalność.",
    strengths: [
      "Cierpliwość i wytrwałość",
      "Praktyczność i realizm",
      "Lojalność i niezawodność",
      "Zmysłowość i docenianie piękna",
    ],
    challenges: [
      "Upartość i niechęć do zmian",
      "Materializm i zaborczość",
      "Lenistwo i inercja",
      "Skłonność do nadmiernego dogadzania sobie",
    ],
    love: "W miłości Byk jest oddany, lojalny i bardzo zmysłowy. Szuka stabilnego, bezpiecznego związku, w którym może czuć się komfortowo i doceniony. Potrzebuje partnera, który podziela jego wartości, ceni domowe ognisko i potrafi docenić jego starania. Byk wyraża miłość poprzez czyny, troskę i zapewnianie materialnego bezpieczeństwa. Może być nieco zaborczy, ale jego oddanie jest niezachwiane. Najlepsze dopasowanie znajdzie ze znakami ziemskimi (Panna, Koziorożec) lub wodnymi (Rak, Skorpion, Ryby), które cenią stabilność, głębię emocjonalną i bezpieczeństwo.",
    career:
      "Byk doskonale sprawdza się w zawodach wymagających cierpliwości, precyzji i dbałości o szczegóły. Ceni stabilność finansową i bezpieczeństwo zatrudnienia. Idealne środowiska pracy to te, które oferują przewidywalność, komfort i możliwość tworzenia czegoś trwałego. Może być świetnym bankierem, architektem krajobrazu, kucharzem, artystą, rolnikiem czy projektantem wnętrz. Jego styl pracy jest metodyczny, dokładny i skoncentrowany na jakości. Potrzebuje zadań, które pozwalają mu wykorzystać jego praktyczne umiejętności i zmysł estetyczny.",
  },
  gemini: {
    tagline:
      "Myślę, więc komunikuję – z ciekawością i elastycznością łączę światy idei.",
    core: "Bliźnięta to intelektualista zodiaku, ucieleśnienie ciekawości, komunikacji i zmienności. Rządzone przez Merkurego, symbolizują umysł, wymianę informacji i zdolność adaptacji. Osoby urodzone pod tym znakiem są bystre, dowcipne i niezwykle wszechstronne, z łatwością przyswajają nowe informacje i nawiązują kontakty. Ich umysł jest zawsze w ruchu, poszukując nowych bodźców i wiedzy. Pod wpływem stresu Bliźnięta mogą stać się nerwowe, rozproszone i powierzchowne, skacząc od tematu do tematu bez głębszego zaangażowania. Ich podstawowym darem jest zdolność do łączenia ludzi i idei, a także niezwykła zdolność adaptacji.",
    strengths: [
      "Inteligencja i bystrość",
      "Zdolności komunikacyjne",
      "Wszechstronność i adaptacyjność",
      "Ciekawość i otwartość na nowe",
    ],
    challenges: [
      "Powierzchowność i brak głębi",
      "Niecierpliwość i rozproszenie",
      "Niespójność i zmienność nastrojów",
      "Skłonność do plotek i manipulacji",
    ],
    love: "W miłości Bliźnięta szukają partnera, który będzie stymulował ich intelektualnie i zapewniał różnorodność. Potrzebują swobody i przestrzeni, nie znoszą rutyny i nudy. Są flirtujące, dowcipne i potrafią oczarować słowem. W związku cenią sobie rozmowy, wspólne zainteresowania i poczucie humoru. Mogą mieć trudności z głębokim zaangażowaniem emocjonalnym, preferując lekkość i zabawę. Najlepsze dopasowanie znajdą ze znakami powietrznymi (Waga, Wodnik) lub ognistymi (Baran, Lew, Strzelec), które cenią intelekt, niezależność i dynamikę.",
    career:
      "Bliźnięta doskonale sprawdzają się w zawodach wymagających komunikacji, szybkiego myślenia i elastyczności. Cenią sobie różnorodność zadań i możliwość uczenia się nowych rzeczy. Idealne środowiska pracy to te, które oferują dynamiczne tempo, interakcje z ludźmi i brak monotonii. Mogą być świetnymi dziennikarzami, pisarzami, handlowcami, nauczycielami, PR-owcami czy specjalistami od mediów społecznościowych. Ich styl pracy jest szybki, wielozadaniowy i oparty na wymianie informacji. Potrzebują projektów, które pozwalają im wykorzystać ich zdolności komunikacyjne i intelektualne.",
  },
  cancer: {
    tagline:
      "Czuję, więc opiekuję – z empatią i troską tworzę bezpieczne schronienie.",
    core: "Rak to opiekun zodiaku, ucieleśnienie emocji, intuicji i troski. Rządzony przez Księżyc, symbolizuje dom, rodzinę, macierzyństwo i głębokie poczucie bezpieczeństwa. Osoby urodzone pod tym znakiem są niezwykle wrażliwe, empatyczne i opiekuńcze, z silnym instynktem ochrony tych, których kochają. Ich intuicja jest niezwykle rozwinięta, co pozwala im wyczuwać nastroje i potrzeby innych. Pod wpływem stresu Rak może stać się nastrojowy, wycofany i nadmiernie wrażliwy, chowając się w swojej skorupie. Jego podstawowym darem jest zdolność do tworzenia bezpiecznej i kochającej przestrzeni, a także głęboka empatia i intuicja.",
    strengths: [
      "Empatia i współczucie",
      "Opiekuńczość i troska",
      "Intuicja i wrażliwość",
      "Lojalność i oddanie rodzinie",
    ],
    challenges: [
      "Nastrojowość i zmienność emocjonalna",
      "Nadmierna wrażliwość i urazowość",
      "Skłonność do manipulacji emocjonalnej",
      "Trudności w odpuszczaniu przeszłości",
    ],
    love: "W miłości Rak szuka głębokiego połączenia emocjonalnego, bezpieczeństwa i poczucia przynależności. Jest niezwykle oddany, czuły i opiekuńczy. Potrzebuje partnera, który będzie go rozumiał, wspierał emocjonalnie i cenił domowe ognisko. Rak wyraża miłość poprzez troskę, gotowanie i tworzenie przytulnej atmosfery. Może być nieco zaborczy i potrzebuje dużo uwagi, ale jego miłość jest bezwarunkowa. Najlepsze dopasowanie znajdzie ze znakami wodnymi (Skorpion, Ryby) lub ziemskimi (Byk, Panna, Koziorożec), które cenią głębię emocjonalną, stabilność i bezpieczeństwo.",
    career:
      "Rak doskonale sprawdza się w zawodach wymagających empatii, troski i umiejętności budowania relacji. Ceni sobie stabilność i poczucie, że jego praca ma sens i pomaga innym. Idealne środowiska pracy to te, które oferują wsparcie, poczucie wspólnoty i możliwość opiekowania się innymi. Może być świetnym pielęgniarzem, terapeutą, nauczycielem, pracownikiem socjalnym, kucharzem czy dekoratorem wnętrz. Jego styl pracy jest intuicyjny, opiekuńczy i skoncentrowany na ludziach. Potrzebuje projektów, które pozwalają mu wykorzystać jego empatię i zdolności opiekuńcze.",
  },
  leo: {
    tagline:
      "Chcę, więc świecę – z godnością i kreatywnością inspiruję innych.",
    core: "Lew to król zodiaku, ucieleśnienie charyzmy, kreatywności i pewności siebie. Rządzony przez Słońce, symbolizuje ego, witalność, przywództwo i potrzebę bycia w centrum uwagi. Osoby urodzone pod tym znakiem są naturalnymi liderami, pełnymi pasji, hojności i optymizmu. Kochają życie, dramatyzm i wszystko, co spektakularne. Ich wewnętrzny blask przyciąga innych, a ich kreatywność inspiruje. Pod wpływem stresu Lew może stać się arogancki, dominujący i dramatyczny, szukając uwagi za wszelką cenę. Jego podstawowym darem jest zdolność do inspirowania, motywowania i rozświetlania życia innych swoją obecnością.",
    strengths: [
      "Charyzma i pewność siebie",
      "Kreatywność i ekspresja",
      "Hojność i lojalność",
      "Optymizm i entuzjazm",
    ],
    challenges: [
      "Arogancja i egocentryzm",
      "Potrzeba bycia w centrum uwagi",
      "Dramatyzm i teatralność",
      "Trudności w przyjmowaniu krytyki",
    ],
    love: "W miłości Lew jest namiętny, romantyczny i niezwykle lojalny. Szuka partnera, który będzie go podziwiał, doceniał i celebrował jego wyjątkowość. Potrzebuje dużo uwagi, komplementów i poczucia, że jest najważniejszy. Lew wyraża miłość w wielkim stylu, poprzez gesty, prezenty i publiczne okazywanie uczuć. Może być nieco dominujący, ale jego serce jest ogromne i pełne miłości. Najlepsze dopasowanie znajdzie ze znakami ognistymi (Baran, Strzelec) lub powietrznymi (Bliźnięta, Waga, Wodnik), które cenią pasję, niezależność i dynamikę.",
    career:
      "Lew doskonale sprawdza się w zawodach wymagających kreatywności, przywództwa i występowania publicznego. Ceni sobie uznanie, prestiż i możliwość bycia na czele. Idealne środowiska pracy to te, które oferują scenę, wyzwania i możliwość inspirowania innych. Może być świetnym aktorem, reżyserem, menedżerem, politykiem, artystą czy przedsiębiorcą. Jego styl pracy jest dynamiczny, charyzmatyczny i skoncentrowany na osiąganiu spektakularnych sukcesów. Potrzebuje projektów, które pozwalają mu wykorzystać jego kreatywność i zdolności przywódcze.",
  },
  virgo: {
    tagline:
      "Analizuję, więc służę – z precyzją i sumiennością doskonalę świat.",
    core: "Panna to analityk zodiaku, ucieleśnienie porządku, precyzji i służby. Rządzona przez Merkurego, symbolizuje logikę, analizę, zdrowie i dbałość o szczegóły. Osoby urodzone pod tym znakiem są niezwykle metodyczne, pracowite i praktyczne, z wrodzoną potrzebą doskonalenia siebie i otoczenia. Ich umysł jest ostry i analityczny, zdolny do dostrzegania najdrobniejszych szczegółów i rozwiązywania złożonych problemów. Pod wpływem stresu Panna może stać się krytyczna, perfekcjonistyczna i nadmiernie zmartwiona, skupiając się na niedoskonałościach. Jej podstawowym darem jest zdolność do organizacji, usprawniania i służenia innym z oddaniem.",
    strengths: [
      "Analityczny umysł i precyzja",
      "Pracowitość i sumienność",
      "Praktyczność i efektywność",
      "Dbałość o szczegóły i porządek",
    ],
    challenges: [
      "Krytycyzm i perfekcjonizm",
      "Nadmierne zamartwianie się",
      "Skłonność do hipochondrii",
      "Trudności w relaksowaniu się",
    ],
    love: "W miłości Panna jest oddana, praktyczna i lojalna. Szuka partnera, który będzie stabilny, inteligentny i doceni jej starania. Potrzebuje poczucia bezpieczeństwa i porządku w związku. Panna wyraża miłość poprzez czyny, troskę o codzienne sprawy i praktyczne wsparcie. Może być nieco powściągliwa w okazywaniu uczuć, ale jej oddanie jest głębokie. Najlepsze dopasowanie znajdzie ze znakami ziemskimi (Byk, Koziorożec) lub wodnymi (Rak, Skorpion, Ryby), które cenią stabilność, inteligencję i praktyczność.",
    career:
      "Panna doskonale sprawdza się w zawodach wymagających precyzji, analizy i dbałości o szczegóły. Ceni sobie porządek, efektywność i możliwość doskonalenia procesów. Idealne środowiska pracy to te, które oferują strukturę, jasne zasady i możliwość skupienia się na zadaniach. Może być świetnym analitykiem, księgowym, redaktorem, naukowcem, lekarzem, dietetykiem czy programistą. Jej styl pracy jest metodyczny, dokładny i skoncentrowany na jakości. Potrzebuje projektów, które pozwalają jej wykorzystać jej analityczny umysł i zdolności organizacyjne.",
  },
  libra: {
    tagline:
      "Ważę, więc harmonizuję – z gracją i dyplomacją dążę do równowagi.",
    core: "Waga to dyplomata zodiaku, ucieleśnienie harmonii, sprawiedliwości i piękna. Rządzona przez Wenus, symbolizuje relacje, równowagę, estetykę i dążenie do pokoju. Osoby urodzone pod tym znakiem są urocze, towarzyskie i niezwykle sprawiedliwe, z wrodzoną potrzebą tworzenia harmonii w swoim otoczeniu. Cenią sobie piękno, sztukę i eleganckie otoczenie. Ich zdolność do widzenia obu stron medalu czyni ich doskonałymi mediatorami. Pod wpływem stresu Waga może stać się niezdecydowana, unikająca konfrontacji i skłonna do poświęcania własnych potrzeb dla utrzymania pokoju. Jej podstawowym darem jest zdolność do tworzenia równowagi, piękna i sprawiedliwości w relacjach.",
    strengths: [
      "Dyplomacja i takt",
      "Urok i towarzyskość",
      "Poczucie sprawiedliwości",
      "Zmysł estetyczny i dążenie do harmonii",
    ],
    challenges: [
      "Niezdecydowanie i unikanie konfrontacji",
      "Powierzchowność i próżność",
      "Skłonność do ulegania innym",
      "Trudności w stawianiu granic",
    ],
    love: "W miłości Waga szuka partnerstwa, równowagi i głębokiego połączenia. Jest romantyczna, czuła i bardzo oddana. Potrzebuje partnera, który będzie ją doceniał, wspierał i dzielił z nią życie towarzyskie. Waga wyraża miłość poprzez wspólne spędzanie czasu, romantyczne gesty i dążenie do harmonii w związku. Nie znosi konfliktów i stara się ich unikać. Najlepsze dopasowanie znajdzie ze znakami powietrznymi (Bliźnięta, Wodnik) lub ognistymi (Lew, Strzelec), które cenią intelekt, niezależność i dynamikę.",
    career:
      "Waga doskonale sprawdza się w zawodach wymagających dyplomacji, negocjacji i zmysłu estetycznego. Ceni sobie współpracę, sprawiedliwość i harmonijne środowisko pracy. Idealne środowiska pracy to te, które oferują możliwość pracy zespołowej, rozwiązywania konfliktów i tworzenia piękna. Może być świetnym prawnikiem, mediatorem, dyplomatą, projektantem mody, dekoratorem wnętrz czy doradcą personalnym. Jej styl pracy jest współpracujący, elegancki i skoncentrowany na osiąganiu konsensusu. Potrzebuje projektów, które pozwalają jej wykorzystać jej zdolności interpersonalne i zmysł estetyczny.",
  },
  scorpio: {
    tagline:
      "Pragnę, więc transformuję – z intensywnością i głębią odkrywam prawdę.",
    core: "Skorpion to alchemik zodiaku, ucieleśnienie intensywności, transformacji i głębi. Rządzony przez Plutona (i Marsa), symbolizuje tajemnicę, moc, odrodzenie i zdolność do przekraczania granic. Osoby urodzone pod tym znakiem są niezwykle przenikliwe, zdeterminowane i pełne pasji, z wrodzoną potrzebą docierania do sedna spraw. Nie boją się ciemnych stron życia i potrafią wyjść z każdej kryzysowej sytuacji silniejsi. Pod wpływem stresu Skorpion może stać się zaborczy, mściwy i skryty, manipulując innymi dla osiągnięcia swoich celów. Jego podstawowym darem jest zdolność do głębokiej transformacji, uzdrawiania i odkrywania ukrytych prawd.",
    strengths: [
      "Intensywność i determinacja",
      "Przenikliwość i intuicja",
      "Odporność i zdolność do regeneracji",
      "Lojalność i oddanie",
    ],
    challenges: [
      "Zaborczość i zazdrość",
      "Mściwość i manipulacja",
      "Skrytość i nieufność",
      "Trudności w odpuszczaniu",
    ],
    love: "W miłości Skorpion jest namiętny, intensywny i niezwykle lojalny. Szuka głębokiego, transformującego połączenia, w którym może czuć się całkowicie bezpieczny i zrozumiany. Potrzebuje partnera, który dorówna mu intensywnością, będzie mu ufał i nie będzie bał się głębi emocjonalnej. Skorpion wyraża miłość poprzez całkowite oddanie i ochronę. Może być bardzo zaborczy i zazdrosny, ale jego miłość jest bezgraniczna. Najlepsze dopasowanie znajdzie ze znakami wodnymi (Rak, Ryby) lub ziemskimi (Byk, Panna, Koziorożec), które cenią głębię emocjonalną, stabilność i lojalność.",
    career:
      "Skorpion doskonale sprawdza się w zawodach wymagających analizy, docierania do prawdy i radzenia sobie z trudnymi sytuacjami. Ceni sobie władzę, niezależność i możliwość wpływania na zmiany. Idealne środowiska pracy to te, które oferują wyzwania, tajemnice i możliwość głębokiej analizy. Może być świetnym detektywem, psychologiem, badaczem, chirurgiem, finansistą czy agentem wywiadu. Jego styl pracy jest intensywny, skoncentrowany i niezwykle skuteczny. Potrzebuje projektów, które pozwalają mu wykorzystać jego przenikliwość i zdolność do transformacji.",
  },
  sagittarius: {
    tagline:
      "Widzę, więc eksploruję – z optymizmem i wolnością poszukuję sensu.",
    core: "Strzelec to filozof zodiaku, ucieleśnienie wolności, optymizmu i poszukiwania prawdy. Rządzony przez Jowisza, symbolizuje ekspansję, wiedzę, podróże i wyższe idee. Osoby urodzone pod tym znakiem są optymistyczne, entuzjastyczne i niezwykle otwarte na świat, z wrodzoną potrzebą eksplorowania nowych horyzontów. Cenią sobie wolność, niezależność i możliwość ciągłego rozwoju. Ich umysł jest szeroki i filozoficzny, zawsze poszukujący sensu życia. Pod wpływem stresu Strzelec może stać się nieodpowiedzialny, lekkomyślny i skłonny do przesady, unikając zobowiązań. Jego podstawowym darem jest zdolność do inspirowania innych do poszukiwania prawdy i wiary w lepsze jutro.",
    strengths: [
      "Optymizm i entuzjazm",
      "Wolność i niezależność",
      "Filozoficzny umysł i ciekawość świata",
      "Szczerość i otwartość",
    ],
    challenges: [
      "Nieodpowiedzialność i lekkomyślność",
      "Skłonność do przesady",
      "Brak taktu i szczerość do bólu",
      "Trudności w zobowiązaniach",
    ],
    love: "W miłości Strzelec szuka partnera, który będzie dzielił jego pasję do podróży, wiedzy i wolności. Jest spontaniczny, optymistyczny i potrzebuje dużo przestrzeni. Ceni sobie niezależność i nie znosi ograniczeń. Strzelec wyraża miłość poprzez wspólne przygody, inspirujące rozmowy i poczucie humoru. Może mieć trudności z głębokim zaangażowaniem, preferując lekkość i swobodę. Najlepsze dopasowanie znajdzie ze znakami ognistymi (Baran, Lew) lub powietrznymi (Bliźnięta, Waga, Wodnik), które cenią wolność, intelekt i dynamikę.",
    career:
      "Strzelec doskonale sprawdza się w zawodach wymagających podróży, nauczania, filozofii i szerokich perspektyw. Ceni sobie wolność, niezależność i możliwość ciągłego rozwoju. Idealne środowiska pracy to te, które oferują różnorodność, wyzwania i możliwość eksplorowania nowych idei. Może być świetnym nauczycielem, profesorem, podróżnikiem, pisarzem, filozofem, prawnikiem czy trenerem. Jego styl pracy jest entuzjastyczny, inspirujący i skoncentrowany na poszukiwaniu sensu. Potrzebuje projektów, które pozwalają mu wykorzystać jego szerokie horyzonty i optymizm.",
  },
  capricorn: {
    tagline:
      "Używam, więc osiągam – z dyscypliną i ambicją wspinam się na szczyt.",
    core: "Koziorożec to strateg zodiaku, ucieleśnienie dyscypliny, ambicji i odpowiedzialności. Rządzony przez Saturna, symbolizuje strukturę, czas, autorytet i dążenie do osiągnięć. Osoby urodzone pod tym znakiem są niezwykle pracowite, zdeterminowane i praktyczne, z wrodzoną potrzebą osiągania sukcesu i budowania trwałych struktur. Cenią sobie ciężką pracę, odpowiedzialność i status społeczny. Ich podejście do życia jest metodyczne i realistyczne. Pod wpływem stresu Koziorożec może stać się sztywny, pesymistyczny i nadmiernie kontrolujący, zapominając o radości życia. Jego podstawowym darem jest zdolność do budowania trwałych fundamentów, osiągania ambitnych celów i bycia niezawodnym liderem.",
    strengths: [
      "Dyscyplina i ambicja",
      "Odpowiedzialność i niezawodność",
      "Praktyczność i realizm",
      "Wytrwałość i cierpliwość",
    ],
    challenges: [
      "Pesymizm i sztywność",
      "Nadmierna kontrola i autorytaryzm",
      "Workoholizm i brak równowagi",
      "Trudności w okazywaniu emocji",
    ],
    love: "W miłości Koziorożec jest lojalny, oddany i bardzo poważnie traktuje związki. Szuka partnera, który będzie stabilny, odpowiedzialny i doceni jego ambicje. Potrzebuje poczucia bezpieczeństwa i zaufania. Koziorożec wyraża miłość poprzez czyny, zapewnianie stabilności i wspieranie partnera w jego celach. Może być nieco powściągliwy w okazywaniu uczuć, ale jego oddanie jest głębokie i trwałe. Najlepsze dopasowanie znajdzie ze znakami ziemskimi (Byk, Panna) lub wodnymi (Rak, Skorpion, Ryby), które cenią stabilność, odpowiedzialność i głębię emocjonalną.",
    career:
      "Koziorożec doskonale sprawdza się w zawodach wymagających dyscypliny, strategii i długoterminowego planowania. Ceni sobie status, uznanie i możliwość wspinania się po szczeblach kariery. Idealne środowiska pracy to te, które oferują strukturę, jasne cele i możliwość awansu. Może być świetnym menedżerem, dyrektorem, politykiem, architektem, inżynierem czy finansistą. Jego styl pracy jest metodyczny, zorganizowany i skoncentrowany na osiąganiu konkretnych wyników. Potrzebuje projektów, które pozwalają mu wykorzystać jego ambicje i zdolności przywódcze.",
  },
  aquarius: {
    tagline: "Wiem, więc innowuję – z wizją i niezależnością zmieniam świat.",
    core: "Wodnik to wizjoner zodiaku, ucieleśnienie innowacji, niezależności i humanitaryzmu. Rządzony przez Urana (i Saturna), symbolizuje przyszłość, oryginalność, rewolucję i dążenie do wolności. Osoby urodzone pod tym znakiem są niezwykle inteligentne, oryginalne i postępowe, z wrodzoną potrzebą zmieniania świata na lepsze. Cenią sobie wolność, niezależność i równość. Ich umysł jest futurystyczny i analityczny, zawsze poszukujący nowych rozwiązań. Pod wpływem stresu Wodnik może stać się ekscentryczny, zdystansowany i nieprzewidywalny, odrzucając konwencje. Jego podstawowym darem jest zdolność do myślenia poza schematami, innowacji i inspirowania do zmian społecznych.",
    strengths: [
      "Intelekt i oryginalność",
      "Niezależność i wolność",
      "Humanitaryzm i wizjonerstwo",
      "Obiektywizm i otwartość na nowe",
    ],
    challenges: [
      "Ekscentryczność i dystans emocjonalny",
      "Nieprzewidywalność i buntowniczość",
      "Idealizm oderwany od rzeczywistości",
      "Trudności w wyrażaniu uczuć",
    ],
    love: "W miłości Wodnik szuka partnera, który będzie jego przyjacielem, stymulował go intelektualnie i szanował jego niezależność. Jest otwarty, tolerancyjny i ceni sobie wolność w związku. Potrzebuje partnera, który podziela jego wizje i nie będzie próbował go ograniczać. Wodnik wyraża miłość poprzez wspólne zainteresowania, intelektualne rozmowy i wspieranie partnera w jego pasjach. Może być nieco zdystansowany emocjonalnie, ale jego lojalność jest głęboka. Najlepsze dopasowanie znajdzie ze znakami powietrznymi (Bliźnięta, Waga) lub ognistymi (Baran, Lew, Strzelec), które cenią intelekt, niezależność i dynamikę.",
    career:
      "Wodnik doskonale sprawdza się w zawodach wymagających innowacji, myślenia poza schematami i pracy na rzecz społeczeństwa. Ceni sobie wolność, niezależność i możliwość wprowadzania zmian. Idealne środowiska pracy to te, które oferują autonomię, wyzwania intelektualne i możliwość pracy w zespole nad wspólnym celem. Może być świetnym naukowcem, wynalazcą, programistą, aktywistą społecznym, futurystą czy badaczem. Jego styl pracy jest oryginalny, analityczny i skoncentrowany na przyszłości. Potrzebuje projektów, które pozwalają mu wykorzystać jego wizjonerski umysł i chęć zmieniania świata.",
  },
  pisces: {
    tagline:
      "Wierzę, więc współodczuwam – z empatią i intuicją łączę się z uniwersum.",
    core: "Ryby to marzyciel zodiaku, ucieleśnienie empatii, intuicji i duchowości. Rządzone przez Neptuna (i Jowisza), symbolizują współczucie, wyobraźnię, ucieczkę od rzeczywistości i głębokie połączenie z uniwersum. Osoby urodzone pod tym znakiem są niezwykle wrażliwe, empatyczne i artystyczne, z wrodzoną potrzebą pomagania innym i poszukiwania duchowego sensu. Ich intuicja jest niezwykle rozwinięta, co pozwala im wyczuwać subtelne energie i nastroje. Pod wpływem stresu Ryby mogą stać się uciekające od rzeczywistości, chaotyczne i skłonne do poświęcania się, gubiąc się w emocjach innych. Ich podstawowym darem jest zdolność do głębokiej empatii, współczucia i inspirowania innych do duchowego rozwoju.",
    strengths: [
      "Empatia i współczucie",
      "Intuicja i wrażliwość",
      "Kreatywność i wyobraźnia",
      "Duchowość i bezinteresowność",
    ],
    challenges: [
      "Ucieczka od rzeczywistości i iluzje",
      "Chaotyczność i brak granic",
      "Skłonność do poświęcania się",
      "Nadmierna wrażliwość i podatność na wpływy",
    ],
    love: "W miłości Ryby szukają głębokiego, duchowego połączenia i bezwarunkowej miłości. Są romantyczne, czułe i niezwykle oddane. Potrzebują partnera, który będzie je rozumiał, wspierał emocjonalnie i cenił ich wrażliwość. Ryby wyrażają miłość poprzez empatię, współczucie i bezinteresowną troskę. Mogą być nieco idealistyczne i skłonne do poświęceń, ale ich miłość jest głęboka i transformująca. Najlepsze dopasowanie znajdzie ze znakami wodnymi (Rak, Skorpion) lub ziemskimi (Byk, Panna, Koziorożec), które cenią głębię emocjonalną, stabilność i bezpieczeństwo.",
    career:
      "Ryby doskonale sprawdzają się w zawodach wymagających empatii, kreatywności i intuicji. Cenią sobie możliwość pomagania innym i pracy w harmonijnym środowisku. Idealne środowiska pracy to te, które oferują wsparcie, swobodę twórczą i możliwość wyrażania siebie. Może być świetnym artystą, muzykiem, pisarzem, terapeutą, pracownikiem socjalnym, pielęgniarzem czy duchownym. Ich styl pracy jest intuicyjny, kreatywny i skoncentrowany na ludziach. Potrzebują projektów, które pozwalają im wykorzystać ich empatię i wyobraźnię.",
  },
};

export const ZODIAC_HUB_PL = {
  title: "Znaki Zodiaku – Daty, Cechy, Żywioły i Horoskop",
  description:
    "Poznaj wszystkie 12 znaków zodiaku: ich daty, żywioły, cechy charakteru, miłość i dopasowanie partnerskie. Oblicz swój pełny kosmogram urodzeniowy w Vivida.",
  faq: [
    {
      q: "Jakie jest 12 znaków zodiaku?",
      a: "12 znaków zodiaku to Baran, Byk, Bliźnięta, Rak, Lew, Panna, Waga, Skorpion, Strzelec, Koziorożec, Wodnik i Ryby. Każdy z nich odpowiada za około 30 stopni ekliptyki i symbolizuje unikalny zestaw cech psychologicznych i energetycznych.",
    },
    {
      q: "Czy mój znak zodiaku to to samo co znak słoneczny?",
      a: "Tak, potocznie mówiąc 'mój znak zodiaku' mamy na myśli nasz znak słoneczny. Jest to znak, w którym znajdowało się Słońce w momencie naszych narodzin. Słońce symbolizuje nasze ego, podstawową tożsamość i życiową energię, dlatego jest tak kluczowe w astrologii.",
    },
    {
      q: "Dlaczego daty znaków zodiaku mogą różnić się o jeden dzień?",
      a: "Daty znaków zodiaku są przybliżone i mogą różnić się o jeden dzień w zależności od roku i dokładnej godziny urodzenia. Wynika to z faktu, że Słońce zmienia znak zodiaku w różnym czasie każdego roku. Aby precyzyjnie określić swój znak słoneczny, zawsze zaleca się obliczenie pełnego kosmogramu urodzeniowego.",
    },
    {
      q: "Czym są żywioły i jakości (modalności) w astrologii?",
      a: "W astrologii znaki zodiaku są grupowane według czterech żywiołów (Ogień, Ziemia, Powietrze, Woda), które opisują podstawową energię i temperament, oraz trzech jakości (Kardynalna, Stała, Zmienna), które określają sposób działania i inicjowania zmian. Żywioły to: Ogień (Baran, Lew, Strzelec), Ziemia (Byk, Panna, Koziorożec), Powietrze (Bliźnięta, Waga, Wodnik), Woda (Rak, Skorpion, Ryby). Jakości to: Kardynalna (Baran, Rak, Waga, Koziorożec), Stała (Byk, Lew, Skorpion, Wodnik), Zmienna (Bliźnięta, Panna, Strzelec, Ryby).",
    },
  ],
};
