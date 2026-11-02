/**
 * Rosenberg Self-Esteem Scale (RSES).
 *
 * Morris Rosenberg's original ten-item order is preserved. The scale is in the
 * public domain; this Georgian translation is written for Vivida. Responses
 * use the original four-point agreement format with no neutral option.
 *
 * Public-domain notice and scoring references:
 * https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale
 * https://www.apa.org/obesity-guideline/rosenberg-self-esteem.pdf
 */

export type RosenbergQuestion = {
  id: number;
  textKa: string;
  textEn: string;
  textPl: string;
  /** Agreement lowers self-esteem for negatively worded items. */
  reverse: boolean;
  themeKa: string;
  themeEn: string;
  themePl: string;
  strengthKa: string;
  strengthEn: string;
  strengthPl: string;
  reflectionKa: string;
  reflectionEn: string;
  reflectionPl: string;
};

export const ROSENBERG_OPTIONS = [
  {
    value: 4,
    labelKa: "სრულიად ვეთანხმები",
    labelEn: "Strongly agree",
    labelPl: "Zdecydowanie się zgadzam",
  },
  {
    value: 3,
    labelKa: "ვეთანხმები",
    labelEn: "Agree",
    labelPl: "Zgadzam się",
  },
  {
    value: 2,
    labelKa: "არ ვეთანხმები",
    labelEn: "Disagree",
    labelPl: "Nie zgadzam się",
  },
  {
    value: 1,
    labelKa: "სრულიად არ ვეთანხმები",
    labelEn: "Strongly disagree",
    labelPl: "Zdecydowanie się nie zgadzam",
  },
] as const;

export const ROSENBERG_QUESTIONS: RosenbergQuestion[] = [
  {
    id: 1,
    reverse: false,
    textKa: "ზოგადად, საკუთარი თავით კმაყოფილი ვარ.",
    textEn: "On the whole, I am satisfied with myself.",
    textPl: "Ogólnie rzecz biorąc, jestem z siebie zadowolony/-a.",
    themeKa: "საკუთარი თავის მიღება",
    themeEn: "Self-acceptance",
    themePl: "Samoakceptacja",
    strengthKa:
      "შეგიძლია საკუთარი თავი მთლიანობაში მიიღო, მხოლოდ ცალკეული შეცდომებით არ განსაზღვრავ საკუთარ ღირებულებას.",
    strengthEn:
      "You can accept yourself as a whole instead of letting single mistakes define your worth.",
    strengthPl:
      "Potrafisz zaakceptować siebie jako całość, zamiast pozwalać, by pojedyncze błędy decydowały o Twojej wartości.",
    reflectionKa:
      "დააკვირდი, ხომ არ ვრცელდება ერთი კონკრეტული უკმაყოფილება მთლიანად საკუთარ თავზე.",
    reflectionEn:
      "Notice whether one specific dissatisfaction is spreading to how you see yourself as a whole.",
    reflectionPl:
      "Zwróć uwagę, czy jedno konkretne niezadowolenie nie rzutuje na to, jak postrzegasz całą swoją osobę.",
  },
  {
    id: 2,
    reverse: true,
    textKa: "ზოგჯერ ვფიქრობ, რომ საერთოდ არაფრად ვვარგივარ.",
    textEn: "At times I think I am no good at all.",
    textPl: "Czasami myślę, że do niczego się nie nadaję.",
    themeKa: "შინაგანი კრიტიკოსი",
    themeEn: "Inner critic",
    themePl: "Wewnętrzny krytyk",
    strengthKa: "მკაცრი თვითკრიტიკული აზრი შენთვის ფაქტად მარტივად არ იქცევა.",
    strengthEn:
      "Harsh self-critical thoughts do not easily turn into facts for you.",
    strengthPl:
      "Szorstkie, samokrytyczne myśli nie stają się dla Ciebie łatwo niepodważalnymi faktami.",
    reflectionKa:
      "როცა აზრი „არაფრად ვვარგივარ“ ჩნდება, სცადე კონკრეტულად დაასახელო, რა ვერ გამოვიდა, ერთი შემთხვევა მთელ შენს პიროვნებას არ აღწერს.",
    reflectionEn:
      "When the thought “I am no good” appears, try naming specifically what did not work out. One occasion does not describe your whole personality.",
    reflectionPl:
      "Gdy pojawia się myśl „do niczego się nie nadaję”, spróbuj nazwać konkretnie, co nie wyszło — jedno potknięcie nie definiuje całej Twojej wartości.",
  },
  {
    id: 3,
    reverse: false,
    textKa: "ვფიქრობ, რომ არაერთი კარგი თვისება მაქვს.",
    textEn: "I feel that I have a number of good qualities.",
    textPl: "Uważam, że mam wiele dobrych cech.",
    themeKa: "კარგი თვისებების დანახვა",
    themeEn: "Seeing your good qualities",
    themePl: "Dostrzeganie swoich zalet",
    strengthKa: "საკუთარ ძლიერ მხარეებს ამჩნევ და მათ მნიშვნელობას აღიარებ.",
    strengthEn: "You notice your strengths and acknowledge that they matter.",
    strengthPl:
      "Dostrzegasz swoje mocne strony i doceniasz ich realne znaczenie.",
    reflectionKa:
      "გაიხსენე ერთი კარგი თვისება და ბოლო შემთხვევა, როცა ის რეალურ მოქმედებაში გამოავლინე.",
    reflectionEn:
      "Recall one good quality and a recent moment when you showed it in real action.",
    reflectionPl:
      "Przypomnij sobie jedną swoją dobrą cechę i niedawną sytuację, w której pokazałeś/-aś ją w działaniu.",
  },
  {
    id: 4,
    reverse: false,
    textKa: "ვფიქრობ, საქმეებს ადამიანების უმეტესობასავით კარგად ვაკეთებ.",
    textEn: "I am able to do things as well as most other people.",
    textPl:
      "Potrafię robić różne rzeczy tak samo dobrze, jak większość innych ludzi.",
    themeKa: "საკუთარი შესაძლებლობების ნდობა",
    themeEn: "Trust in your abilities",
    themePl: "Zaufanie do własnych umiejętności",
    strengthKa:
      "საკუთარ შესაძლებლობებს სხვებთან მუდმივი დაკნინების გარეშე აფასებ.",
    strengthEn:
      "You assess your abilities without constantly diminishing yourself next to others.",
    strengthPl:
      "Oceniasz swoje możliwości bez ciągłego umniejszania sobie na tle innych.",
    reflectionKa:
      "შეამოწმე, საკუთარ თავს სამართლიანი საზომით ადარებ თუ მხოლოდ სხვის საუკეთესო შედეგებს ხედავ.",
    reflectionEn:
      "Check whether you measure yourself by a fair standard or only notice other people's best results.",
    reflectionPl:
      "Zastanów się, czy mierzysz siebie sprawiedliwą miarą, czy zauważasz tylko cudze najlepsze sukcesy.",
  },
  {
    id: 5,
    reverse: true,
    textKa: "ვგრძნობ, რომ ბევრი არაფერი მაქვს საამაყო.",
    textEn: "I feel I do not have much to be proud of.",
    textPl: "Mam wrażenie, że nie mam zbyt wielu powodów do dumy.",
    themeKa: "საკუთარი მიღწევების აღიარება",
    themeEn: "Recognizing your achievements",
    themePl: "Uznawanie własnych osiągnięć",
    strengthKa: "შეგიძლია შენს ძალისხმევასა და მიღწევებს მნიშვნელობა მიანიჭო.",
    strengthEn:
      "You can give meaning to your effort and what you have achieved.",
    strengthPl:
      "Potrafisz nadać wartość swojemu wysiłkowi i temu, co udało Ci się osiągnąć.",
    reflectionKa:
      "ჩამოწერე ერთი რამ, რომლისთვისაც ძალისხმევა გაიღე, მაშინაც კი, თუ შედეგი იდეალური არ ყოფილა.",
    reflectionEn:
      "Write down one thing you put effort into, even if the result was not ideal.",
    reflectionPl:
      "Zapisz jedną rzecz, w którą włożyłeś/-aś wysiłek, nawet jeśli ostateczny rezultat nie był idealny.",
  },
  {
    id: 6,
    reverse: true,
    textKa: "ზოგჯერ თავს მართლაც უსარგებლოდ ვგრძნობ.",
    textEn: "I certainly feel useless at times.",
    textPl: "Czasami czuję się naprawdę bezużyteczny/-a.",
    themeKa: "საკუთარი მნიშვნელობის განცდა",
    themeEn: "Sense of your own worth",
    themePl: "Poczucie własnej wartości",
    strengthKa:
      "რთულ მომენტშიც შეგიძლია საკუთარი მნიშვნელობა მხოლოდ პროდუქტიულობას არ მიაბა.",
    strengthEn:
      "Even in difficult moments you can keep your sense of worth separate from your productivity.",
    strengthPl:
      "Nawet w trudnych chwilach potrafisz oddzielić poczucie własnej wartości od bieżącej produktywności.",
    reflectionKa:
      "შენი ღირებულება მხოლოდ იმით არ განისაზღვრება, რამდენს აკეთებ სხვებისთვის ან რამდენად პროდუქტიული ხარ.",
    reflectionEn:
      "Your worth is not determined only by how much you do for others or how productive you are.",
    reflectionPl:
      "Twoja wartość jako człowieka nie zależy wyłącznie od tego, ile robisz dla innych ani jak bardzo jesteś produktywny/-a.",
  },
  {
    id: 7,
    reverse: false,
    textKa: "ვგრძნობ, რომ მეც ისეთივე ღირებული ადამიანი ვარ, როგორიც სხვები.",
    textEn:
      "I feel that I am a person of worth, at least on an equal plane with others.",
    textPl:
      "Czuję, że jestem osobą wartościową, przynajmniej na równi z innymi.",
    themeKa: "თანასწორი ღირებულების განცდა",
    themeEn: "Sense of equal worth",
    themePl: "Poczucie równej wartości",
    strengthKa: "საკუთარ თავს სხვების თანასწორად ღირებულ ადამიანად აღიქვამ.",
    strengthEn: "You see yourself as a person of worth, equal to others.",
    strengthPl:
      "Postrzegasz siebie jako osobę wartościową i równą innym ludziom.",
    reflectionKa:
      "დააკვირდი ურთიერთობებსა და გარემოებებს, სადაც საკუთარ საჭიროებებს სხვისაზე ნაკლებად მნიშვნელოვნად მიიჩნევ.",
    reflectionEn:
      "Notice the relationships and situations where you treat your own needs as less important than other people's.",
    reflectionPl:
      "Zwróć uwagę na relacje i sytuacje, w których traktujesz własne potrzeby jako mniej ważne niż potrzeby innych.",
  },
  {
    id: 8,
    reverse: true,
    textKa: "ვისურვებდი, საკუთარი თავის მიმართ მეტი პატივისცემა მქონდეს.",
    textEn: "I wish I could have more respect for myself.",
    textPl: "Chciał(a)bym mieć dla siebie więcej szacunku.",
    themeKa: "საკუთარი თავის პატივისცემა",
    themeEn: "Self-respect",
    themePl: "Szacunek do samego siebie",
    strengthKa:
      "საკუთარი თავის მიმართ პატივისცემას უკვე საკმაოდ მყარად გრძნობ.",
    strengthEn: "You already feel a fairly steady respect for yourself.",
    strengthPl:
      "Odczuwasz już dość stabilny i ugruntowany szacunek do samego siebie.",
    reflectionKa:
      "იფიქრე ერთ პატარა ქმედებაზე, რომლითაც საკუთარ საზღვრებს, საჭიროებებს ან შრომას მეტ პატივს სცემ.",
    reflectionEn:
      "Think of one small action through which you honor your boundaries, your needs or your work a little more.",
    reflectionPl:
      "Pomyśl o jednym małym działaniu, przez które możesz bardziej uszanować swoje granice, potrzeby lub włożoną pracę.",
  },
  {
    id: 9,
    reverse: true,
    textKa: "საერთო ჯამში, მგონია, რომ წარუმატებელი ადამიანი ვარ.",
    textEn: "All in all, I am inclined to feel that I am a failure.",
    textPl:
      "Ogólnie rzecz biorąc, mam skłonność uważać się za osobę przegraną.",
    themeKa: "წარუმატებლობის განცდა",
    themeEn: "Sense of failure",
    themePl: "Poczucie porażki",
    strengthKa:
      "ცალკეულ წარუმატებლობას საკუთარი პიროვნების საბოლოო შეფასებად არ აქცევ.",
    strengthEn:
      "You do not turn individual setbacks into a final verdict on who you are.",
    strengthPl:
      "Nie zamieniasz pojedynczych niepowodzeń w ostateczny wyrok na temat tego, kim jesteś.",
    reflectionKa:
      "სცადე ერთმანეთისგან გამიჯნო „რაღაც ვერ გამომივიდა“ და „მე წარუმატებელი ვარ“, პირველი გამოცდილებაა, მეორე კი მკაცრი განაჩენი.",
    reflectionEn:
      "Try separating “something did not work out” from “I am a failure”. The first is an experience, the second is a harsh verdict.",
    reflectionPl:
      "Spróbuj rozgraniczyć „coś mi nie wyszło” od „jestem przegrany/-a” — to pierwsze to doświadczenie, to drugie to surowy wyrok.",
  },
  {
    id: 10,
    reverse: false,
    textKa: "საკუთარი თავის მიმართ დადებითი დამოკიდებულება მაქვს.",
    textEn: "I take a positive attitude toward myself.",
    textPl: "Mam pozytywne nastawienie do samego siebie.",
    themeKa: "დადებითი დამოკიდებულება საკუთარი თავისადმი",
    themeEn: "Positive attitude toward yourself",
    themePl: "Pozytywny stosunek do siebie",
    strengthKa:
      "საკუთარ თავთან ურთიერთობაში დადებითი და მხარდამჭერი დამოკიდებულება ჩანს.",
    strengthEn:
      "Your relationship with yourself shows a positive and supportive attitude.",
    strengthPl:
      "W Twojej relacji z samym sobą widać wspierające, pełne życzliwości nastawienie.",
    reflectionKa:
      "შეამჩნიე, როგორ ელაპარაკები საკუთარ თავს შეცდომის შემდეგ, იმავე ტონით დაელაპარაკებოდი ახლობელ ადამიანს?",
    reflectionEn:
      "Notice how you speak to yourself after a mistake. Would you speak to someone close to you in the same tone?",
    reflectionPl:
      "Zauważ, jakim tonem rozmawiasz ze sobą po popełnieniu błędu — czy odezwał(a)byś się w ten sposób do kogoś bliskiego?",
  },
];

export const ROSENBERG_QUESTION_COUNT = ROSENBERG_QUESTIONS.length;
