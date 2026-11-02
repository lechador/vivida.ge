export type DreamVariantPl = {
  when: string;
  means: string;
};

export type DreamSymbolPl = {
  slug: string;
  title: string;
  glyph: string;
  summary: string;
  meaning: string;
  variants: DreamVariantPl[];
  positive: string;
  caution: string;
  related: string[];
};

export const DREAM_SYMBOLS_PL: DreamSymbolPl[] = [
  {
    slug: "gveli",
    title: "Wąż",
    glyph: "🐍",
    summary:
      "Wąż to jeden z najpotężniejszych symboli w snach, reprezentujący zarówno ukryte niebezpieczeństwo, jak i głęboką osobistą transformację.",
    meaning:
      "Tradycyjnie, sen o wężu wskazuje na ukryte zagrożenie lub kogoś w Twoim otoczeniu, kto nie jest do końca szczery. Jednak wąż regularnie zrzuca skórę, co czyni go ponadczasowym symbolem odnowy, rewitalizacji i porzucania wyczerpanych etapów życia. Które znaczenie ma zastosowanie, zależy od tego, jak czułeś się we śnie: przerażenie czy spokojny spokój.",
    variants: [
      {
        when: "Wąż atakuje lub gryzie Cię",
        means:
          "Otwarty konflikt lub uraza, którą zbyt długo tłumiłeś. Miejsce ukąszenia ma znaczenie: ręce odnoszą się do pracy i działania, stopy do Twojej ścieżki życiowej, a klatka piersiowa do relacji emocjonalnych.",
      },
      {
        when: "Czarny wąż",
        means:
          "Nieuznany strach lub temat, którego unikasz. Często odzwierciedla to aspekt Ciebie samego, a nie zewnętrznego przeciwnika.",
      },
      {
        when: "Biały wąż",
        means:
          "Głęboko życzliwy znak, intuicja ostrzegająca Cię z wyprzedzeniem lub cenna mądrość, która wkrótce do Ciebie dotrze.",
      },
      {
        when: "Wiele węży zgrupowanych razem",
        means:
          "Środowisko, w którym czujesz się emocjonalnie bezbronny, miejsce pracy lub krąg społeczny, gdzie zaufanie jest kruche.",
      },
      {
        when: "Zabijanie lub odpędzanie węża",
        means:
          "Doskonały omen: posiadasz wewnętrzną gotowość, aby bezpośrednio stawić czoła trudnemu problemowi bez dalszego odkładania.",
      },
    ],
    positive:
      "Jeśli nie czułeś strachu we śnie, wąż oznacza odnowę, stary rozdział się kończy, aby zrobić miejsce na świeżą witalność.",
    caution:
      "Jeśli po przebudzeniu utrzymuje się niepokój, zastanów się, kto w Twoim otoczeniu wymaga od Ciebie ostrożności i ważenia każdego słowa.",
    related: ["sisxli", "tagvi", "wyali"],
  },
  {
    slug: "wyali",
    title: "Woda",
    glyph: "💧",
    summary:
      "Woda we śnie odzwierciedla Twój stan emocjonalny, a jej klarowność ujawnia więcej niż cokolwiek innego.",
    meaning:
      "W języku snów woda jest substancją emocji. Krystalicznie czysta woda odzwierciedla spokój umysłu, jasność emocjonalną i równowagę; mętna lub ciemna woda sygnalizuje burzliwe uczucia, których jeszcze nie rozwikłałeś. Równie ważne jest, czy woda jest stojąca, czy płynąca: stojąca woda wskazuje na stagnację, podczas gdy płynąca rzeka oznacza aktywną zmianę życiową.",
    variants: [
      {
        when: "Pływanie w czystej, przezroczystej wodzie",
        means:
          "Wewnętrzna harmonia, emocjonalne uzdrowienie i jasne poczucie, że jesteś we właściwym miejscu o właściwym czasie.",
      },
      {
        when: "Błotnista, brudna lub mętna woda",
        means:
          "Emocjonalne zamieszanie, niewypowiedziane lęki lub nadchodząca sytuacja, w której motywy są niejasne i wymagana jest ostrożność.",
      },
      {
        when: "Tonąć lub zapadać się",
        means:
          "Poczucie przytłoczenia okolicznościami, obowiązkami, emocjami lub środowiskiem, w którym trudno Ci złapać oddech.",
      },
      {
        when: "Picie zimnej, świeżej wody",
        means:
          "Odnowa witalności, zaspokojenie głębokiego pragnienia emocjonalnego oraz dobre zdrowie fizyczne i psychiczne.",
      },
      {
        when: "Powódź lub nagły wysoki poziom wody",
        means:
          "Tłumione emocje przebijające się przez Twoje obrony lub nagłe wydarzenia zewnętrzne wymagające całej Twojej uwagi.",
      },
    ],
    positive:
      "Czysta, spokojna woda obiecuje emocjonalną rewitalizację i spokój umysłu w Twoich osobistych relacjach.",
    caution:
      "Mętna woda lub poczucie tonięcia prosi Cię, abyś zwolnił, zmniejszył presję zewnętrzną i rozwikłał nagromadzony stres.",
    related: ["zgva", "wvima", "tevzi"],
  },
  {
    slug: "kbili",
    title: "Wypadające zęby",
    glyph: "🦷",
    summary:
      "Zęby we snach symbolizują osobistą witalność, wpływ, kontrolę i strach przed nagłą utratą.",
    meaning:
      "Utrata zęba to jeden z najbardziej uniwersalnych snów w różnych kulturach. Psychologicznie, zęby reprezentują moc, asertywność i to, jak pewnie czujesz się w swojej skórze. Kiedy zęby kruszą się lub wypadają, rzadko odnosi się to do zdrowia fizycznego, zazwyczaj odzwierciedla strach przed utratą kontroli, starzeniem się lub nagłą utratą pewności siebie.",
    variants: [
      {
        when: "Ząb wypada bezboleśnie, bez krwi",
        means:
          "Porzucenie przestarzałego przekonania lub zakończenie drobnego zobowiązania, które naturalnie dobiegło końca.",
      },
      {
        when: "Ząb wypada z intensywnym bólem i krwią",
        means:
          "Bolesne rozstanie lub konflikt z bliskim członkiem rodziny lub kimś głęboko związanym z Twoim sercem.",
      },
      {
        when: "Zęby kruszące się w proch",
        means:
          "Poczucie bezsilności lub utraty wpływu Twoich słów; sygnał do odbudowy poczucia własnej wartości od wewnątrz.",
      },
      {
        when: "Wypluwanie połamanych zębów",
        means:
          "Słowa wypowiedziane w gniewie, których chciałbyś cofnąć, lub desperacka potrzeba wyjaśnienia sytuacji.",
      },
      {
        when: "Rosnące nowe, zdrowe zęby",
        means:
          "Wspaniały omen: odnowiona witalność, rosnąca pewność siebie i wkroczenie w silniejszy rozdział życia.",
      },
    ],
    positive:
      "Rosnące lub czyszczone zęby wskazują na odnowioną pewność siebie, jaśniejszą komunikację i odzyskanie asertywności.",
    caution:
      "Powtarzające się sny o utracie zębów silnie wskazują, że czujesz się bezsilny lub wrażliwy w kluczowej relacji na jawie.",
    related: ["sisxli", "sarke", "sikvdili"],
  },
  {
    slug: "micvalebuli",
    title: "Zmarła bliska osoba",
    glyph: "🕯️",
    summary:
      "Sen o zmarłych jest często podświadomą podpowiedzią, aby posłuchać rady lub rozwiązać niedokończone więzi emocjonalne.",
    meaning:
      "Kiedy ktoś, kto odszedł, odwiedza Twój sen, jest to często spotkanie z Twoimi najgłębszymi wspomnieniami i sumieniem. W folklorze przybywają, aby ostrzec lub przynieść spokój; w kategoriach psychologicznych, Twoja podświadomość wykorzystuje ich znajomą obecność, aby przekazać mądrość, której wahasz się uznać na jawie.",
    variants: [
      {
        when: "Zmarły uśmiecha się i jest spokojny",
        means:
          "Upewnienie, że jesteś na właściwej drodze; wewnętrzne przebaczenie i emocjonalne uzdrowienie z przeszłego żalu.",
      },
      {
        when: "Zmarły jest cichy, smutny lub płacze",
        means:
          "Nierozwiązane poczucie winy, zaniedbane obietnice lub wybór życiowy, który, jak czujesz, jest sprzeczny z Twoją głębszą integralnością.",
      },
      {
        when: "Zmarły mówi lub oferuje wyraźną radę",
        means:
          "Zwróć szczególną uwagę na ich dokładne słowa, Twoja podświadomość przekazuje Ci ważne uświadomienie.",
      },
      {
        when: "Zmarły obejmuje lub całuje Cię",
        means:
          "Głębokie pocieszenie w samotnej godzinie lub błogosławieństwo dla ważnej decyzji życiowej, którą przygotowujesz się podjąć.",
      },
      {
        when: "Zmarły wzywa Cię, abyś za nim poszedł",
        means:
          "Klasyczny motyw ostrzegawczy: wezwanie do dbania o zdrowie, unikania lekkomyślnych ryzyk i ugruntowania się w teraźniejszości.",
      },
    ],
    positive:
      "Spokojne spotkanie przynosi zamknięcie, błogosławieństwo i pokojową integrację wspomnień, które kiedyś powodowały smutek.",
    caution:
      "Niespokojna wizyta prosi Cię, abyś naprawił swoją przeszłość, wypełnił zapomniane zobowiązania i traktował siebie z większą troską.",
    related: ["sikvdili", "eklesia", "tirili"],
  },
  {
    slug: "orsuloba",
    title: "Ciąża",
    glyph: "🤰",
    summary:
      "Ciąża we snach zwiastuje inkubację nowego pomysłu, przedsięwzięcia, projektu twórczego lub wewnętrznej ewolucji.",
    meaning:
      "Sen o ciąży rzadko przewiduje dosłowne narodziny; jest to prawie zawsze archetyp twórczej gestacji. Nosisz w sobie coś – koncepcję, plan biznesowy lub transformację emocjonalną – co wymaga czasu, ochrony i pielęgnacji, zanim będzie gotowe na świat.",
    variants: [
      {
        when: "Jesteś w ciąży i czujesz radość",
        means:
          "Cenione przedsięwzięcie twórcze lub ambicja dojrzewa stabilnie i wkrótce przyniesie namacalne nagrody.",
      },
      {
        when: "Jesteś w ciąży i ogarnia Cię niepokój",
        means:
          "Strach przed nadchodzącą odpowiedzialnością, poczucie nieprzygotowania do awansu lub obawa przed nadchodzącymi zmianami życiowymi.",
      },
      {
        when: "Widzisz przyjaciółkę lub krewną w ciąży",
        means:
          "Ta osoba wchodzi w transformacyjną fazę życia, lub Twoja więź z nią ma ulec ewolucji.",
      },
      {
        when: "Pomyślne urodzenie dziecka",
        means:
          "Triumfalna realizacja długoterminowego celu; fizyczne urzeczywistnienie miesięcy ciężkiej pracy.",
      },
      {
        when: "Mężczyzna śniący o ciąży",
        means:
          "Żyzny grunt dla śmiałych planów biznesowych, oryginalnych innowacji lub podjęcia znaczącego przywództwa.",
      },
    ],
    positive:
      "Harmonijny sen o ciąży potwierdza, że Twoje ukryte wysiłki i twórcze ziarna rozwijają się pomyślnie.",
    caution:
      "Panika związana z ciążą odzwierciedla wahanie w podjęciu obowiązków, które naturalnie towarzyszą Twojemu rozwojowi.",
    related: ["bavshvi", "qorwili", "bechedi"],
  },
  {
    slug: "bavshvi",
    title: "Dziecko",
    glyph: "👶",
    summary:
      "Dziecko we śnie odzwierciedla niewinność, wrażliwość, surowy potencjał i delikatne początki Twoich przedsięwzięć.",
    meaning:
      "Dzieci we snach reprezentują Twoje wewnętrzne dziecko, czystą kreatywność i nowe inicjatywy w ich najbardziej delikatnym stadium. Zdrowe, uśmiechnięte niemowlę wskazuje na radosne początki i autentyczną ekspresję siebie; płaczące lub chore dziecko ostrzega Cię przed zaniedbanymi potrzebami, wrażliwymi projektami lub niezagojonymi wrażliwościami emocjonalnymi.",
    variants: [
      {
        when: "Trzymanie uśmiechniętego, zadowolonego dziecka",
        means:
          "Ciepło, wzajemne uczucie, spokojne życie rodzinne i świeży entuzjazm do codziennych zajęć.",
      },
      {
        when: "Płaczące lub zaniepokojone niemowlę",
        means:
          "Kruchy projekt lub związek woła o uwagę; możesz ignorować własne emocjonalne wyczerpanie.",
      },
      {
        when: "Znalezienie porzuconego dziecka",
        means:
          "Ponowne odkrycie zaniedbanego osobistego talentu, zapomnianego marzenia lub uśpionej pasji czekającej na pielęgnację.",
      },
      {
        when: "Karmienie lub pielęgnowanie dziecka",
        means:
          "Poświęcanie czasu i energii na znaczące przedsięwzięcie, które w odpowiednim czasie hojnie Cię wynagrodzi.",
      },
      {
        when: "Utrata dziecka z oczu w tłumie",
        means:
          "Niepokój związany z utratą kontaktu z Twoją prostotą, spontanicznością lub podstawowymi wartościami w zgiełku dorosłego życia.",
      },
    ],
    positive:
      "Śmiejące się, dobrze prosperujące dziecko zwiastuje słodkie początki, twórcze wybuchy i serdeczną radość w Twoim osobistym świecie.",
    caution:
      "Chore lub zaniepokojone dziecko ostrzega, że ważne zobowiązanie jest pozbawione niezbędnego czasu i delikatnej opieki.",
    related: ["orsuloba", "saxli", "tirili"],
  },
  {
    slug: "qorwili",
    title: "Ślub",
    glyph: "👰",
    summary:
      "Ślub reprezentuje święte połączenie przeciwstawnych sił, ważne porozumienia i głębokie zmiany życiowe.",
    meaning:
      "Choć popularnie romantyzowany, ślub w tradycyjnej analizie snów dotyczy przede wszystkim zaangażowania, integracji i przejścia. Oznacza połączenie dwóch części Twojej osobowości, logiki i intuicji, ambicji i odpoczynku, lub zawarcie umowy, której warunki zmienią Twój codzienny styl życia.",
    variants: [
      {
        when: "Szczęśliwe uczestnictwo we własnym ślubie",
        means:
          "Osiągnięcie wewnętrznej harmonii, głębokie zaangażowanie w swoje cele i wkroczenie w dojrzałe zaufanie do siebie.",
      },
      {
        when: "Chaotyczny, ponury lub niechciany ślub",
        means:
          "Poczucie uwięzienia w umowie, pracy lub zobowiązaniu, gdzie zbyt tanio oddałeś swoją niezależność.",
      },
      {
        when: "Taniec na czyimś ślubie",
        means:
          "Radosne spotkania towarzyskie, poszerzanie kręgu prawdziwych sojuszników i dzielenie się sukcesem innych.",
      },
      {
        when: "Noszenie podartej lub poplamionej sukni ślubnej",
        means:
          "Wątpliwości dotyczące nadchodzącego partnerstwa, umowy lub ważnego publicznego wyboru; strach przed osądem.",
      },
      {
        when: "Ślub bez pana młodego lub panny młodej",
        means:
          "Poczucie, że partnerstwo jest jednostronne; branie na siebie pełnej odpowiedzialności, podczas gdy druga strona pozostaje nieobecna.",
      },
    ],
    positive:
      "Świetlisty sen o ślubie celebruje wewnętrzne zgranie, harmonijną współpracę i wzajemną lojalność.",
    caution:
      "Napięta lub smutna ceremonia nakłania Cię do ponownego sprawdzenia zobowiązań, zanim zwiążesz się prawnie lub emocjonalnie.",
    related: ["bechedi", "orsuloba", "eklesia"],
  },
  {
    slug: "sisxli",
    title: "Krew",
    glyph: "🩸",
    summary:
      "Krew to surowa esencja siły życiowej, intensywności emocjonalnej, więzi rodzinnych i głęboko zakorzenionej wrażliwości.",
    meaning:
      "Sen o krwi jest zawsze intensywny, ponieważ krew to życiodajny płyn, który utrzymuje nas przy życiu. We snach symbolizuje Twoje rezerwy energii, pasję, rodowód przodków i psychologiczny koszt trwających zmagań. Płynąca krew może oznaczać utratę witalnej siły z powodu stresu, lub odwrotnie, ogniste przebudzenie głębokiej pasji.",
    variants: [
      {
        when: "Krwawienie z rany",
        means:
          "Utrata energii, emocjonalny ból z bliskiego związku lub nadmierne wyczerpanie do granic możliwości.",
      },
      {
        when: "Krew na rękach",
        means:
          "Poczucie winy, wyrzuty sumienia lub poczucie bezpośredniej odpowiedzialności za niekomfortową sytuację z udziałem osób, na których Ci zależy.",
      },
      {
        when: "Picie lub dotykanie krwi bez strachu",
        means:
          "Potężny przypływ odwagi, determinacja do pokonania przeciwności i wykorzystanie głębokiej, instynktownej odporności.",
      },
      {
        when: "Krwawienie z nosa",
        means:
          "Przeciążenie umysłowe, intensywny stres w pracy lub duże obciążenie poznawcze, które wymaga natychmiastowego, spokojnego odprężenia.",
      },
      {
        when: "Widzenie krwi na kimś innym",
        means:
          "Empatia dla ukrytego bólu bliskiej osoby lub świadomość narastającego napięcia w Twoim bliskim kręgu rodzinnym.",
      },
    ],
    positive:
      "Czysta, żywa krew bez grozy symbolizuje silne pasje, witalność przodków i zaciekłą determinację.",
    caution:
      "Nieopanowane krwawienie to pilne przypomnienie, że Twój codzienny harmonogram wyczerpuje Twoje życiowe rezerwy emocjonalne.",
    related: ["kbili", "gveli", "sikvdili"],
  },
  {
    slug: "tevzi",
    title: "Ryba",
    glyph: "🐟",
    summary:
      "Ryby symbolizują głęboką podświadomą intuicję, bogactwo emocjonalne, płodność i nieoczekiwane dary duchowe.",
    meaning:
      "Pływające w głębinach wody ryby są naturalnymi posłańcami nieświadomego umysłu. W wielu tradycjach łowienie ryb oznacza zyski materialne, ciążę lub wydobycie ukrytego pomysłu na powierzchnię świadomości. Żywe ryby reprezentują witalność i płynące możliwości; martwe ryby ostrzegają przed przegapionymi szansami.",
    variants: [
      {
        when: "Łowienie żywych ryb gołymi rękami",
        means:
          "Wykorzystanie złotej okazji dzięki czystemu instynktowi; nieoczekiwany triumf finansowy lub osobisty.",
      },
      {
        when: "Ryby pływające w czystej, nasłonecznionej wodzie",
        means:
          "Spełnienie emocjonalne, płynny rozwój planów i obfite błogosławieństwa w Twojej sferze domowej.",
      },
      {
        when: "Martwe lub gnijące ryby",
        means:
          "Rozczarowanie, zmarnowany wysiłek na bezcelowy projekt lub pozwolenie, by cenna szansa wymknęła się z rąk z powodu bezczynności.",
      },
      {
        when: "Jedzenie pysznie przygotowanej ryby",
        means:
          "Wchłanianie mądrości, zaspokajanie duchowego i intelektualnego głodu oraz cieszenie się owocami pracy.",
      },
      {
        when: "Akwarium pełne kolorowych ryb",
        means:
          "Bogate życie wewnętrzne, choć możesz obserwować możliwości zza szyby, zamiast w nie nurkować.",
      },
    ],
    positive:
      "Łowienie lub obserwowanie żywych ryb zwiastuje obfitość emocjonalną, płodność i nagrody finansowe.",
    caution:
      "Martwe ryby sygnalizują, że przedsięwzięcie straciło swój blask, a dalsze inwestowanie w nie przyniesie tylko frustrację.",
    related: ["wyali", "zgva", "fuli"],
  },
  {
    slug: "fuli",
    title: "Pieniądze",
    glyph: "💵",
    summary:
      "Pieniądze we snach odzwierciedlają Twoje postrzegane poczucie własnej wartości, wymianę energii, wpływ i bezpieczeństwo.",
    meaning:
      "Sen o walucie rzadko dotyczy dosłownych banknotów; symbolizuje on, jak bardzo cenisz swój czas, umiejętności i wkład emocjonalny. Znalezienie pieniędzy wskazuje na odkrycie w sobie nierozpoznanej wartości; utrata pieniędzy odzwierciedla strach przed wyczerpaniem zasobów lub niedocenianiem przez innych.",
    variants: [
      {
        when: "Znalezienie dużych stosów gotówki",
        means:
          "Odblokowanie uśpionego potencjału, rosnąca pewność siebie i otrzymanie zasłużonego uznania dla Twoich talentów.",
      },
      {
        when: "Utrata portfela lub pieniędzy",
        means:
          "Poczucie wyczerpania, wykorzystania lub niepewności co do Twojej niezależności finansowej i stabilności.",
      },
      {
        when: "Oddawanie pieniędzy lub pomaganie komuś",
        means:
          "Wielkoduszność, otwarta cyrkulacja energii i pewność, że posiadasz wystarczająco, by swobodnie się dzielić.",
      },
      {
        when: "Ostrożne liczenie banknotów papierowych",
        means:
          "Ocena obecnych priorytetów, budżetowanie energii i przygotowanie solidnych podstaw dla przyszłych celów.",
      },
      {
        when: "Otrzymywanie fałszywych lub podartych pieniędzy",
        means:
          "Spotkanie z zwodniczymi obietnicami, pochlebnymi słowami pozbawionymi treści lub nieszczerymi umowami.",
      },
    ],
    positive:
      "Znalezienie lub zarobienie czystej waluty reprezentuje rosnącą pewność siebie, obfitą energię i zasłużoną nagrodę.",
    caution:
      "Utrata pieniędzy lub otrzymywanie fałszywych banknotów ostrzega przed naiwnym zaufaniem w transakcjach finansowych i pochlebstwach.",
    related: ["oqro", "bechedi", "kbili"],
  },
  {
    slug: "oqro",
    title: "Złoto",
    glyph: "🪙",
    summary:
      "Złoto reprezentuje najwyższą wartość, trwałą integralność, duchową mądrość i promieniujący sukces.",
    meaning:
      "Złoto nie matowieje ani nie rdzewieje, dlatego w podświadomości symbolizuje niezachwianą prawdę, ponadczasową mądrość i najwyższą wartość. Sen o złocie oznacza połączenie z najbardziej wyrafinowanymi aspektami Twojego charakteru, osiągnięcie mistrzostwa w zawodzie lub rozpoznanie bezcennej wartości prawdziwej lojalności.",
    variants: [
      {
        when: "Znalezienie złotej biżuterii lub złotych monet",
        means:
          "Zyskanie głębokich wglądów, osiągnięcie prestiżowego statusu i zdobycie honorów, które przetrwają próbę czasu.",
      },
      {
        when: "Otrzymanie złota w prezencie",
        means:
          "Otrzymanie bezwarunkowego zaufania, cennego mentoringu lub wysokiego honoru od kogoś, kogo głęboko szanujesz.",
      },
      {
        when: "Utrata cennego złotego przedmiotu",
        means:
          "Żal z powodu kompromitacji swoich najwyższych standardów lub zaniedbania cennego związku z powodu niedbalstwa.",
      },
      {
        when: "Trzymanie ciężkich sztabek złota",
        means:
          "Wielka odpowiedzialność połączona z ogromną mocą; posiadasz klucze do transformacyjnego przedsięwzięcia.",
      },
      {
        when: "Złoto zamieniające się w pył lub tani metal",
        means:
          "Rozczarowanie powierzchownym blaskiem; odkrycie, że to, co ubóstwiałeś, nie miało prawdziwej substancji.",
      },
    ],
    positive:
      "Odkrycie lub noszenie czystego złota wskazuje, że Twoja integralność i niestrudzone poświęcenie zdobędą trwały szacunek.",
    caution:
      "Gromadzenie złota lub widzenie, jak znika, przypomina, że prawdziwa wartość tkwi w charakterze, a nie w ostentacji.",
    related: ["fuli", "bechedi", "sarke"],
  },
  {
    slug: "cecxli",
    title: "Ogień",
    glyph: "🔥",
    summary:
      "Ogień ucieleśnia pasję, oczyszczającą destrukcję, iskrę twórczości i intensywność surowych emocji.",
    meaning:
      "Ogień to dwoisty archetyp: kontrolowany, ogrzewa domowe ognisko, rozświetla ciemność i hartuje stal; niekontrolowany, pochłania wszystko na swojej drodze. Przyjemny ogień w kominku sygnalizuje domowy komfort, inspirację i witalność; szalejący pożar ostrzega przed niszczycielskim gniewem, wypaleniem lub emocjonalnymi eksplozjami.",
    variants: [
      {
        when: "Przytulny, ciepły kominek lub ognisko",
        means:
          "Spokój ducha, ciepła atmosfera rodzinna, twórcza inspiracja i lojalne towarzystwo.",
      },
      {
        when: "Twój dom lub pokój płonie",
        means:
          "Intensywny kryzys emocjonalny, przytłaczający stres lub gruntowna transformacja, która niszczy przestarzałe nawyki.",
      },
      {
        when: "Gaszenie niebezpiecznego pożaru",
        means:
          "Opanowanie temperamentu, zapobieganie katastrofalnej konfrontacji i przywracanie porządku w niestabilnej sytuacji.",
      },
      {
        when: "Przechodzenie przez ogień bez szwanku",
        means:
          "Niezwykła odporność; przejście przez ciężką próbę i wyjście z niej silniejszym, mądrzejszym i oczyszczonym.",
      },
      {
        when: "Poparzenie gorącymi węglami",
        means:
          "Cierpienie z powodu konsekwencji impulsywnych słów, lekkomyślnej niecierpliwości lub igrania z niebezpiecznymi dynamikami.",
      },
    ],
    positive:
      "Ciepły, jasny płomień przynosi inspirację, namiętną miłość i twórcze przełomy w Twoich przedsięwzięciach.",
    caution:
      "Szalejące piekło ostrzega, że niekontrolowany gniew lub przepracowanie zniszczą Twoje samopoczucie, jeśli nie zostaną szybko ugaszone.",
    related: ["saxli", "sisxli", "wyali"],
  },
  {
    slug: "saxli",
    title: "Dom",
    glyph: "🏠",
    summary:
      "Dom reprezentuje całą Twoją psychikę, każde pomieszczenie odzwierciedla inną fasadę Twojej osobowości i pamięci.",
    meaning:
      "W psychologicznej pracy ze snami, dom jest klasycznym portretem jaźni: strych mieści intelekt i wspomnienia, piwnica instynkty i ukryte lęki, salon to Twoja persona społeczna, a sypialnia to prywatna intymność. Stan, rozmiar i atmosfera domu odzwierciedlają Twoją wewnętrzną architekturę.",
    variants: [
      {
        when: "Odkrywanie tajnych, przestronnych nowych pomieszczeń",
        means:
          "Odkrywanie ukrytych talentów, poszerzonej świadomości i ekscytujących osobistych zdolności, o których istnieniu nie wiedziałeś.",
      },
      {
        when: "Stary, zniszczony lub rozpadający się dom",
        means:
          "Zaniedbane zdrowie emocjonalne, przestarzałe systemy wierzeń wymagające demontażu lub wyczerpanie starymi obciążeniami.",
      },
      {
        when: "Sprzątanie, remontowanie lub naprawianie domu",
        means:
          "Świadoma psychologiczna dbałość o siebie, wprowadzanie lepszych nawyków i rozwiązywanie długotrwałych osobistych dylematów.",
      },
      {
        when: "Obcy lub intruzi w Twoim domu",
        means:
          "Poczucie naruszania Twoich osobistych granic przez natrętnych ludzi, opinie lub nieproszone żądania.",
      },
      {
        when: "Budowanie nowego domu od podstaw",
        means:
          "Budowanie nowego życia, zakładanie rodziny lub rozpoczynanie trwałego przedsięwzięcia opartego na solidnych wartościach.",
      },
    ],
    positive:
      "Słoneczny, solidny, dobrze uporządkowany dom wskazuje na harmonię psychiczną, stabilność i bezpieczeństwo emocjonalne.",
    caution:
      "Zepsute ściany lub walące się sufity podkreślają pilną potrzebę psychologicznej naprawy w Twoim codziennym stylu życia.",
    related: ["kari", "kibe", "bavshvi"],
  },
  {
    slug: "kari",
    title: "Drzwi",
    glyph: "🚪",
    summary:
      "Drzwi oznaczają próg między fazami, możliwościami, tajemnicami, nowymi wyborami i granicami.",
    meaning:
      "Drzwi są uniwersalnym symbolem przejścia. Otwarte drzwi witają Cię na nieznanym terytorium i z nowymi możliwościami; zamknięte lub zaryglowane drzwi stanowią wyzwanie, strzeżoną tajemnicę lub ścieżkę, która nie jest jeszcze gotowa, abyś nią podążał. Pukanie do drzwi oznacza poszukiwanie odpowiedzi i nowych horyzontów.",
    variants: [
      {
        when: "Przechodzenie przez otwarte drzwi w jasne światło",
        means:
          "Odważne wkroczenie w nowy etap życia, wykorzystanie kluczowej okazji i pozostawienie za sobą starych ograniczeń.",
      },
      {
        when: "Znalezienie zamkniętych drzwi, których nie możesz otworzyć",
        means:
          "Napotykanie tymczasowych barier, brak niezbędnych informacji lub próba wymuszenia czegoś przedwcześnie.",
      },
      {
        when: "Patrzenie przez dziurkę od klucza lub wizjer",
        means:
          "Ciekawość dotycząca motywów innych, podejrzliwość lub ciche obserwowanie sytuacji przed podjęciem zobowiązania.",
      },
      {
        when: "Zamykanie drzwi na klucz za sobą",
        means:
          "Wyznaczanie ścisłych osobistych granic, odcinanie toksycznych więzi i ochrona wewnętrznego spokoju przed intruzami.",
      },
      {
        when: "Ktoś głośno puka do Twoich drzwi",
        means:
          "Nieoczekiwane wieści, nieprzewidziany gość lub długo ignorowany obowiązek wymagający natychmiastowej uwagi.",
      },
    ],
    positive:
      "Otwarte drzwi zapraszają Cię do obiecujących ścieżek rozwoju osobistego, twórczego i zawodowego.",
    caution:
      "Zaryglowane drzwi radzą cierpliwość: znajdź właściwy klucz poprzez mądrość, zamiast uderzać w przeszkodę.",
    related: ["saxli", "gza", "kibe"],
  },
  {
    slug: "gza",
    title: "Droga lub Ścieżka",
    glyph: "🛣️",
    summary:
      "Droga symbolizuje Twoją życiową podróż, trajektorię kariery, kierunek rozwoju i nadchodzące wybory.",
    meaning:
      "Sen o ścieżce jest bezpośrednim komentarzem do tego, jak nawigujesz swoim przeznaczeniem. Szeroka, gładka autostrada sugeruje prosty postęp i pewność siebie; kręta, kamienista ścieżka odzwierciedla trudności, które wymagają zwinności i cierpliwości; rozdroże wymusza nieuniknioną decyzję.",
    variants: [
      {
        when: "Idąc prostą, utwardzoną, oświetloną słońcem autostradą",
        means:
          "Jasność celu, pewność siebie w dążeniu do celów i płynny postęp bez zbędnych objazdów.",
      },
      {
        when: "Stanie na rozdrożu, niepewny, w którą stronę skręcić",
        means:
          "Kluczowa decyzja życiowa, gdzie odkładanie wyboru nie jest już możliwe; potrzeba zdefiniowania swoich prawdziwych priorytetów.",
      },
      {
        when: "Stroma, kamienista, pod górę ścieżka górska",
        means:
          "Wymagająca praca, która testuje Twoją wytrzymałość, ale prowadzi do znaczącego mistrzostwa i podniesionej perspektywy.",
      },
      {
        when: "Zgubienie drogi w gęstej mgle na drodze",
        means:
          "Dezorientacja, brak jasnych wskazówek lub poleganie na niekompletnych informacjach; znak, aby zatrzymać się przed pośpiesznym działaniem.",
      },
      {
        when: "Droga nagle kończy się na klifie lub ścianie",
        means:
          "Stara metoda osiągnęła swój naturalny limit; musisz przemyśleć swoją strategię i wytyczyć nową trasę.",
      },
    ],
    positive:
      "Czysta, otwarta droga potwierdza, że Twoja obecna trajektoria jest słuszna i prowadzi do satysfakcjonujących horyzontów.",
    caution:
      "Zdradliwa lub ślepa droga ostrzega, aby ponownie ocenić plany, zanim zainwestujesz dalszy czas i energię.",
    related: ["manqana", "kari", "frena"],
  },
  {
    slug: "manqana",
    title: "Samochód",
    glyph: "🚗",
    summary:
      "Samochód odzwierciedla osobistą autonomię, sposób, w jaki realizujesz swoje ambicje i kto trzyma kierownicę.",
    meaning:
      "We współczesnej symbolice pojazdy reprezentują sposób, w jaki prowadzisz swoje życie. Bycie za kierownicą pokazuje samostanowienie i kontrolę wykonawczą; bycie pasażerem sugeruje, że mogłeś oddać władzę komuś innemu. Prędkość, zdolność hamowania i stan samochodu ilustrują Twoją kontrolę w stresie.",
    variants: [
      {
        when: "Płynna i pewna jazda",
        means:
          "Jesteś w pełni odpowiedzialny za swoje decyzje, celowo kierujesz projektami i dobrze zarządzasz swoim tempem.",
      },
      {
        when: "Hamulce zawodzą lub kierownica nie reaguje",
        means:
          "Utrata kontroli w sytuacji wysokiego ciśnienia; ostrzeżenie, że życie toczy się zbyt szybko dla Twojej wytrzymałości emocjonalnej.",
      },
      {
        when: "Bycie bezradnym pasażerem z lekkomyślnym kierowcą",
        means:
          "Oddawanie swojej sprawczości dominującemu partnerowi, szefowi lub członkowi rodziny, który podejmuje złe decyzje.",
      },
      {
        when: "Wypadek samochodowy lub kolizja",
        means:
          "Zderzenie ego, sprzeczne priorytety lub nieunikniony kurs kolizyjny, który wymaga natychmiastowego rozładowania.",
      },
      {
        when: "Samochód kończy paliwo lub psuje się",
        means:
          "Poważne wypalenie fizyczne lub psychiczne; Twoja wewnętrzna bateria jest wyczerpana i domaga się regenerującego odpoczynku.",
      },
    ],
    positive:
      "Bezproblemowa jazda po otwartych drogach potwierdza, że kierujesz swoim życiem z umiejętnością i opanowaniem.",
    caution:
      "Awaria hamulców lub utrata kontroli służy jako surowe ostrzeżenie, aby zwolnić i ponownie ocenić niebezpieczne ryzyka.",
    related: ["gza", "dacema", "devna"],
  },
  {
    slug: "frena",
    title: "Latanie",
    glyph: "🦅",
    summary:
      "Latanie wyraża wyzwolenie z przyziemnych ograniczeń, podniesioną perspektywę i duchową transcendencję.",
    meaning:
      "Sny o lataniu należą do najbardziej ekscytujących ludzkich doświadczeń. Oznaczają wznoszenie się ponad drobne zmartwienia, uzyskiwanie perspektywy z lotu ptaka na złożone dylematy i dotykanie prawdziwej twórczej wolności. Bezproblemowy lot świadczy o dużej pewności siebie; trudności w utrzymaniu wysokości wskazują na dręczące wątpliwości.",
    variants: [
      {
        when: "Szybujące wysoko nad krajobrazami z łatwością i radością",
        means:
          "Duchowa wolność, szeroka wizjonerska perspektywa i wznoszenie się ponad drobne dramaty w twórcze mistrzostwo.",
      },
      {
        when: "Trudności w utrzymaniu się w powietrzu lub uderzanie w linie energetyczne",
        means:
          "Ambicje utrudniane przez praktyczne tarcia, drobne lęki lub ludzi próbujących Cię ściągnąć w dół.",
      },
      {
        when: "Latanie, aby uciec przed wrogiem poniżej",
        means:
          "Wykorzystywanie intelektu, kreatywności lub dystansu do przechytrzenia wrogiej sytuacji lub bolesnego konfliktu.",
      },
      {
        when: "Unoszenie się zaledwie kilka stóp nad ziemią",
        means:
          "Ostrożne testowanie nowych możliwości; cichy postęp bez przyciągania niepożądanej uwagi.",
      },
      {
        when: "Nagłe spadanie z nieba podczas lotu",
        means:
          "Nagłe zderzenie z rzeczywistością; nadmierna pewność siebie przebita przez przeoczone praktyczne szczegóły.",
      },
    ],
    positive:
      "Płynny, wysoki lot odzwierciedla nieskrępowaną kreatywność, emocjonalne wyzwolenie i rozwijającą się wizjonerską moc.",
    caution:
      "Strach przed wysokością lub burzliwy lot ostrzega przed arogancją i zaniedbywaniem praktycznych, ugruntowanych realiów.",
    related: ["dacema", "gza", "zgva"],
  },
  {
    slug: "dacema",
    title: "Spadanie",
    glyph: "🪂",
    summary:
      "Spadanie odzwierciedla utratę gruntu pod nogami, lęk przed porażką, niepewność i nagłe poddanie się kontroli.",
    meaning:
      "Spadanie jest instynktowną reakcją senną na niestabilność w życiu na jawie. Często występuje, gdy rzeczywistość niszczy iluzję, gdy systemy wsparcia wydają się chwiejne lub gdy obawiasz się zbliżającej się oceny. Odwrotnie, poddanie się upadkowi może symbolizować naukę odpuszczania niemożliwej kontroli.",
    variants: [
      {
        when: "Spadanie w nieskończoną ciemną otchłań z przerażeniem",
        means:
          "Intensywny lęk przed nieznanym, poczucie, że Twoja siatka bezpieczeństwa zniknęła pod obecnymi naciskami.",
      },
      {
        when: "Spadanie i miękkie lądowanie na nogach lub wodzie",
        means:
          "Odporność; przewidywany kryzys rozwiąże się znacznie płynniej, niż wyobrażały sobie Twoje najgorsze obawy.",
      },
      {
        when: "Potknięcie się i upadek przed publicznością",
        means:
          "Strach przed publicznym upokorzeniem, syndrom oszusta lub obawa przed surową oceną przez rówieśników.",
      },
      {
        when: "Spadanie z dużej wysokości (budynek lub góra)",
        means:
          "Cios w dumę zawodową lub wysokie oczekiwania; znak, aby przyjąć bardziej ugruntowane, realistyczne podejście.",
      },
      {
        when: "Obserwowanie, jak ktoś inny się przewraca i spada",
        means:
          "Troska o wrażliwego przyjaciela lub obserwowanie, jak czyjeś błędne wybory prowadzą do przewidywalnych trudności.",
      },
    ],
    positive:
      "Miękkie lądowanie dowodzi, że nawet gdy tracisz kontrolę, Twoja wrodzona zdolność adaptacji bezpiecznie Cię złapie.",
    caution:
      "Przerażające sny o spadaniu wskazują na niezarządzany stres i brak ugruntowanego wsparcia w Twojej codziennej rutynie.",
    related: ["frena", "kibe", "devna"],
  },
  {
    slug: "devna",
    title: "Bycie Ściganym",
    glyph: "🏃",
    summary:
      "Bycie ściganym wskazuje na unikanie, ucieczkę od obowiązków, emocji lub niezbędnych konfrontacji.",
    meaning:
      "Kiedy coś lub ktoś Cię ściga we śnie, prawie zawsze uciekasz przed aspektem siebie, trudną rozmową, nieuznaną prawdą, terminem lub poczuciem winy, z którym odmawiasz się zmierzyć. Prześladowca reprezentuje pilność sprawy, przed którą próbujesz uciec.",
    variants: [
      {
        when: "Bycie ściganym przez dzikiego drapieżnika (wilk, niedźwiedź)",
        means:
          "Ucieczka przed potężnymi, nieokiełznanymi instynktownymi popędami, wybuchowym gniewem lub intensywnymi pierwotnymi pasjami.",
      },
      {
        when: "Bycie ściganym przez nieznany cień lub potwora",
        means:
          "Nieokreślone, niesformułowane lęki i egzystencjalny strach, które należy zbadać w świetle dziennym.",
      },
      {
        when: "Bycie ściganym przez policję lub władze",
        means:
          "Poczucie winy z powodu złamania zasady, strach przed ujawnieniem lub zmaganie się z niełatwym kompromisem moralnym.",
      },
      {
        when: "Odwrócenie się, aby stawić czoła i wyzwać prześladowcę",
        means:
          "Ogromny przełom psychologiczny: gotowość do bezpośredniego stawienia czoła lękom i zakończenia wyczerpującego pościgu.",
      },
      {
        when: "Ukrywanie się w małym pokoju, podczas gdy prześladowca szuka",
        means:
          "Odkładanie nieuniknionej rzeczywistości; kupowanie tymczasowego czasu, podczas gdy główny dylemat pozostaje nierozwiązany.",
      },
    ],
    positive:
      "Zatrzymanie się, aby stawić czoła prześladowcy, oznacza koniec strachu i początek odważnego, proaktywnego przywództwa nad sobą.",
    caution:
      "Powtarzające się sny o pościgu krzyczą, że ucieczka przed problemem kosztuje znacznie więcej energii niż jego rozwiązanie.",
    related: ["dacema", "gveli", "sikvdili"],
  },
  {
    slug: "sikvdili",
    title: "Śmierć",
    glyph: "⏳",
    summary:
      "Śmierć we snach rzadko jest dosłowna, oznacza głębokie odrodzenie, transformację i zakończenie pewnej ery.",
    meaning:
      "Śmierć w sferze symbolicznej jest ostatecznym wyznacznikiem transformacji. Podobnie jak w tarocie, śmierć oznacza, że stara tożsamość, przestarzały styl życia lub zużyty związek odchodzą, aby mogła narodzić się odnowiona wersja Ciebie. Reprezentuje radykalne odrzucenie przeszłości.",
    variants: [
      {
        when: "Twoja własna śmierć we śnie",
        means:
          "Przechodzenie głębokiej ewolucji osobistej; pozwolenie staremu sposobowi myślenia umrzeć, aby wkroczyć w odnowiony etap życia.",
      },
      {
        when: "Śmierć żyjącego rodzica lub krewnego",
        means:
          "Zmieniająca się dynamika w Twojej relacji z nimi; uzyskiwanie niezależności lub obawa przed emocjonalnym dystansem.",
      },
      {
        when: "Śmierć wroga lub rywala",
        means:
          "Wewnętrzne rozwiązanie konfliktu; uwolnienie się od urazy i niepozwolenie, aby ich obecność Cię niepokoiła.",
      },
      {
        when: "Uczestnictwo w uroczystym pogrzebie",
        means:
          "Formalne odpuszczenie przeszłej krzywdy, pożegnanie z zakończonym projektem i poszukiwanie zamknięcia.",
      },
      {
        when: "Zmarła osoba nagle wraca do życia",
        means:
          "Nieoczekiwane ożywienie starego pomysłu, ponowne rozpalenie uśpionego połączenia lub druga szansa na sukces.",
      },
    ],
    positive:
      "Sen o śmierci zwiastuje wyzwalającą transformację, zakończenie toksycznych cykli i powitanie świeżej epoki życia.",
    caution:
      "Smutne sny o śmierci nakłaniają Cię do właściwego opłakiwania przeszłych strat, aby nie nawiedzały już Twoich przyszłych kroków.",
    related: ["micvalebuli", "gveli", "kbili"],
  },
  {
    slug: "zgva",
    title: "Morze lub Ocean",
    glyph: "🌊",
    summary:
      "Ocean reprezentuje rozległą zbiorową nieświadomość, głębokie duchowe głębie i nieskończone możliwości.",
    meaning:
      "Morze to bezkresna kolebka życia. Stanie nad morzem lub żeglowanie po nim łączy Cię z wielkimi siłami życiowymi, filozoficznymi rozważaniami i ogromną skalą Twoich ambicji. Spokojne, lazurowe morze obiecuje emocjonalny spokój; wzburzony ocean ostrzega przed szalejącymi emocjonalnymi zawirowaniami.",
    variants: [
      {
        when: "Spokojne, lśniące, skąpane w słońcu błękitne morze",
        means:
          "Głęboki wewnętrzny spokój, szerokie horyzonty twórcze i poczucie jedności z rytmem wszechświata.",
      },
      {
        when: "Gigantyczne fale sztormowe i burzliwe morze",
        means:
          "Szalejące burze emocjonalne, nieprzewidywalne wyzwania zewnętrzne i testowanie Twojej emocjonalnej kotwicy.",
      },
      {
        when: "Nurkowanie głęboko w podwodne głębiny",
        means:
          "Odkrywanie tajemnic podświadomości, odkrywanie głębokich spostrzeżeń psychologicznych i poszukiwania duchowe.",
      },
      {
        when: "Spokojny spacer wzdłuż brzegu morza",
        means:
          "Rozważanie ważnych decyzji życiowych na granicy między świadomą logiką (ląd) a głębokim uczuciem (morze).",
      },
      {
        when: "Tsunami zbliżające się do brzegu",
        means:
          "Nagłe, przytłaczające okoliczności lub stłumione fale emocjonalne zmiatające stare rutyny.",
      },
    ],
    positive:
      "Spokojne, czyste morze przynosi bezgraniczną inspirację, duchową jasność i ogromny twórczy dobrobyt.",
    caution:
      "Burzliwe morza ostrzegają przed nawigowaniem delikatnymi sprawami, gdy Twoja emocjonalna pogoda jest zmienna i wzburzona.",
    related: ["wyali", "wvima", "tevzi"],
  },
  {
    slug: "wvima",
    title: "Deszcz",
    glyph: "🌧️",
    summary:
      "Deszcz symbolizuje emocjonalne oczyszczenie, zmywanie przeszłego smutku, płodność i odnowę.",
    meaning:
      "Deszcz spadający z nieba zmiękcza twardą glebę i pozwala kiełkować nasionom. W symbolice snów deszcz reprezentuje uwolnienie nagromadzonych łez emocjonalnych, delikatne oczyszczenie żalów i błogosławieństwo płodności dla suchych przedsięwzięć. Ciepły letni deszcz przynosi radość; zimna, ulewna deszcz ze śniegiem odzwierciedla melancholię.",
    variants: [
      {
        when: "Ciepły, delikatny, orzeźwiający letni deszcz",
        means:
          "Ulgę emocjonalną, zmywanie starego zmęczenia i odżywianie nowych pędów twórczych i romantycznych.",
      },
      {
        when: "Zimna, ulewna ulewa z wiatrem",
        means:
          "Ponury nastrój, poczucie emocjonalnej izolacji lub przetrwanie trudnego sezonowego wyzwania z cierpliwością.",
      },
      {
        when: "Spacer w deszczu bez parasola i czerpanie z tego przyjemności",
        means:
          "Całkowita otwartość emocjonalna, zrzucanie sztywnych obron i witanie naturalnych uczuć bez wstydu.",
      },
      {
        when: "Słyszenie kojącego dźwięku deszczu uderzającego o okno",
        means:
          "Domowy komfort, spokojne bezpieczeństwo przed zewnętrznymi burzami i kontemplacyjna, cicha refleksja.",
      },
      {
        when: "Tęcza pojawiająca się po ulewnym deszczu",
        means:
          "Spektakularny omen nadziei, pojednania i jasnych błogosławieństw po okresie próby.",
      },
    ],
    positive:
      "Delikatny deszcz zmywa smutek i ożywia Twojego ducha płodną energią i świeżą nadzieją.",
    caution:
      "Mróz i ulewy sugerują, że potrzebujesz cieplejszego schronienia emocjonalnego i troskliwego towarzystwa podczas zimnego okresu.",
    related: ["wyali", "tovli", "zgva"],
  },
  {
    slug: "tovli",
    title: "Śnieg",
    glyph: "❄️",
    summary:
      "Śnieg symbolizuje emocjonalny spokój, czyste początki, ostudzenie namiętności i ukryte inkubowanie.",
    meaning:
      "Śnieg pokrywa ziemię czystą, białą ciszą. Zakrywa skazy i wycisza hałas, symbolizując emocjonalne ostudzenie, samotność i czystość. Śnieg może oznaczać, że gorące konflikty stygną, lub odwrotnie, że do związku wkradł się emocjonalny chłód i dystans.",
    variants: [
      {
        when: "Błyszcząca, nieskazitelnie biała pokrywa śnieżna",
        means:
          "Czysta karta, jasność umysłu, spokój i zaczynanie od nowa bez bagażu przeszłych błędów.",
      },
      {
        when: "Wyjąca zamieć lub burza śnieżna",
        means:
          "Emocjonalna dezorientacja, poczucie wykluczenia z kręgu towarzyskiego lub walka z surowym chłodem.",
      },
      {
        when: "Topniejący śnieg odsłaniający zieloną trawę",
        means:
          "Ocieplenie zamrożonych relacji, odnowa ciepła i nadejście emocjonalnej wiosny.",
      },
      {
        when: "Radosna zabawa na śniegu lub lepienie bałwana",
        means:
          "Beztroska lekkość, ponowne połączenie z niewinnymi radościami dzieciństwa i twórczy wypoczynek.",
      },
      {
        when: "Brudny, błotnisty, szary śnieg",
        means:
          "Rozczarowanie, utrzymujące się emocjonalne resztki starego rozczarowania, które straciło swoją godność.",
      },
    ],
    positive:
      "Czysty, lśniący śnieg przynosi spokój umysłu, nieskazitelne nowe początki i kojące ostudzenie temperamentów.",
    caution:
      "Gorzka zamieć ostrzega przed emocjonalnym chłodem i odsuwaniem od siebie ludzi, którym naprawdę na tobie zależy.",
    related: ["wvima", "wyali", "sarke"],
  },
  {
    slug: "tma",
    title: "Włosy",
    glyph: "💇",
    summary:
      "Włosy ucieleśniają osobistą witalność, piękno, kobiecą/męską moc i wzorce myślowe.",
    meaning:
      "Od starożytnych mitów o Samsonie po folklor, włosy są fizyczną manifestacją myśli i siły życiowej. Długie, lśniące włosy sygnalizują witalność, atrakcyjność i magnetyczną prezencję; obcinanie lub utrata włosów reprezentuje zrzucanie ciężarów, lub odwrotnie, utratę mocy i pewności siebie.",
    variants: [
      {
        when: "Długie, gęste, lśniące, zdrowe włosy",
        means:
          "Szczyt witalności fizycznej, magnetyczna charyzma, obfita energia twórcza i rosnący osobisty wpływ.",
      },
      {
        when: "Drastyczne obcinanie własnych włosów",
        means:
          "Pragnienie radykalnego nowego początku, odrzucenie starych tożsamości i zerwanie z przestarzałą fazą.",
      },
      {
        when: "Wypadające włosy w kępkach lub łysienie",
        means:
          "Głęboki strach przed utratą wpływu, witalności lub atrakcyjności; ostry stres odbijający się na samoocenie.",
      },
      {
        when: "Gładkie czesanie i zaplatanie splątanych włosów",
        means:
          "Rozplątywanie skomplikowanych myśli, przywracanie porządku w chaotycznych sprawach i znajdowanie eleganckich rozwiązań.",
      },
      {
        when: "Farbowanie włosów na niespodziewany, odważny kolor",
        means:
          "Pragnienie wyrażenia siebie, bunt przeciwko szarym oczekiwaniom i wkroczenie w centrum uwagi.",
      },
    ],
    positive:
      "Lśniące, zdrowe włosy odzwierciedlają rozkwitającą energię, dumną autoekspresję i atrakcyjną charyzmę.",
    caution:
      "Utrata włosów ostrzega przed silnym stresem i zwątpieniem w siebie, które wymagają natychmiastowego uziemienia i współczucia dla siebie.",
    related: ["kbili", "sarke", "sisxli"],
  },
  {
    slug: "sarke",
    title: "Lustro",
    glyph: "🪞",
    summary:
      "Lustro jest narzędziem autorefleksji, uczciwej samooceny, iluzji i prawdy.",
    meaning:
      "Patrzenie w lustro we śnie konfrontuje cię z tym, jak naprawdę postrzegasz siebie pod społecznymi maskami. Jasne odbicie przynosi samoakceptację i uczciwy wgląd; zniekształcone lub pęknięte lustro ostrzega przed samooszukiwaniem, rozdrobnioną tożsamością lub strachem przed zobaczeniem, kim się stałeś.",
    variants: [
      {
        when: "Patrzenie w lustro i widzenie siebie wyraźnego i promiennego",
        means:
          "Głęboka samoakceptacja, harmonia między wewnętrzną prawdą a zewnętrzną personą i niezachwiana pewność siebie.",
      },
      {
        when: "Pęknięte lub rozbijające się lustro",
        means:
          "Rozbite iluzje, bolesne zderzenie z rzeczywistością lub rozbicie fałszywej persony, która już nie działa.",
      },
      {
        when: "Widzenie obcego lub potwora w lustrze",
        means:
          "Konfrontacja ze swoim cieniem, nieuznane cechy, stłumione impulsy lub poczucie wyobcowania od siebie.",
      },
      {
        when: "Zapaprane lustro, które próbujesz wytrzeć do czysta",
        means:
          "Poszukiwanie jasności co do swojej tożsamości lub intencji; przebijanie się przez zamieszanie, aby znaleźć prawdę.",
      },
      {
        when: "Patrzenie w lustro bez żadnego odbicia",
        means:
          "Poczucie niewidzialności, nierozpoznania przez rówieśników lub odłączenia od swoich autentycznych, podstawowych pragnień.",
      },
    ],
    positive:
      "Jasne, prawdziwe odbicie oznacza głęboką samoświadomość, autentyczne życie i wewnętrzną harmonię.",
    caution:
      "Rozbite lustro prosi cię o porzucenie szkodliwych iluzji i odbudowanie swojego wizerunku na prawdziwej rzeczywistości.",
    related: ["tma", "kbili", "saxli"],
  },
  {
    slug: "kibe",
    title: "Schody lub Drabina",
    glyph: "🪜",
    summary:
      "Schody reprezentują wspinaczkę społeczną, awans zawodowy, duchowe wzniesienie lub zejście w podświadomość.",
    meaning:
      "Klatki schodowe i drabiny oznaczają ruch pionowy w życiu. Wspinaczka w górę symbolizuje ambicję, rozwój duchowy, wzrost statusu i pokonywanie przeszkód; schodzenie w dół prowadzi do prywatnej introspekcji, podświadomości lub spadku energii. Brakujące stopnie testują twoje oparcie.",
    variants: [
      {
        when: "Łatwe wchodzenie po schodach na szczyt",
        means:
          "Awans zawodowy, osiągnięcie upragnionej ambicji, rozszerzenie mistrzostwa i podniesiony status społeczny.",
      },
      {
        when: "Schodzenie po schodach do piwnicy lub ciemnego poziomu",
        means:
          "Introspekcyjne poszukiwania, odkrywanie zakopanych wspomnień lub cofnięcie się, aby naładować baterie w cichej prywatności.",
      },
      {
        when: "Schody z uszkodzonymi lub brakującymi stopniami",
        means:
          "Nieoczekiwane przeszkody w karierze; przypomnienie, aby postępować ostrożnie i pewnie stąpać.",
      },
      {
        when: "Niekończące się spiralne schody prowadzące donikąd",
        means:
          "Poczucie uwięzienia w powtarzających się pętlach; wydatkowanie ogromnej energii bez znaczącego postępu.",
      },
      {
        when: "Spadanie ze schodów",
        means:
          "Nagła utrata statusu, lekkomyślny pośpiech powodujący niepowodzenie lub przekraczanie swoich obecnych możliwości.",
      },
    ],
    positive:
      "Stałe wspinanie się w górę zwiastuje osiągnięcia zawodowe, mistrzostwo i dotarcie do wyższych sfer wpływu.",
    caution:
      "Złamane stopnie ostrzegają przed lekkomyślnymi skrótami: buduj każdy krok solidnie, zanim pójdziesz dalej.",
    related: ["dacema", "saxli", "kari"],
  },
  {
    slug: "dzagli",
    title: "Pies",
    glyph: "🐕",
    summary:
      "Pies jest archetypem lojalności, przyjaźni, instynktownej ochrony i bezwarunkowego oddania.",
    meaning:
      "Najlepszy przyjaciel człowieka we snach reprezentuje twoich zaufanych przyjaciół, lojalnych sojuszników i twoje własne wierne instynkty. Przyjazny, czuły pies odzwierciedla niezawodne wsparcie i oddane relacje; agresywny lub szczekający pies ostrzega przed zdradą, sporami między przyjaciółmi lub twoją własną niekontrolowaną agresją obronną.",
    variants: [
      {
        when: "Przyjazny pies machający ogonem i bawiący się",
        means:
          "Ciepłe, niezawodne przyjaźnie, szczera lojalność towarzyszy i poczucie emocjonalnego bezpieczeństwa.",
      },
      {
        when: "Wściekły pies szczekający i atakujący",
        means:
          "Konflikt z sojusznikiem, wyczuwanie zdrady ze strony członka wewnętrznego kręgu lub bycie atakowanym przez złośliwe plotki.",
      },
      {
        when: "Biały pies zbliżający się spokojnie",
        means:
          "Czysta, szlachetna przyjaźń wkraczająca w twoje życie, przynosząca szczerą życzliwość i niezawodne partnerstwo.",
      },
      {
        when: "Ranny, zagubiony lub głodny pies",
        means:
          "Zaniedbywanie lojalnego przyjaciela w potrzebie lub zaniedbywanie własnej instynktownej potrzeby lojalności i ciepła.",
      },
      {
        when: "Pies gryzący cię w rękę",
        means:
          "Niewdzięczność od kogoś, komu pomogłeś; twoja hojność została odpłacona wrogością lub oszustwem.",
      },
    ],
    positive:
      "Kochający, oddany pies potwierdza, że jesteś otoczony wiernymi sojusznikami, którzy wspierają cię w trudnych chwilach.",
    caution:
      "Agresywny pies ostrzega, aby zbadać swoje kręgi społeczne pod kątem zazdrości, wrogości lub złamanego zaufania.",
    related: ["kata", "cxeni", "devna"],
  },
  {
    slug: "kata",
    title: "Kot",
    glyph: "🐈",
    summary:
      "Kot symbolizuje ostrą intuicję, niezależność, tajemniczą kobiecą grację i subtelne granice.",
    meaning:
      "Koty chodzą własnymi ścieżkami. We snach ucieleśniają autonomiczną intuicję, subtelną przebiegłość, zmysłowość i stanowcze wyznaczanie granic. Elegancki, czuły kot reprezentuje intuicyjną grację i komfort; syczący lub drapiący kot ostrzega przed dwulicowością, ukrytą rywalizacją lub kimś, kto narusza twoją przestrzeń.",
    variants: [
      {
        when: "Mruczący, łagodny kot ocierający się o ciebie",
        means:
          "Komfort, intuicyjna swoboda, czerpanie przyjemności z prywatnych uciech i harmonijna domowa zmysłowość.",
      },
      {
        when: "Kot syczący, drapiący lub atakujący",
        means:
          "Spotkanie z zwodniczym pochlebstwem, subtelną kobiecą rywalizacją lub ostrymi starciami granic z niezależnymi osobowościami.",
      },
      {
        when: "Czarny kot z gracją przechodzący ci drogę",
        means:
          "Zachęta do zaufania swojej najostrzejszej mistycznej intuicji, zamiast dostosowywania się do konwencjonalnych oczekiwań.",
      },
      {
        when: "Biały lub złoty kot",
        means:
          "Subtelna ochrona duchowa, łagodna mądrość i odkrywanie spokoju poprzez cichą niezależność.",
      },
      {
        when: "Ratowanie zagubionego kociaka",
        means:
          "Ochrona delikatnego, rodzącego się talentu intuicyjnego lub okazywanie współczucia wrażliwej duszy.",
      },
    ],
    positive:
      "Spokojny kot wyostrza twój szósty zmysł, niezależną suwerenność i wyrafinowane poczucie estetyki.",
    caution:
      "Drapiący kot ostrzega przed powierzchownymi pochlebcami, którzy ukrywają ostre pazury pod gładkimi słowami.",
    related: ["dzagli", "tagvi", "gveli"],
  },
  {
    slug: "cxeni",
    title: "Koń",
    glyph: "🐎",
    summary:
      "Koń ucieleśnia majestatyczną moc, szlachetną wolność, nieokiełznaną pasję i szybki postęp.",
    meaning:
      "Koń jest starożytnym symbolem dynamicznej siły, szlachetnej szybkości i dążenia do pokonywania ogromnych odległości. Jazda na potężnym, posłusznym koniu sygnalizuje pełne panowanie nad swoimi pasjami i szybki rozwój kariery; nieokiełznany, dziki koń ostrzega przed nieokiełznanymi impulsami, które biorą górę nad rozumem.",
    variants: [
      {
        when: "Szybka jazda na wspaniałym białym koniu",
        means:
          "Wspaniały sukces, szlachetne zwycięstwo nad przeciwnościami, duchowa czystość i szybkie podniesienie statusu.",
      },
      {
        when: "Dziki czarny koń galopujący wściekle",
        means:
          "Zaciekłe, nieokiełznane pasje, buntownicza energia lub ujarzmianie potężnych pierwotnych sił dla ambitnych celów.",
      },
      {
        when: "Spadanie z wierzgającego konia",
        means:
          "Nagła utrata kontroli nad szybko rozwijającym się przedsięwzięciem; ostrzeżenie, że duma wyprzedziła przygotowanie.",
      },
      {
        when: "Skrzydlaty koń (Pegaz) wzbijający się w niebo",
        means:
          "Najwyższa inspiracja twórcza, geniusz poetycki i przekraczanie zwykłych ludzkich ograniczeń.",
      },
      {
        when: "Karmienie lub pielęgnacja łagodnego konia",
        means:
          "Dbanie o swoją siłę fizyczną, budowanie zaufania z potężnymi sojusznikami i mądre zarządzanie energią.",
      },
    ],
    positive:
      "Jazda z gracją wskazuje na szlachetne przywództwo, triumfalne przełomy i szybkie opanowanie celów.",
    caution:
      "Uciekający koń ostrzega, że nieokiełznane temperamenty lub lekkomyślny pośpiech mogą wykoleić skądinąd błyskotliwą podróż.",
    related: ["frena", "gza", "dzagli"],
  },
  {
    slug: "tagvi",
    title: "Mysz lub Szczur",
    glyph: "🐁",
    summary:
      "Myszy reprezentują małe, dręczące lęki, ukradkowe podgryzanie zasobów, drobne irytacje i instynkt przetrwania.",
    meaning:
      "Myszy we snach wskazują na małe, uporczywe zmartwienia, które cicho podkopują twój spokój ducha. Symbolizują drobne kradzieże czasu, drobne zdrady lub dręczące poczucie nieadekwatności. Łapanie lub wypędzanie ich oznacza odzyskanie autorytetu nad swoją przestrzenią i eliminowanie drobnych rozpraszaczy.",
    variants: [
      {
        when: "Mała szara mysz przebiegająca przez podłogę",
        means:
          "Drobne irytacje domowe, drobne lęki lub poczucie, że trywialne szczegóły odciągają twoją uwagę.",
      },
      {
        when: "Skuteczne złapanie lub uwięzienie myszy",
        means:
          "Rozwiązanie uciążliwego, dręczącego problemu; złapanie drobnej uciążliwości, zanim przerodzi się w poważny problem.",
      },
      {
        when: "Duży, agresywny szczur gryzący lub osaczający cię",
        means:
          "Spotkanie z ukrytą złośliwością, oszustwem lub kimś działającym z nieuczciwą chciwością w twoim kręgu zawodowym.",
      },
      {
        when: "Myszy podgryzające jedzenie lub ubrania",
        means:
          "Stopniowy, niezauważony wyciek finansów lub energii z powodu niedbalstwa lub niekontrolowanych drobnych nawyków.",
      },
      {
        when: "Biała mysz domowa w klatce",
        means:
          "Oswajanie małych lęków, rozwijanie zaradności i znajdowanie pomysłowych taktyk przetrwania w trudnych czasach.",
      },
    ],
    positive:
      "Eliminowanie myszy przynosi natychmiastową ulgę psychiczną, czysty porządek i załatanie dziur w twojej energii i finansach.",
    caution:
      "Inwazje myszy ostrzegają, że ignorowanie drobnych urazów ostatecznie spowoduje szkody strukturalne.",
    related: ["kata", "gveli", "oboba"],
  },
  {
    slug: "oboba",
    title: "Pająk",
    glyph: "🕷️",
    summary:
      "Pająk tka przeznaczenie, symbolizując drobiazgową cierpliwość, skomplikowane sieci, uwięzienie i twórcze rzemiosło.",
    meaning:
      "Pająki są mistrzami tkactwa. W symbolice snów reprezentują tkanie twojego przeznaczenia poprzez cierpliwość, rzemiosło i strategię. Jednak pajęczyny symbolizują również pułapki, manipulację i poczucie uwikłania w toksyczne sieci intryg snute przez dominujące osobowości.",
    variants: [
      {
        when: "Pająk cierpliwie tkający symetryczną sieć",
        means:
          "Drobiazgowe rzemiosło, budowanie prosperującego przedsięwzięcia poprzez cierpliwość i strategiczne planowanie.",
      },
      {
        when: "Zaplątanie się w lepką pajęczynę",
        means:
          "Poczucie uwięzienia w złożonej sieci oszustwa, biurokratycznej biurokracji lub manipulacyjnym związku.",
      },
      {
        when: "Gigantyczny czarny pająk atakujący",
        means:
          "Konfrontacja z duszącą, dominującą postacią (często dominującą postacią matki) lub głębokim strachem przed cieniem.",
      },
      {
        when: "Zabijanie lub usuwanie pajęczyny",
        means:
          "Uwalnianie się od manipulacji, przecinanie toksycznych uwikłań i potwierdzanie swojej wolności.",
      },
      {
        when: "Mały złoty lub biały pająk wspinający się po twoim ramieniu",
        means:
          "Starożytny omen szczęścia, pomyślności finansowej i nagłych, lukratywnych możliwości wplatających się w twoje życie.",
      },
    ],
    positive:
      "Pająk cicho tkający swoją sieć potwierdza, że pilna cierpliwość i strategiczne rzemiosło przyniosą bogate nagrody.",
    caution:
      "Lepkie sieci ostrzegają, aby być czujnym na manipulujące osoby próbujące uwięzić cię w poczuciu winy lub zobowiązania.",
    related: ["futkari", "gveli", "tagvi"],
  },
  {
    slug: "futkari",
    title: "Pszczoła",
    glyph: "🐝",
    summary:
      "Pszczoły ucieleśniają niestrudzoną pracowitość, słodki dobrobyt, harmonię wspólnoty i sukces zespołu.",
    meaning:
      "Pszczoły są czczone w różnych cywilizacjach jako emblematy produktywnej pracy, spójności społecznej i słodkiego miodu sukcesu. Sen o brzęczących pszczołach sygnalizuje owocną pracę zespołową, kwitnący biznes i słodkie nagrody za zdyscyplinowany wysiłek. Użądlenia pszczół przynoszą nagłe przebudzenia.",
    variants: [
      {
        when: "Rój pszczół brzęczący w aktywnym ulu",
        means:
          "Kwitnące przedsięwzięcie, pomyślna współpraca, harmonijna praca zespołowa i obfite żniwa finansowe.",
      },
      {
        when: "Użądlenie przez pszczołę",
        means:
          "Ostra, kłująca krytyka lub przebudzenie, które rani twoje ego, ale zawiera cenne ziarno prawdy.",
      },
      {
        when: "Jedzenie słodkiego, złotego plastra miodu",
        means:
          "Smakowanie bogatych, słodkich nagród za długą i uczciwą pracę; najwyższe zadowolenie domowe i zdrowie.",
      },
      {
        when: "Pszczoła brzęcząca spokojnie wśród kwiatów",
        means:
          "Zbieranie najlepszych pomysłów i inspiracji z różnych źródeł, aby stworzyć coś o trwałej słodyczy.",
      },
      {
        when: "Zabijanie pszczoły lub niszczenie ula",
        means:
          "Uszkodzenie owocnego partnerstwa zbiorowego przez niecierpliwość, arogancję lub bezmyślne zniszczenie.",
      },
    ],
    positive:
      "Pszczoły przynoszą obfity dobrobyt, słodkie nagrody za ciężką pracę i harmonijne osiągnięcia zespołowe.",
    caution:
      "Użądlenia pszczół radzą, aby uważnie słuchać konstruktywnej krytyki, zamiast reagować z defensywną dumą.",
    related: ["yvavilebi", "puri", "oboba"],
  },
  {
    slug: "yvavilebi",
    title: "Kwiaty",
    glyph: "🌸",
    summary:
      "Kwiaty odzwierciedlają rozkwitające uczucia, ulotne piękno, romantyczne uczucia i duchowe rozkwitanie.",
    meaning:
      "Kwiaty są najwyższym wyrazem piękna i zapachu natury. W języku snów świeże, kwitnące kwiaty reprezentują rozkwit miłości, inspiracji twórczej, radości i celebrowanie życia. Zwiędłe lub uschnięte kwiaty opłakują przemijanie emocji lub stracone okazje.",
    variants: [
      {
        when: "Świeże, kolorowe, pachnące kwiaty w ogrodzie",
        means:
          "Rozkwitająca romantyczna radość, witalność twórcza, szczęście w związkach i wewnętrzne duchowe wyrafinowanie.",
      },
      {
        when: "Otrzymywanie wspaniałego bukietu od kogoś",
        means:
          "Szczery podziw, romantyczne zaloty, głębokie uznanie i uhonorowanie twojego wyjątkowego piękna.",
      },
      {
        when: "Zwiędłe, uschnięte lub umierające kwiaty",
        means:
          "Blaknące uczucia, smutek z powodu przemijającego rozdziału lub zaniedbywanie związku, aż jego rozkwit przeminie.",
      },
      {
        when: "Zrywanie polnych kwiatów na otwartej łące",
        means:
          "Beztroska spontaniczność, niewinne przyjemności i cieszenie się prostymi, codziennymi radościami bez pretensji.",
      },
      {
        when: "Ukłucie palca kolcami kwiatów (róż)",
        means:
          "Bolesna cena namiętnej miłości; odkrycie, że głęboka intymność wymaga wrażliwości i odporności.",
      },
    ],
    positive:
      "Żywe, kwitnące kwiaty obiecują szczerą miłość, twórcze przebudzenie i promienną domową radość.",
    caution:
      "Zwiędłe płatki przypominają, aby podlewać i pielęgnować swoje osobiste relacje, zanim wyschną.",
    related: ["futkari", "puri", "qorwili"],
  },
  {
    slug: "puri",
    title: "Chleb",
    glyph: "🍞",
    summary:
      "Chleb to podstawowy pokarm, symbolizujący niezbędne pożywienie, uczciwe utrzymanie i gościnność.",
    meaning:
      "Chleb reprezentuje fundamentalne utrzymanie w życiu, zdobyte uczciwą pracą i dzielone z miłością. Ciepły, pachnący, świeżo upieczony chleb zwiastuje bezpieczeństwo, gościnną wspólnotę i obfitość. Czerstwy lub spleśniały chleb wskazuje na zaniedbane potrzeby lub branie błogosławieństw za pewnik.",
    variants: [
      {
        when: "Pieczenie lub krojenie ciepłego, świeżego, pachnącego chleba",
        means:
          "Obfite utrzymanie, spokojne bezpieczeństwo domowe i cieszenie się zdrowymi owocami uczciwej pracy.",
      },
      {
        when: "Dzielenie się chlebem z bliskimi lub nieznajomymi",
        means:
          "Prawdziwa gościnność, głęboka wspólnota, szlachetna hojność i tworzenie więzi trwałej lojalności.",
      },
      {
        when: "Jedzenie suchego, twardego, czerstwego lub spleśniałego chleba",
        means:
          "Doświadczanie niedostatku emocjonalnego lub materialnego, życie wspomnieniami lub zadowalanie się czymś mniej, niż zasługujesz.",
      },
      {
        when: "Wyrabianie bogatego ciasta rękami",
        means:
          "Przygotowywanie fundamentów pod przyszły dobrobyt; cierpliwa praca, która wkrótce przyniesie obfite pożywienie.",
      },
      {
        when: "Upuszczenie lub marnowanie chleba na podłodze",
        means:
          "Niewdzięczność, branie bezpieczeństwa za pewnik lub nieostrożne marnotrawstwo ciężko zarobionych zasobów.",
      },
    ],
    positive:
      "Świeży, ciepły chleb obiecuje niezawodne bezpieczeństwo, domowy spokój i uczciwy, satysfakcjonujący dobrobyt.",
    caution:
      "Czerstwy chleb ostrzega przed zadowalaniem się skąpymi okruchami emocjonalnymi, gdy jesteś zdolny do upieczenia świeżej obfitości.",
    related: ["dzroxa", "saxli", "futkari"],
  },
  {
    slug: "eklesia",
    title: "Kościół",
    glyph: "⛪",
    summary:
      "Kościół reprezentuje święte schronienie, sumienie moralne, duchową skruchę i poszukiwanie wyższego sensu.",
    meaning:
      "Wejście do kościoła lub sanktuarium we śnie wskazuje na wewnętrzne poszukiwanie spokoju, orientacji moralnej i przebaczenia. Odzwierciedla potrzebę oderwania się od codziennego chaosu, aby skonsultować się z sumieniem, uleczyć duchowe rany i szukać błogosławieństw na ważnych rozdrożach życia.",
    variants: [
      {
        when: "Spokojna modlitwa w pogodnym, oświetlonym słońcem kościele",
        means:
          "Duchowy spokój, ulga od ciężkich brzemion i zgodność z najwyższymi wartościami moralnymi.",
      },
      {
        when: "Zapalanie świecy przed ikoną",
        means:
          "Szczera nadzieja, wysyłanie serdecznych błogosławieństw bliskim i szukanie boskiego przewodnictwa w trudnych czasach.",
      },
      {
        when: "Zrujnowany, ciemny lub opuszczony kościół",
        means:
          "Kryzys duchowy, utrata wiary w stare dogmaty lub poczucie, że twój kompas moralny został naruszony.",
      },
      {
        when: "Słyszenie uroczystych, pięknych dzwonów kościelnych",
        means:
          "Ważne przebudzenia duchowe, radosne wieści lub uroczyste wezwanie do zwrócenia uwagi na kierunek życia.",
      },
      {
        when: "Stanie przed kościołem i niemożność wejścia",
        means:
          "Wewnętrzne poczucie niegodności, winy lub poczucie wyobcowania od swoich duchowych i kulturowych korzeni.",
      },
    ],
    positive:
      "Świetliste sanktuarium przynosi przebaczenie, głęboki wewnętrzny spokój i moralną jasność w niespokojnych myślach.",
    caution:
      "Ciemne lub zrujnowane sanktuarium nakłania do odbudowy osobistej etyki i znalezienia autentycznego duchowego ugruntowania.",
    related: ["micvalebuli", "tirili", "qorwili"],
  },
  {
    slug: "tirili",
    title: "Płacz",
    glyph: "😭",
    summary:
      "Płacz we śnie to głęboka katharsis emocjonalna, uwalniająca stłumiony smutek i robiąca miejsce na radość.",
    meaning:
      "Płacz we snach to klasyczny paradoksalny symbol. Zarówno w folklorze, jak i psychologii, wylewanie gorzkich łez podczas snu często przynosi ogromną ulgę i radosny śmiech po przebudzeniu. Jest to naturalny zawór bezpieczeństwa psychiki, zmywający nagromadzony smutek i stres.",
    variants: [
      {
        when: "Gorzkie łzy i niekontrolowany szloch we śnie",
        means:
          "Potężna katharsis emocjonalna; uwalnianie głęboko zakorzenionego żalu i torowanie drogi do radosnej ulgi w życiu na jawie.",
      },
      {
        when: "Łzy czystej radości, wdzięczności i podziwu",
        means:
          "Dotykanie najwyższego spełnienia, głęboka wdzięczność za błogosławieństwa i serdeczne pojednanie z bliskimi.",
      },
      {
        when: "Widzenie kogoś, na kim ci zależy, płaczącego niepocieszenie",
        means:
          "Wyczuwanie ich niewypowiedzianego bólu; zaproszenie do ofiarowania delikatnego pocieszenia i współczującego słuchania.",
      },
      {
        when: "Chęć płaczu, ale niemożność uronienia łzy",
        means:
          "Niebezpieczne odrętwienie emocjonalne i tłumienie; znak, aby pozwolić sobie na bezpieczne odczuwanie i przetwarzanie bólu.",
      },
      {
        when: "Budzenie się z prawdziwymi łzami na policzkach",
        means:
          "Głębokie podświadome przełamanie, które całkowicie oczyściło starą ranę emocjonalną.",
      },
    ],
    positive:
      "Płacz we snach usuwa blokady emocjonalne i zwiastuje prawdziwy spokój, śmiech i odnowioną lekkość.",
    caution:
      "Odrętwienie emocjonalne lub suchy szloch sygnalizuje, że powstrzymujesz uczucia, które potrzebują współczującego uwolnienia.",
    related: ["wyali", "micvalebuli", "bavshvi"],
  },
  {
    slug: "bechedi",
    title: "Pierścionek",
    glyph: "💍",
    summary:
      "Pierścionek ucieleśnia wieczność, święte śluby, wzajemną lojalność, pełne spełnienie i wiążące zobowiązania.",
    meaning:
      "Nierozerwany krąg pierścienia jest najwyższym symbolem wiecznego zobowiązania, kompletności i przymierza. Otrzymanie lub noszenie pierścionka wskazuje na małżeństwo, kontrakty biznesowe, nierozerwalne więzi zaufania i odkrywanie swojej zintegrowanej całości. Zgubiony lub złamany pierścionek ostrzega przed zerwanymi więzami.",
    variants: [
      {
        when: "Otrzymanie błyszczącego złotego pierścionka jako oświadczyny lub prezent",
        means:
          "Święte ślubowanie miłości, wejście w wierne partnerstwo i podjęcie szlachetnego, radosnego zobowiązania na całe życie.",
      },
      {
        when: "Pęknięty, zgięty lub złamany pierścionek na palcu",
        means:
          "Pęknięcia w związku, złamane obietnice lub uświadomienie sobie, że umowa straciła swoją świętą integralność.",
      },
      {
        when: "Zgubienie cennego pierścionka i gorączkowe poszukiwania",
        means:
          "Strach przed utratą zaufania partnera, zapomnienie o uroczystej obietnicy lub oddalenie się od kluczowego zobowiązania.",
      },
      {
        when: "Zakładanie pierścionka na palec innej osoby",
        means:
          "Oferowanie bezwarunkowej lojalności, pieczętowanie przymierza i branie odpowiedzialności za wzajemne szczęście.",
      },
      {
        when: "Pierścionek z brylantowym diamentem lub cennym kamieniem szlachetnym",
        means:
          "Prestiżowy status, niezwykła trwałość charakteru i rzadki, wieloaspektowy blask w twojej pracy.",
      },
    ],
    positive:
      "Noszenie lśniącego, nienaruszonego pierścionka symbolizuje świętą lojalność, trwałą miłość i spełnioną całość.",
    caution:
      "Złamany lub zsuwający się pierścionek ostrzega, że istotny związek wymaga natychmiastowej troski i szczerego dialogu.",
    related: ["qorwili", "oqro", "fuli"],
  },
  {
    slug: "dzroxa",
    title: "Krowa",
    glyph: "🐄",
    summary:
      "Krowa reprezentuje matczyną obfitość, delikatne pożywienie, cierpliwą płodność i hojne zaopatrzenie.",
    meaning:
      "Krowa jest starożytną uniwersalną matką utrzymania. W symbolice snów, zdrowe, pulchne krowy pasące się na zielonych pastwiskach zwiastują lata spokojnej obfitości, owocnych zbiorów i ciepłego bezpieczeństwa rodzinnego; chude lub agresywne krowy ostrzegają przed chudymi sezonami, które wymagają ostrożnego budżetowania.",
    variants: [
      {
        when: "Pulchne, zdrowe, łagodne krowy pasące się na bujnych zielonych łąkach",
        means:
          "Lata bogatej obfitości, owocnych inwestycji, spokojnego zadowolenia rodzinnego i bezpiecznego utrzymania.",
      },
      {
        when: "Dojenie spokojnej krowy i uzyskiwanie bogatego, spienionego mleka",
        means:
          "Bezpośrednie zbieranie nagród za długą cierpliwość; dobrobyt finansowy i obfite pożywienie.",
      },
      {
        when: "Chude, głodujące lub chore krowy na jałowym polu",
        means:
          "Nadchodzący chudy cykl; pilne przypomnienie o oszczędzaniu, gromadzeniu zasobów i przygotowaniu się na susze.",
      },
      {
        when: "Agresywna krowa goniąca lub bodąca cię",
        means:
          "Konflikt z autorytetem matczynym lub radzenie sobie z dominującą postacią, która kontroluje niezbędne zasoby.",
      },
      {
        when: "Łagodna krowa ze swoim figlarnym cielakiem",
        means:
          "Czuła matczyna miłość, kwitnący dobrobyt pokoleniowy i kochająca ochrona młodych.",
      },
    ],
    positive:
      "Spokojne, dobrze odżywione krowy obiecują bogate bezpieczeństwo materialne, hojne pożywienie i spokojny dobrobyt.",
    caution:
      "Chude bydło służy jako starożytne ostrzeżenie, aby strzec swoich oszczędności i unikać marnotrawstwa w najbliższym czasie.",
    related: ["puri", "bavshvi", "wyali"],
  },
  {
    slug: "mze",
    title: "Słońce",
    glyph: "☀️",
    summary:
      "Słońce we snach symbolizuje jasność, energię i sukces, jego światło sugeruje, że coś w twoim życiu staje się jasne.",
    meaning:
      "Tradycyjnie słońce jest pomyślnym znakiem: siła życiowa, uznanie i szczęśliwy okres. Jasne, ciepłe słońce oznacza, że twoje wysiłki wkrótce się opłacą, podczas gdy zachodzące lub zaciemnione słońce wskazuje na tymczasowe zmęczenie i niską energię.",
    variants: [
      {
        when: "Świeci jasne słońce",
        means:
          "Sukces i jasność, trudna sprawa wkrótce rozwiąże się na twoją korzyść.",
      },
      {
        when: "Wschód słońca",
        means:
          "Nowy początek: praca, związek lub rozdział rozpoczynający się z nadzieją.",
      },
      {
        when: "Zachód słońca lub zaćmienie",
        means:
          "Zmęczenie lub koniec rozdziału. Czas na odpoczynek, to zakończenie jest naturalne.",
      },
    ],
    positive:
      "Odczuwanie ciepła słońca to jeden z najmilszych snów, przed tobą pomyślny okres.",
    caution:
      "Palące słońce ostrzega przed wypaleniem, zwolnij, zanim dopadnie cię wyczerpanie.",
    related: ["mtvare", "varskvlavi", "cecxli"],
  },
  {
    slug: "mtvare",
    title: "Księżyc",
    glyph: "🌙",
    summary:
      "Księżyc symbolizuje intuicję, emocje i ukryte pragnienia, oświetla to, czego światło dzienne nie może pokazać.",
    meaning:
      "W języku snów księżyc to twój wewnętrzny świat: uczucia, intuicja i to, co ukrywasz nawet przed sobą. Pełnia księżyca oznacza szczyt emocjonalny i jasność; nów, narodziny uczucia lub idei. Spacer w świetle księżyca sugeruje, że powinieneś zaufać swojej intuicji.",
    variants: [
      {
        when: "Pełnia księżyca",
        means:
          "Dojrzałość emocjonalna i jasność, to, co cię trapiło, wkrótce znajdzie swoje imię.",
      },
      {
        when: "Nów lub sierp księżyca",
        means:
          "Rodzi się coś nowego: uczucie, pomysł lub decyzja jeszcze nie w pełni ukształtowana.",
      },
      {
        when: "Księżyc chowa się za chmurami",
        means:
          "Zamieszanie w uczuciach, odpowiedź jest już w tobie, ale jeszcze jej nie widzisz. Daj sobie czas.",
      },
    ],
    positive:
      "Czysty księżyc wzmacnia intuicję, zaufaj swojemu wewnętrznemu głosowi, zwłaszcza teraz.",
    caution:
      "Krwistoczerwony lub niepokojący księżyc prosi, abyś sprawdził, jakie uczucie cię trapi i z kim nie jesteś szczery.",
    related: ["mze", "varskvlavi", "zgva"],
  },
  {
    slug: "varskvlavi",
    title: "Gwiazda",
    glyph: "⭐",
    summary:
      "Gwiazda symbolizuje nadzieję, marzenia i przewodnictwo, światło prowadzące cię ciemną drogą.",
    meaning:
      "Tradycyjnie gwiazda we snach oznacza nadzieję i wysoki cel. Niebo pełne jasnych gwiazd mówi, że jesteś na właściwej ścieżce, nawet jeśli wyniki są jeszcze niewidoczne. Spadająca gwiazda to życzenie domagające się spełnienia lub okazja, której nie można przegapić.",
    variants: [
      {
        when: "Niebo usiane jasnymi gwiazdami",
        means:
          "Nadzieja i właściwy kierunek. Nawet jeśli teraz jest ciężko, droga jest prawidłowa.",
      },
      {
        when: "Gwiazda spada",
        means:
          "Wypowiedz życzenie, ten sen popycha cię do działania w sprawie, którą ciągle odkładasz.",
      },
      {
        when: "Jedna jasna gwiazda oświetla twoją drogę",
        means:
          "Konkretna osoba lub cel, który jest teraz twoim kompasem. Podążaj za nim.",
      },
    ],
    positive:
      "Gwiazda to prawie zawsze dobry znak, obiecuje nadzieję, przewodnictwo i cichą ochronę na twojej drodze.",
    caution:
      "Gasnące gwiazdy pytają, czy straciłeś wiarę w swój cel, sam cel jest słuszny.",
    related: ["mze", "mtvare", "frena"],
  },
  {
    slug: "mdinare",
    title: "Rzeka",
    glyph: "🏞️",
    summary:
      "Rzeka symbolizuje przepływ życia, jej szybkość i klarowność odzwierciedlają, jak idą twoje sprawy.",
    meaning:
      "W języku snów rzeka to czas i bieg życia. Spokojna, czysta rzeka oznacza, że wszystko płynie naturalnie; zalana lub błotnista oznacza, że wydarzenia cię pędzą, a kontrola wymyka się. Przekraczanie rzeki oznacza przekraczanie ważnego progu.",
    variants: [
      {
        when: "Widzisz spokojną, czystą rzekę",
        means:
          "Harmonia i naturalny rytm, nie forsuj wydarzeń; płyną prawidłowo same.",
      },
      {
        when: "Zalana lub błotnista rzeka",
        means:
          "Emocje lub wydarzenia cię porywają. Zwolnij i zajmij się jedną sprawą naraz.",
      },
      {
        when: "Przekraczasz rzekę",
        means:
          "Moment przejściowy: zostawienie starego za sobą dla nowego brzegu. Dobry znak.",
      },
    ],
    positive:
      "Pływanie z prądem oznacza, że poruszasz się zgodnie z życiem, zamiast walczyć z jego naturalnym rytmem.",
    caution:
      "Bycie wleczonym przez prąd ostrzega, że ktoś lub coś ciągnie cię wbrew twojej woli.",
    related: ["wyali", "zgva", "cha"],
  },
  {
    slug: "cha",
    title: "Studnia",
    glyph: "🪣",
    summary:
      "Studnia symbolizuje wewnętrzne zasoby i głębię, to, czego szukasz w sobie.",
    meaning:
      "Tradycyjnie studnia oznacza głębię: wewnętrzną mądrość, ukryte rezerwy lub zapomniane wspomnienie. Pełna, czysta studnia mówi, że masz wystarczająco dużo siły; sucha sygnalizuje wyczerpanie i potrzebę odpoczynku. Patrzenie w studnię to wezwanie do samopoznania.",
    variants: [
      {
        when: "Studnia pełna czystej wody",
        means:
          "Wewnętrzne bogactwo, odpowiedzi i siła, których szukasz, są już w tobie.",
      },
      {
        when: "Sucha lub pusta studnia",
        means:
          "Wyczerpanie. Dajesz za dużo i otrzymujesz za mało, przywróć równowagę.",
      },
      {
        when: "Wpadasz do studni",
        means:
          "Strach przed pogrążeniem się w sytuacji. Zatrzymaj się i poproś o pomoc, to nie wstyd.",
      },
    ],
    positive:
      "Czerpanie wody ze studni to doskonały znak, twoja praca przynosi wewnętrzne owoce.",
    caution:
      "Ciemna, bezdenna studnia ostrzega przed utonięciem we wspomnieniach przeszłości.",
    related: ["wyali", "mdinare", "saxli"],
  },
  {
    slug: "karishkhali",
    title: "Burza",
    glyph: "🌪️",
    summary:
      "Burza symbolizuje potężne emocje lub wstrząsy, nadchodzi, wszystko miesza, a potem oczyszcza powietrze.",
    meaning:
      "Burza we snach prawie zawsze oznacza burzę emocjonalną: konflikt, nagłą zmianę lub narastające napięcie szukające ujścia. Ważne jest, gdzie stałeś: obserwowanie z ukrycia oznacza, że spokojnie przetrwasz zmianę; bycie w środku oznacza, że zmiana już trwa.",
    variants: [
      {
        when: "Obserwujesz burzę z ukrycia",
        means:
          "Nadchodzi zmiana, ale jesteś chroniony. Obserwuj i nie spiesz się.",
      },
      {
        when: "Jesteś w oku cyklonu",
        means:
          "Chaotyczny okres, tymczasowy. Przede wszystkim nie ulegaj panice.",
      },
      {
        when: "Spokój i słońce po burzy",
        means: "Bardzo dobry znak: trudności się kończą i nadchodzi odnowa.",
      },
    ],
    positive:
      "Burze oczyszczają powietrze, często są znakiem usuwania starego dla nowego początku.",
    caution:
      "Powtarzająca się burza ostrzega, że unikasz konfliktu, który nie zniknie, porozmawiaj o tym.",
    related: ["wvima", "zgva", "cecxli"],
  },
  {
    slug: "micisdzvra",
    title: "Trzęsienie ziemi",
    glyph: "🏚️",
    summary:
      "Trzęsienie ziemi symbolizuje chwiejące się fundamenty, to, co wydawało się stabilne, nagle się zmieniło.",
    meaning:
      "W języku snów ziemia to stabilność: praca, dom, relacje. Trzęsienie ziemi oznacza, że te fundamenty się chwieją, niosąc nieoczekiwane wiadomości, zmienione plany lub kryzys wiary. Jednak po każdym trzęsieniu ziemi następuje odbudowa: zniszczenie i wyzwolenie jednocześnie.",
    variants: [
      {
        when: "Ziemia lekko drży",
        means:
          "Małe ostrzeżenie: coś w Twoim życiu wymaga uwagi, zanim się rozrośnie.",
      },
      {
        when: "Gwałtowne trzęsienie ziemi z zawaleniem",
        means:
          "Duża zmiana lub szok. Bolesne, ale niszczy to, co już nie mogło się utrzymać.",
      },
      {
        when: "Przeżywasz trzęsienie ziemi",
        means:
          "Wewnętrzna odporność, cokolwiek się stanie, utrzymasz się na nogach.",
      },
    ],
    positive:
      "Zachowanie spokoju we śnie oznacza, że nawet nagłą zmianę spotykasz przygotowany, z wewnętrzną stabilnością.",
    caution:
      "Panika ujawnia nadmierne przywiązanie do stabilności, ćwicz elastyczność, aby zmiana przestała być odczuwana jako załamanie.",
    related: ["saxli", "karishkhali", "gza"],
  },
  {
    slug: "kvamli",
    title: "Dym",
    glyph: "💨",
    summary:
      "Dym symbolizuje niejasność i ukryte niebezpieczeństwo, zasłania widok i utrudnia oddychanie.",
    meaning:
      "Dym we snach oznacza, że nie widzisz sytuacji w pełni: ktoś coś ukrywa, albo Ty unikasz prawdy. Gęsty czarny dym to poważne ostrzeżenie; cienki biały dym to tymczasowe zamieszanie, które wkrótce się rozwieje.",
    variants: [
      {
        when: "Gęsty czarny dym",
        means:
          "Poważne ostrzeżenie: sprawy nie są takie, jak się wydają. Zweryfikuj fakty.",
      },
      {
        when: "Cienki biały dym",
        means:
          "Tymczasowa niepewność, mgła się podniesie; unikaj pochopnych decyzji.",
      },
      {
        when: "Dławisz się dymem",
        means:
          "Kłamstwa lub manipulacje kogoś Cię duszą. Zachowaj dystans i żądaj uczciwości.",
      },
    ],
    positive:
      "Rozpraszający się dym z czystym niebem oznacza, że prawda wkrótce wyjdzie na jaw.",
    caution:
      "Dym rzadko pojawia się bez ognia, znajdź jego źródło: która relacja zasłania Ci oczy.",
    related: ["cecxli", "nisli", "saxli"],
  },
  {
    slug: "nisli",
    title: "Mgła",
    glyph: "🌫️",
    summary:
      "Mgła symbolizuje niepewność i poszukiwanie, droga istnieje, po prostu nie jest jeszcze widoczna.",
    meaning:
      "Mgła oznacza okres przejściowy: stare się skończyło, nowe nie jest jeszcze widoczne. To nie jest zły znak, mgła jest naturalna i zawsze się podnosi. Ważne jest, jak się zachowałeś: spokojne chodzenie jest właściwe; panika oznacza, że zbyt mocno naciskasz na siebie.",
    variants: [
      {
        when: "Idziesz przez gęstą mgłę",
        means:
          "Droga jest właściwa; wynik jest po prostu jeszcze niewidoczny. Idź dalej krok po kroku.",
      },
      {
        when: "Mgła się podnosi",
        means:
          "Nadchodzi jasność, odpowiedź, na którą czekasz, wkrótce się pojawi.",
      },
      {
        when: "Jesteś zagubiony we mgle",
        means:
          "Czas się zatrzymać i ponownie sprawdzić swoje położenie: czego naprawdę chcesz?",
      },
    ],
    positive:
      "Spokojne chodzenie we mgle świadczy o cierpliwości i wierze, cechach, które teraz Cię wzmacniają.",
    caution:
      "Jeśli mgła gęstniała, odłóż ważne decyzje, dopóki obraz się nie wyjaśni.",
    related: ["kvamli", "gza", "mtvare"],
  },
  {
    slug: "bagi",
    title: "Ogród",
    glyph: "🌷",
    summary:
      "Ogród symbolizuje pielęgnowany świat wewnętrzny, to, o co z miłością dbasz, cicho rośnie.",
    meaning:
      "Ogród we snach to Twoje życie wewnętrzne: kwitnący ogród oznacza, że dbanie o siebie przynosi owoce; zaniedbany, zarośnięty chwastami oznacza, że odsunąłeś się na bok. Praca w ogrodzie, sadzenie, podlewanie, to jeden z najmilszych znaków: inwestowanie w przyszłość.",
    variants: [
      {
        when: "Kwitnący, zadbany ogród",
        means: "Wewnętrzna harmonia i owocny okres, Twoje wysiłki kwitną.",
      },
      {
        when: "Opuszczony, uschnięty ogród",
        means: "Zaniedbałeś siebie. Czas wrócić do własnych potrzeb.",
      },
      {
        when: "Sadzenie lub podlewanie ogrodu",
        means:
          "Sianie przyszłości, to, co robisz teraz, zaowocuje za kilka miesięcy.",
      },
    ],
    positive:
      "Zbieranie owoców lub kwiatów z ogrodu to znak zasłużonej nagrody, zatrzymaj się i ciesz się rezultatami.",
    caution:
      "Ciernie i chwasty opanowujące grządki oznaczają nagromadzone drobne urazy, usuń je w porę.",
    related: ["yvavilebi", "xe", "vashli"],
  },
  {
    slug: "tye",
    title: "Las",
    glyph: "🌲",
    summary:
      "Las symbolizuje nieznane i przygodę, miejsce, gdzie musisz sam znaleźć ścieżkę.",
    meaning:
      "Las ucieleśnia nieświadomość: to, co w Tobie jest jeszcze nieodkryte. Jasny las oznacza przygodę i rozwój; ciemny, przerażający oznacza, że boisz się jakiejś części siebie. Opuszczenie lasu jest zawsze dobrym znakiem, przechodzisz próbę.",
    variants: [
      {
        when: "Spacerujesz po jasnym, słonecznym lesie",
        means: "Zdrowy proces samopoznania, powoli poznajesz siebie lepiej.",
      },
      {
        when: "Jesteś zagubiony w ciemnym lesie",
        means:
          "Strach przed nieznanym. Pamiętaj: każda leśna ścieżka prowadzi gdzieś, idź dalej.",
      },
      {
        when: "Wychodzisz z lasu na pole",
        means:
          "Próba się kończy, trudny okres zamyka się i otwiera się przestrzeń.",
      },
    ],
    positive:
      "Przyjazne spotkanie ze zwierzęciem leśnym oznacza, że pogodziłeś się ze swoimi instynktami.",
    caution:
      "Bycie ściganym przez las to problem, przed którym uciekasz, zatrzymaj się i staw mu czoła.",
    related: ["xe", "mgeli", "gza"],
  },
  {
    slug: "xe",
    title: "Drzewo",
    glyph: "🌳",
    summary:
      "Drzewo symbolizuje wzrost, stabilność i korzenie, to, co rośnie powoli, ale stoi mocno.",
    meaning:
      "Tradycyjnie drzewo oznacza życie i rodzinę: korzenie to przeszłość i krewni, gałęzie to przyszłość i możliwości. Zielone, silne drzewo sygnalizuje zdrowie i stabilność; uschnięte, niską energię. Wspinanie się na drzewo oznacza ambicję i postęp.",
    variants: [
      {
        when: "Zielone, potężne drzewo",
        means: "Zdrowie, stabilność, wzrost, stoisz na solidnym gruncie.",
      },
      {
        when: "Wspinasz się na drzewo",
        means:
          "Postęp w kierunku celu, im wyżej się wspinasz, tym bliżej sukcesu.",
      },
      {
        when: "Uschnięte lub powalone drzewo",
        means:
          "Wyczerpanie lub zakończony rozdział. Czasami stare musi odejść, aby nowe mogło wykiełkować.",
      },
    ],
    positive:
      "Odpoczynek pod drzewem sygnalizuje ochronę, otaczają Cię godni zaufania ludzie.",
    caution:
      "Drzewo spadające na Ciebie oznacza nadmierne obciążenie, coś ciężkiego musi w końcu zostać odpuszczone.",
    related: ["tye", "bagi", "vashli"],
  },
  {
    slug: "vashli",
    title: "Jabłko",
    glyph: "🍎",
    summary:
      "Jabłko symbolizuje zdrowie, pokusę i słodką nagrodę, owoc cierpliwie dojrzewający.",
    meaning:
      "Jabłko we snach jest tradycyjnie życzliwe: zdrowie, obfitość i zasłużona nagroda. Dojrzałe czerwone jabłko oznacza spełnienie życzenia; zgniłe, przegapioną szansę. Jedzenie jabłka oznacza delektowanie się owocami życia.",
    variants: [
      {
        when: "Dojrzałe czerwone jabłko",
        means:
          "Życzenie dojrzewa, to, o czym marzyłeś, zbliża się do spełnienia.",
      },
      {
        when: "Jesz jabłko",
        means: "Zadowolenie i zdrowie, ciesz się tym, co już masz.",
      },
      {
        when: "Zgniłe jabłko",
        means:
          "Przegapiona szansa lub zaniedbana relacja. Lekcja na przyszłość.",
      },
    ],
    positive:
      "Jabłoń obciążona owocami to jeden z najlepszych znaków obfitości i rodzinnej radości.",
    caution:
      "Gorzkie jabłko sugeruje, że Twój cel nie jest naprawdę Twój, sprawdź ponownie, czego chcesz.",
    related: ["xe", "bagi", "yurdzeni"],
  },
  {
    slug: "yurdzeni",
    title: "Winogrona",
    glyph: "🍇",
    summary:
      "Winogrona symbolizują obfitość, przyjaźń i radość, żniwa zbierane razem.",
    meaning:
      "W tradycji gruzińskiej winogrona należą do zbiorów, obfitości i wspólnoty. Dojrzałe winogrona oznaczają przyjaźń i dobrobyt; ich zbieranie, owoc wspólnej pracy. Winogrona wyciskane na wino oznaczają transformację, zwykłe dni zamieniające się w świętowanie.",
    variants: [
      {
        when: "Dojrzałe kiście winogron",
        means:
          "Obfitość i przyjaźń, otaczają Cię ludzie, z którymi dzielisz radość.",
      },
      {
        when: "Zbierasz winogrona",
        means: "Owoc pracy, to, nad czym długo pracowałeś, zbliża się do żniw.",
      },
      {
        when: "Kwaśne lub zgniłe winogrona",
        means:
          "Rozczarowanie kimś, od kogo oczekiwałeś więcej. Nie spiesz się z osądzaniem.",
      },
    ],
    positive:
      "Owocna winorośl tradycyjnie sygnalizuje silniejszą rodzinę i dobrobyt.",
    caution:
      "Niedostępne winogrona oznaczają, że Twój cel nie jest jeszcze dojrzały, daj mu więcej słońca i cierpliwie czekaj.",
    related: ["vashli", "ghvino", "bagi"],
  },
  {
    slug: "ghvino",
    title: "Wino",
    glyph: "🍷",
    summary:
      "Wino symbolizuje radość, obfitość i transformację, zwykłe dni zamieniające się w świętowanie.",
    meaning:
      "W tradycji gruzińskiej wino należy do życia i gościnności. Picie wina z przyjaciółmi oznacza radość i dobrobyt; rozlane wino, utraconą radość lub żal. Robienie wina oznacza cierpliwość, dobre rzeczy wymagają czasu.",
    variants: [
      {
        when: "Pijesz wino z przyjaciółmi",
        means: "Radość i wspólnota, relacje wokół Ciebie stają się silniejsze.",
      },
      {
        when: "Wino się rozlewa",
        means:
          "Utracona okazja lub żal. To, co się rozlało, nie wróci, patrz w przyszłość.",
      },
      {
        when: "Robisz wino lub wlewasz je do kwewri",
        means:
          "Cierpliwość i długoterminowe plany, zasiane teraz, wynagrodzą Cię bogato później.",
      },
    ],
    positive:
      "Pełna czara wina tradycyjnie sygnalizuje obfitość rodzinną, ciepłą gościnność i trwałe zdrowie.",
    caution:
      "Uczucie upojenia ostrzega przed nadmiernym pobłażaniem w życiu na jawie, przyjemność pozostaje dobra tylko wtedy, gdy zachowujesz umiar.",
    related: ["yurdzeni", "puri", "qorwili"],
  },
  {
    slug: "tapli",
    title: "Miód",
    glyph: "🍯",
    summary:
      "Miód symbolizuje słodką nagrodę i moc słów, to, co pochodzi z pracy i pozostawia słodycz.",
    meaning:
      "Miód we snach jest tradycyjnie życzliwy: słodkie rezultaty, miłe słowa i szanowana praca. Jedzenie miodu oznacza smakowanie słodkiej strony życia; miód widziany z pszczołami oznacza, że nagroda pochodzi z pracy, a nie z szczęścia.",
    variants: [
      {
        when: "Jesz miód",
        means:
          "Słodki okres, zasłużona radość, którą należy delektować się powoli.",
      },
      {
        when: "Zbierasz miód lub stoisz wśród pszczół",
        means:
          "Praca, która zostanie bogato wynagrodzona. Praca zespołowa jest szczególnie owocna.",
      },
      {
        when: "Miód rozlewa się na Ciebie lub przykleja się do Ciebie",
        means:
          "Słodycz zamieniona w ciężar, nadmierna uwaga lub zobowiązanie, które Cię wiąże.",
      },
    ],
    positive:
      "Pełny słoik miodu sygnalizuje stabilną stabilność finansową i ciche ciepło życia rodzinnego.",
    caution:
      "Gorzki miód ostrzega, że to, co wydawało się słodkie, okazuje się inne, zweryfikuj, zanim w pełni zaufasz.",
    related: ["futkari", "puri", "ghvino"],
  },
  {
    slug: "mgeli",
    title: "Wilk",
    glyph: "🐺",
    summary:
      "Wilk symbolizuje instynkt, wolność i stado, dziką siłę żyjącą w Tobie.",
    meaning:
      "Wilk jest dwojaki: niebezpieczeństwo (rywalizacja, konkurencja) i wewnętrzna siła (instynkt, lojalność wobec stada). Wilk, którego się nie boisz, to ochrona i moc; ten, którego się boisz, to czyhające zagrożenie. Stado oznacza przynależność i zespół.",
    variants: [
      {
        when: "Wilk Cię atakuje",
        means:
          "Rywal lub przeciwnik staje się aktywny. Bądź czujny, ale nie panikuj.",
      },
      {
        when: "Spokojny wilk stoi obok Ciebie",
        means: "Wewnętrzna siła i lojalny sojusznik, nie jesteś sam.",
      },
      {
        when: "Stado wilków",
        means:
          "Przynależność i zespół, Twoi ludzie szukają Cię lub już Cię otaczają.",
      },
    ],
    positive:
      "Biały wilk to rzadki i życzliwy znak, duchowa ochrona, ostry instynkt i niezwykła jasność.",
    caution:
      "Wilk śledzący Cię w ciemności oznacza, że ktoś cicho działa przeciwko Tobie, otwórz oczy.",
    related: ["dzaghli", "tye", "tagvi"],
  },
  {
    slug: "dzaghli",
    title: "Pies",
    glyph: "🐕",
    summary:
      "Pies symbolizuje lojalność, przyjaźń i ochronę – tego, kto stoi u Twojego boku.",
    meaning:
      "Pies we snach niemal zawsze oznacza osobę: lojalnego przyjaciela, obrońcę lub Twoją własną wierność. Przyjazny pies to dobry znak zaufanych ludzi wokół Ciebie. Agresywny sygnalizuje konflikt z kimś bliskim lub strach przed zdradą.",
    variants: [
      {
        when: "Przyjazny pies podąża za Tobą lub się przytula",
        means:
          "Lojalna przyjaźń, ktoś troszczy się o Ciebie bardziej, niż myślisz.",
      },
      {
        when: "Pies szczeka na Ciebie lub Cię atakuje",
        means: "Konflikt z kimś bliskim lub poczucie winy, coś do wyjaśnienia.",
      },
      {
        when: "Zgubiony pies",
        means:
          "Strach przed utratą przyjaźni lub dystans od starego przyjaciela – zadzwoń do niego.",
      },
    ],
    positive:
      "Biały lub radosny pies sygnalizuje szczerą radość i nadejście nowej, godnej zaufania przyjaźni.",
    caution:
      "Chory pies ostrzega, że ktoś bliski potrzebuje pomocy, ale milczy – wyciągnij rękę jako pierwszy.",
    related: ["mgeli", "kata", "bavshvi"],
  },
  {
    slug: "lomi",
    title: "Lew",
    glyph: "🦁",
    summary:
      "Lew symbolizuje siłę, przywództwo i odwagę – króla, który domaga się decyzji.",
    meaning:
      "Lew oznacza autorytet: Twoje własne przywództwo lub wpływową osobę w Twoim życiu. Spokojny lew sygnalizuje ochronę i sukces; wściekły – konflikt z autorytetem lub Twój własny gniew. Walka z lwem oznacza stawienie czoła wielkiemu wyzwaniu.",
    variants: [
      {
        when: "Spokojny, majestatyczny lew",
        means:
          "Siła i ochrona, kontrolujesz sytuację, nawet jeśli nie jest to widoczne.",
      },
      {
        when: "Wściekły lew Cię goni",
        means:
          "Presja ze strony autorytetu (szefa, rodzica) lub Twój własny gniew szukający ujścia.",
      },
      {
        when: "Walczysz z lwem i wygrywasz",
        means:
          "Zwycięstwo nad wielkim wyzwaniem, nikt nie jest silniejszy od Ciebie w tej walce.",
      },
    ],
    positive:
      "Odległy ryk lwa sygnalizuje, że Twój głos niesie się daleko, w końcu zostanie usłyszany.",
    caution:
      "Ucieczka przed lwem oznacza ucieczkę od odpowiedzialności w życiu na jawie – przestań uciekać i staw jej czoła ze spokojem.",
    related: ["datvi", "mgeli", "mze"],
  },
  {
    slug: "datvi",
    title: "Niedźwiedź",
    glyph: "🐻",
    summary:
      "Niedźwiedź symbolizuje siłę, ochronę i odpoczynek – tego, kto śpi przez zimę i budzi się wiosną.",
    meaning:
      "Niedźwiedź ma podwójne znaczenie: spokojny niedźwiedź oznacza matczyną ochronę i wewnętrzną siłę; agresywny – niebezpieczeństwo naruszające przestrzeń osobistą. Niedźwiedź w hibernacji często mówi, że potrzebujesz odpoczynku i regeneracji – to natura, nie wstyd.",
    variants: [
      {
        when: "Spokojny niedźwiedź",
        means:
          "Ochrona i siła, stoi za Tobą solidne wsparcie: rodzina, tradycja, charakter.",
      },
      {
        when: "Niedźwiedź Cię atakuje",
        means: "Ktoś narusza Twoje granice. Czas powiedzieć wyraźne „nie”.",
      },
      {
        when: "Niedźwiedź śpi w swojej gawrze",
        means:
          "Czas na odpoczynek, ciało i umysł proszą o regenerację. Posłuchaj.",
      },
    ],
    positive:
      "Figlarne niedźwiadki sygnalizują nadchodzącą rodzinną radość i ciepłe wieści, które zbierają wszystkich razem.",
    caution:
      "Zbliżanie się do niedźwiedzia strzegącego młodych ostrzega, że wtrącasz się w cudze sprawy – cofnij się.",
    related: ["lomi", "tye", "saxli"],
  },
  {
    slug: "txa",
    title: "Koza",
    glyph: "🐐",
    summary:
      "Koza symbolizuje upór, niezależność i bogactwo – tę, która wspina się nawet po stromych skałach.",
    meaning:
      "W tradycji wiejskiej koza mierzyła bogactwo i wytrzymałość. Koza we snach oznacza, że uparcie dążysz do celu, i to dobrze, bo koza zawsze dociera na szczyt. Biała koza jest dobra; czarna ostrzega przed uporem, który Ci szkodzi.",
    variants: [
      {
        when: "Biała koza",
        means: "Pomyślność i sukces, Twoja uparta praca się opłaca.",
      },
      {
        when: "Koza wspina się na górę",
        means: "Ambicja i postęp, trudna droga, ale sobie poradzisz.",
      },
      {
        when: "Koza Cię bodzie",
        means: "Twój upór rani kogoś, okaż elastyczność; to nie jest słabość.",
      },
    ],
    positive:
      "Picie koziego mleka sygnalizuje stałą obfitość i ugruntowane dobre samopoczucie życia rodzinnego.",
    caution:
      "Koza zmierzająca w stronę przepaści oznacza, że Twoja upartość zbliża się do niebezpiecznej granicy – zatrzymaj się i przemyśl to ponownie.",
    related: ["cxvari", "dzroxa", "rdze"],
  },
  {
    slug: "cxvari",
    title: "Owca",
    glyph: "🐑",
    summary:
      "Owce symbolizują pokój, dobrobyt i wspólnotę – spokojnie pasące się stado.",
    meaning:
      "Owce są tradycyjnie łagodne: oznaczają pokój, stabilność materialną i harmonię rodzinną. Stado oznacza harmonię wokół Ciebie; zagubiona owca oznacza, że ktoś bliski zbłądził i potrzebuje Twojej uwagi.",
    variants: [
      {
        when: "Stado spokojnie się pasie",
        means:
          "Spokój i stabilność, wszystko jest na swoim miejscu; ciesz się tym.",
      },
      {
        when: "Jagnię",
        means:
          "Niewinność i nowe początki, czas na łagodność, także wobec siebie.",
      },
      {
        when: "Zagubiona owca",
        means: "Ktoś bliski zgubił drogę, potrzebuje Twojej uwagi i telefonu.",
      },
    ],
    positive:
      "Biała owca sygnalizuje duchową czystość, łagodny spokój i trwałe szczęście rodzinne.",
    caution:
      "Wilk atakujący stado oznacza, że Twój spokojny świat jest zagrożony – chroń to, co cenne.",
    related: ["txa", "dzroxa", "mgeli"],
  },
  {
    slug: "qatami",
    title: "Kura",
    glyph: "🐓",
    summary:
      "Kura symbolizuje dom, troskę i codzienną obfitość – podwórko tętniące życiem.",
    meaning:
      "Kura oznacza dom i życie rodzinne. Nioska oznacza płodność i mały, ale stały dochód; kura z pisklętami – troskę i ochronę. Kogut oznacza przebudzenie, czas otworzyć oczy.",
    variants: [
      {
        when: "Kura znosi jajko",
        means: "Mały, ale stały owoc, Twoja codzienna praca się opłaca.",
      },
      {
        when: "Kogut pieje",
        means: "Pobudka, coś już oczywistego umyka Twojej uwadze. Otwórz oczy.",
      },
      {
        when: "Pisklęta wokół kury",
        means:
          "Rodzinne ciepło i troska, albo Ty tego potrzebujesz, albo Ty to dajesz. ",
      },
    ],
    positive:
      "Wiele kur na podwórku sygnalizuje rodzinną obfitość i gości, dom wypełnia się życiem.",
    caution:
      "Walczące kury oznaczają drobne domowe tarcia o błahostki – nie pozwól, by się rozrosły.",
    related: ["kvercxi", "saxli", "bavshvi"],
  },
  {
    slug: "kvercxi",
    title: "Jajko",
    glyph: "🥚",
    summary:
      "Jajko symbolizuje nowe początki i ukryty potencjał – wszystko, co jeszcze się nie narodziło.",
    meaning:
      "Jajko to nieujawniona szansa: pomysł, ciąża (dosłowna lub nowego projektu) lub przyszłość, która dojrzewa. Całe jajko oznacza nadzieję; rozbite – straconą szansę lub przedwczesne ujawnienie.",
    variants: [
      {
        when: "Całe, czyste jajka",
        means:
          "Potencjał i świeże początki, coś dobrego dojrzewa; nie spiesz się.",
      },
      {
        when: "Jajko się rozbija",
        means:
          "Przedwczesne ujawnienie lub stracona szansa, następnym razem pilnuj czasu.",
      },
      {
        when: "Wiele jajek",
        means: "Obfitość i płodność, masz wybory, a to jest luksus.",
      },
    ],
    positive:
      "Malowane pisanki we snach sygnalizują głęboką odnowę, przebaczenie i cichą duchową radość.",
    caution:
      "Zepsute jajko ostrzega, że coś, na co liczyłeś, wymaga uczciwej, terminowej oceny, zanim się rozprzestrzeni.",
    related: ["qatami", "bavshvi", "orsuloba"],
  },
  {
    slug: "rdze",
    title: "Mleko",
    glyph: "🥛",
    summary:
      "Mleko symbolizuje pożywienie, czułość i matczyną troskę – pierwszy pokarm, pierwszą miłość.",
    meaning:
      "Mleko jest tradycyjnie dobre: oznacza dobrobyt, zdrowie i troskę. Picie czystego mleka oznacza wewnętrzne wzmocnienie; rozlane mleko – małą stratę, której nie warto opłakiwać; skwaśniałe mleko – coś zbyt długo pozostawione nieużywane.",
    variants: [
      {
        when: "Pijesz czyste mleko",
        means:
          "Wzmocnienie i zdrowie, odżywiasz się prawidłowo, dosłownie i w przenośni.",
      },
      {
        when: "Mleko się rozlewa",
        means: "Mała strata, której nie warto opłakiwać. Odpuść i idź dalej.",
      },
      {
        when: "Matka daje Ci mleko lub karmisz dziecko",
        means:
          "Troska, albo jej potrzebujesz, albo masz ją do zaoferowania. Oba są dobrymi znakami.",
      },
    ],
    positive:
      "Rzeki mleka lub pełne szklanki sygnalizują płynącą obfitość i bezpieczne dobre samopoczucie życia rodzinnego.",
    caution:
      "Gorzkie lub skwaśniałe mleko oznacza, że kiedyś odżywiająca więź zepsuła się – przyznaj to, zamiast udawać.",
    related: ["dzroxa", "bavshvi", "puri"],
  },
  {
    slug: "gamocda",
    title: "Egzamin",
    glyph: "📝",
    summary:
      "Egzamin symbolizuje strach przed oceną i gotowość – życie pyta: czy jesteś gotowy?",
    meaning:
      "Egzamin we snach prawie nigdy nie dotyczy prawdziwego egzaminu, oznacza życiowe testy: rozmowę kwalifikacyjną, ważne spotkanie, decyzję, w której czujesz się oceniany. Spóźnienie sygnalizuje strach przed nieprzygotowaniem; zdanie oznacza pokonanie zwątpienia w siebie.",
    variants: [
      {
        when: "Spóźniasz się na egzamin",
        means:
          "Strach przed nieprzygotowaniem. Często bezpodstawny, przygotowanie już jest.",
      },
      {
        when: "Nie potrafisz odpowiedzieć na pytania",
        means:
          "Kryzys pewności siebie. Pamiętaj: nikt nie odpowiada na wszystko we snach, to normalne.",
      },
      {
        when: "Zdajesz egzamin",
        means:
          "Wewnętrzna gotowość, jesteś przygotowany na nadchodzące wyzwanie.",
      },
    ],
    positive:
      "Uświadomienie sobie, że to tylko sen i uspokojenie się, świadczy o doskonałej samokontroli.",
    caution:
      "Powtarzające się sny o egzaminach ostrzegają, że perfekcjonizm Cię wyczerpuje – wystarczy, że jest wystarczająco dobrze.",
    related: ["gza", "nisli", "bavshvi"],
  },
  {
    slug: "omi",
    title: "Wojna",
    glyph: "⚔️",
    summary:
      "Wojna symbolizuje wewnętrzny lub zewnętrzny konflikt, bolesną bitwę, która pilnie wymaga zakończenia.",
    meaning:
      "Wojna we snach rzadko dotyczy prawdziwej wojny, ucieleśnia konflikt: w rodzinie, w pracy lub w Tobie samym między pragnieniem a obowiązkiem. Walka oznacza aktywne bronienie swojego; ucieczka oznacza unikanie konfliktu. Koniec wojny to zawsze nadzieja na pojednanie.",
    variants: [
      {
        when: "Walczysz na wojnie",
        means: "Aktywna walka o swoje, nie ustępujesz, a to jest siła.",
      },
      {
        when: "Uciekasz lub chowasz się przed wojną",
        means:
          "Ucieczka przed konfliktem, zrozumiała, ale problem pozostaje. Czas na dialog.",
      },
      {
        when: "Wojna się kończy i nastaje pokój",
        means: "Pojednanie się zbliża, z innymi lub z samym sobą.",
      },
    ],
    positive:
      "Ochrona kogoś w wojennej scenerii snu sygnalizuje rzadką lojalność i cichą odwagę, by stanąć w obronie.",
    caution:
      "Powtarzające się sny o wojnie sygnalizują nagromadzony stres, Twoje ciało i umysł pilnie potrzebują odpoczynku.",
    related: ["dana", "sisxli", "sikvdili"],
  },
  {
    slug: "dana",
    title: "Nóż",
    glyph: "🔪",
    summary:
      "Nóż symbolizuje rozróżnianie, decyzje, a czasem ból – tnie, dzieli i uwalnia.",
    meaning:
      "Nóż ma podwójne znaczenie: w Twojej ręce ma cel, rozróżnianie, jasność, przecinanie węzła. W ręce innej osoby oznacza niebezpieczeństwo i strach przed zdradą. Zranienie oznacza ból od słów, które jeszcze się nie zagoiły.",
    variants: [
      {
        when: "Trzymasz nóż i coś kroisz",
        means:
          "Decyzja i jasność, odcinasz nadmiar i zachowujesz to, co istotne.",
      },
      {
        when: "Ktoś grozi Ci nożem",
        means:
          "Ostrzeżenie: czyjeś słowa lub czyny Cię ranią. Strzeż swoich granic.",
      },
      {
        when: "Jesteś zraniony i krwawisz",
        means:
          "Emocjonalna rana wymagająca uwagi. Gojenie wymaga czasu i szczerości.",
      },
    ],
    positive:
      "Nowy, ostry nóż sygnalizuje bystry umysł, Twoje decyzje są teraz precyzyjne.",
    caution:
      "Zardzewiały lub złamany nóż ostrzega, że stare urazy Cię hamują – odpuść je.",
    related: ["omi", "sisxli", "sikvdili"],
  },
];

export const DREAM_BY_SLUG_PL: Record<string, DreamSymbolPl> =
  Object.fromEntries(DREAM_SYMBOLS_PL.map((d) => [d.slug, d]));

export const DREAM_PL_BY_SLUG = DREAM_BY_SLUG_PL;

export const DREAMS_HUB_PL = {
  title: "Sennik Online A–Z: Znaczenie Snów i Symbole",
  description:
    "Poznaj znaczenie ponad 60 popularnych symboli sennych: wąż, woda, wypadające zęby, słońce, księżyc, pies, egzamin i wojna. Tradycyjne i psychologiczne interpretacje snów oraz darmowa analiza AI.",
};

export const DREAMS_FAQ_PL = [
  {
    q: "Czy sny przepowiadają przyszłość?",
    a: "Nie ma naukowych dowodów na to, że zwykłe sny przepowiadają przyszłe wydarzenia. Zdecydowanie częściej są one odzwierciedleniem emocji, wspomnień, ukrytych lęków i codziennych doświadczeń przetwarzanych przez mózg podczas snu.",
  },
  {
    q: "Dlaczego ten sam symbol senny ma różne znaczenia dla różnych osób?",
    a: "Kluczowe są osobiste skojarzenia. Dla jednej osoby pies symbolizuje wierność i poczucie bezpieczeństwa, a dla kogoś, kto został pogryziony w dzieciństwie – lęk i zagrożenie. Kontekst życiowy i odczuwane emocje są ważniejsze niż sztywna definicja w senniku.",
  },
  {
    q: "Dlaczego niektóre sny powtarzają się wielokrotnie?",
    a: "Sny powracające najczęściej towarzyszą nierozwiązanym konfliktom wewnętrznym, przewlekłemu stresowi lub powtarzającym się schematom w życiu. Zapisywanie okoliczności poprzedzających sen pomaga zrozumieć jego źródło.",
  },
];
