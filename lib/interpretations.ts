/**
 * Curated Georgian interpretations for the natal chart "big three":
 * Sun (core identity), Moon (emotional inner world), Ascendant (social mask).
 *
 * Polished by Gemini 2.5 Pro (see scripts/translate-interpretations.ts) for
 * natural Georgian phrasing. Used as the offline fallback and as the seed
 * passed into the AI augmentation prompt.
 */

import { SIGNS } from "./zodiac";
import type { UserLocale } from "@/lib/i18n/user-locale";

type BigThreeKind = "sun" | "moon" | "ascendant";

const SUN_KA: Record<string, string> = {
  aries: "შენი მზე ვერძშია — შენ ხარ პიონერი, რომელიც არასდროს ყოვნდება. მოქმედება შენი ენაა; შენი შემოსვლისთანავე ოთახის ენერგია იცვლება.",
  taurus: "მზე კუროში — შენთვის მთავარია მუდმივობა და სიმშვიდე. აფასებ იმას, რასაც ხელით ეხები: ხელშესახებ სილამაზეს, კომფორტს და იმას, რაც დროს უძლებს.",
  gemini: "მზე ტყუპებში — ცნობისმოყვარეობა შენი საწვავია. მრავალფეროვანი საუბარი, სწრაფი აზროვნება და ცოცხალი დიალოგი შენი სტიქიაა.",
  cancer: "მზე კირჩხიბში — შენი ბირთვი ზრუნვა და დაცულობის შექმნაა. სახლს იქაც ქმნი, სადაც სხვები მხოლოდ ოთახს ხედავენ.",
  leo: "მზე ლომში — შენი არსი გულუხვი მზის სხივია. ცხოვრობ ისე, თითქოს სცენაზე იდგე — და ეს ცარიელი ბრწყინვალება კი არა, გულის სითბოა.",
  virgo: "მზე ქალწულში — დეტალებისადმი სიყვარული შენი ხელწერაა. გინდა, რომ ყველაფერი, რასაც აკეთებ, იდეალურად იყოს შესრულებული და ამ უნარს სხვებსაც უზიარებ.",
  libra: "მზე სასწორში — სილამაზე და ბალანსი შენი მთავარი ღირებულებებია. შენი ყოველი მოძრაობაც კი თითქოს ერთიანი კომპოზიციის ნაწილია.",
  scorpio: "მზე მორიელში — შენი ძალა იქ იღვიძებს, სადაც სხვები ფიქრსაც კი ერიდებიან. შეუპოვარი მზერით, ცხოვრების სიღრმეებს გაბედულად ეთამაშები.",
  sagittarius: "მზე მშვილდოსანში — სიმართლე და თავისუფლება შენი მთავარი ცეცხლია. გინდა, მუდმივად აფართოებდე ჰორიზონტს და შენი ნაპოვნი ჭეშმარიტება ცხოვრების წესად აქციო.",
  capricorn: "მზე თხის რქაში — შენი ძალა მოთმინებასა და გრძელვადიან მიზნებშია. ნაბიჯ-ნაბიჯ, წლების განმავლობაში აშენებ იმას, რაზეც სხვები მხოლოდ ოცნებობენ.",
  aquarius: "მზე მერწყულში — განსხვავებულობა შენი ხელწერაა. შენი გონება მომავლის ფანჯარას ჰგავს — ამიტომაც ხედავ ყოველთვის ერთი ნაბიჯით წინ.",
  pisces: "მზე თევზებში — შენი შინაგანი სამყარო მრავალფეროვანი და ცვალებადია. უმეტესობაზე ბევრად მგრძნობიარე ხარ და შენი მეშვეობით სამყარო უფრო თანამგრძნობი ხდება.",
};

const SUN_AM: Record<string, string> = {
  aries: "Քո Արևը Խոյում է — դու նախաձեռնող ես, ով երբեք չի վարանում: Գործողությունը քո լեզուն է. քո հայտնվելուն պես սենյակի էներգիան փոխվում է:",
  taurus: "Արևը Ցուլում — քեզ համար կարևոր են կայունությունն ու անդորրը: Գնահատում ես այն, ինչին կարող ես դիպչել՝ շոշափելի գեղեցկությունը, հարմարավետությունը և այն, ինչ դիմանում է ժամանակին:",
  gemini: "Արևը Երկվորյակներում — հետաքրքրասիրությունը քո շարժիչ ուժն է: Բազմակողմանի զրույցները, արագ միտքը և կենդանի երկխոսությունը քո տարերքն են:",
  cancer: "Արևը Խեցգետնում — քո հիմքը հոգատարությունն ու պաշտպանվածության ստեղծումն է: Տուն ես ստեղծում նույնիսկ այնտեղ, որտեղ ուրիշները տեսնում են միայն սենյակ:",
  leo: "Արևը Առյուծում — քո էությունը առատաձեռն արևի ճառագայթ է: Ապրում ես այնպես, կարծես բեմում լինես՝ և դա ոչ թե դատարկ փայլ է, այլ սրտի ջերմություն:",
  virgo: "Արևը Կույսում — մանրուքների հանդեպ սերը քո ձեռագիրն է: Ցանկանում ես, որ ամեն ինչ կատարյալ արվի, և այդ ունակությունը կիսում ես ուրիշների հետ:",
  libra: "Արևը Կշեռքում — գեղեցկությունն ու ներդաշնակությունը քո գլխավոր արժեքներն են: Քո ամեն մի շարժումը ներդաշնակ կոմպոզիցիայի մաս է:",
  scorpio: "Արևը Կարիճում — քո ուժն արթնանում է այնտեղ, որտեղ ուրիշները նույնիսկ մտածելուց են խուսափում: Խորը հայացքով խիզախորեն ուսումնասիրում ես կյանքի խորությունները:",
  sagittarius: "Արևը Աղեղնավորում — ճշմարտությունն ու ազատությունը քո ներքին կրակն են: Ցանկանում ես անընդհատ ընդլայնել հորիզոնները և գտած իմաստությունը դարձնել կյանքի ուղեցույց:",
  capricorn: "Արևը Այծեղջյուրում — քո ուժը համբերության և երկարաժամկետ նպատակների մեջ է: Քայլ առ քայլ, տարիների ընթացքում կառուցում ես այն, ինչի մասին ուրիշները միայն երազում են:",
  aquarius: "Արևը Ջրհոսում — ինքնատիպությունը քո ձեռագիրն է: Քո միտքը ապագայի պատուհան է, այդ պատճառով միշտ մեկ քայլ առաջ ես տեսնում:",
  pisces: "Արևը Ձկներում — քո ներքին աշխարհը հարուստ է և բազմաշերտ: Շատ ավելի զգայուն ես, քան շրջապատը, և քո շնորհիվ աշխարհն ավելի կարեկից է դառնում:",
};

const SUN_EN: Record<string, string> = {
  aries: "Your Sun is in Aries — you are a trailblazer who never hesitates. Action is your native language; your presence immediately shifts the room's momentum.",
  taurus: "Sun in Taurus — stability and grounded calm are your core. You value what is tangible: lasting beauty, comfort, and enduring strength.",
  gemini: "Sun in Gemini — curiosity is your engine. Versatile conversations, fast associative thinking, and vibrant dialogue are your natural element.",
  cancer: "Sun in Cancer — your core is protection and emotional sheltering. You create a sense of home wherever you go.",
  leo: "Sun in Leo — your essence is radiant warmth and generosity. You show up with genuine heart and joyful creative expression.",
  virgo: "Sun in Virgo — devotion to craft and thoughtful refinement are your hallmarks. You bring order and helpful clarity to everything you touch.",
  libra: "Sun in Libra — balance, aesthetic grace, and harmonious connection define your path. You seek beauty and fair proportion.",
  scorpio: "Sun in Scorpio — your strength awakens where others look away. With penetrating insight, you navigate life's deeper currents.",
  sagittarius: "Sun in Sagittarius — truth and expansive freedom are your inner flame. You seek to broaden horizons and turn discoveries into wisdom.",
  capricorn: "Sun in Capricorn — your mastery lies in patience and sustained achievement. Step by step, you build what endures.",
  aquarius: "Sun in Aquarius — originality and visionary clarity are your signature. Your mind naturally looks toward tomorrow.",
  pisces: "Sun in Pisces — your inner world is rich, fluid, and empathetic. You bring deep compassion and imaginative depth to life.",
};

const MOON_KA: Record<string, string> = {
  aries: "მთვარე ვერძში — შენი გრძნობები მძაფრი და იმპულსურია. სიმშვიდეს პოულობ, როცა ემოციას მოქმედებაში თარგმნი. ყოყმანი და უმოქმედობა კი გაღიზიანებს.",
  taurus: "მთვარე კუროში — სიმშვიდეს გაძლევს სტაბილურობა, სასიამოვნო შეხება და ნაცნობი ბგერები. შენი ემოციური სამყარო მყარია და მისი შერყევა რთულია.",
  gemini: "მთვარე ტყუპებში — ემოციურ სიმშვიდეს პოულობ, როცა გრძნობებს სიტყვებით გამოხატავ. სიჩუმე გთრგუნავს, დიალოგი კი — გხსნის.",
  cancer: "მთვარე კირჩხიბში — შენი გრძნობები ღრმა და ცვალებადია, როგორც ზღვის ტალღები. სიმშვიდეს გჩუქნის ოჯახური სითბო, წყლის ხმა და ნაცნობი სურნელი.",
  leo: "მთვარე ლომში — აღიარება ფუფუნება კი არა, ჰაერივით გჭირდება. როცა გიყვარს, გიყვარს დიდად, ან საერთოდ არა.",
  virgo: "მთვარე ქალწულში — წესრიგი სიმშვიდეს განიჭებს. ემოციებში ანალიზით ერკვევი — ხანდახან ჯანსაღად, ხანდახან კი ცოტა ზედმეტად.",
  libra: "მთვარე სასწორში — ემოციურ სიმშვიდეს მაშინ გრძნობ, როცა ურთიერთობები ჰარმონიულია. კონფლიქტი კი იმაზე ბევრად მძიმედ გადაგაქვს, ვიდრე ჩანს.",
  scorpio: "მთვარე მორიელში — შენი ემოციები ინტენსიური და დაფარულია. ცოტას ენდობი, მაგრამ ვისაც ენდობი — ბოლომდე.",
  sagittarius: "მთვარე მშვილდოსანში — სიმშვიდეს განიჭებს მოძრაობა, ახალი იდეები და შორეული ჰორიზონტები. ერთ ადგილას დიდხანს გაჩერება ემოციურად გფიტავს.",
  capricorn: "მთვარე თხის რქაში — სიმშვიდეს განიჭებს კონტროლის შეგრძნება, პასუხისმგებლობა და კონკრეტული მიღწევები. ემოციურად, ხშირად ნაადრევად ზრდასრულდები.",
  aquarius: "მთვარე მერწყულში — ემოციური თავისუფლება გჭირდება. გრძნობებს ხშირად გონებით აანალიზებ და სწორედ ეს ლოგიკა გეხმარება ემოციური ბურუსიდან გამოსვლაში.",
  pisces: "მთვარე თევზებში — შენი ემოციები ღრმა და უსაზღვროა, ზოგჯერ კი — უკონტროლოდ მძაფრი. სიმშვიდეს ხელოვნებაში, წყალთან და სიჩუმეში პოულობ.",
};

const MOON_AM: Record<string, string> = {
  aries: "Լուսինը Խոյում — քո զգացմունքները բուռն են և ազդեցիկ: Հանգստություն ես գտնում, երբ էմոցիան վերածում ես գործողության: Տատանումներն ու անգործությունը հոգնեցնում են քեզ:",
  taurus: "Լուսինը Ցուլում — հանգստություն են պարգևում կայունությունը, հաճելի շփումը և ծանոթ միջավայրը: Քո էմոցիոնալ աշխարհն ամուր է և դժվար խոցելի:",
  gemini: "Լուսինը Երկվորյակներում — էմոցիոնալ հանգստություն ես գտնում, երբ զգացմունքներդ արտահայտում ես բառերով: Լռությունը ճնշում է, իսկ երկխոսությունը՝ բացում:",
  cancer: "Լուսինը Խեցգետնում — զգացմունքներդ խորն են ու փոփոխական՝ ինչպես ծովի ալիքները: Քեզ խաղաղություն են տալիս ընտանեկան ջերմությունը, ջրի ձայնը և հարազատ բույրերը:",
  leo: "Լուսինը Առյուծում — ճանաչումն ու գնահատանքը քեզ համար օդի պես անհրաժեշտ են: Երբ սիրում ես, սիրում ես ամբողջ սրտով կամ ընդհանրապես ոչ:",
  virgo: "Լուսինը Կույսում — կարգուկանոնը քեզ հանգստություն է պարգևում: Զգացմունքներդ հասկանում ես վերլուծության միջոցով՝ երբեմն առողջ, երբեմն մի փոքր չափից շատ:",
  libra: "Լուսինը Կշեռքում — էմոցիոնալ ներդաշնակություն ես զգում, երբ հարաբերությունները խաղաղ են: Կոնֆլիկտները տանում ես շատ ավելի ծանր, քան ցույց ես տալիս:",
  scorpio: "Լուսինը Կարիճում — քո էմոցիաները խորն են և գաղտնի: Քչերին ես վստահում, բայց նրանց, ում վստահում ես՝ ամբողջությամբ:",
  sagittarius: "Լուսինը Աղեղնավորում — քեզ հանգստություն են տալիս շարժումը, նոր գաղափարները և հեռավոր հորիզոնները: Մեկ տեղում երկար մնալը էմոցիոնալ առումով սպառում է քեզ:",
  capricorn: "Լուսինը Այծեղջյուրում — քեզ հանգստություն է տալիս իրավիճակը վերահսկելու զգացումը, պատասխանատվությունը և կոնկրետ հաջողությունները: Էմոցիոնալ առումով վաղ ես հասունանում:",
  aquarius: "Լուսինը Ջրհոսում — քեզ անհրաժեշտ է էմոցիոնալ ազատություն: Զգացմունքներդ հաճախ տրամաբանությամբ ես վերլուծում, և հենց այդ տրամաբանությունն է օգնում պահպանել հավասարակշռությունը:",
  pisces: "Լուսինը Ձկներում — քո զգացմունքներն անսահման են ու խորը, երբեմն՝ անկառավարելի: Հանգստություն ես գտնում արվեստում, բնության մեջ և լռության մեջ:",
};

const MOON_EN: Record<string, string> = {
  aries: "Moon in Aries — your feelings are direct, fiery, and immediate. You find inner peace by translating emotions into purposeful action.",
  taurus: "Moon in Taurus — emotional safety comes through stability, tactile warmth, and steady routines. Your feelings are steady and rooted.",
  gemini: "Moon in Gemini — you process emotions through language, questions, and open dialogue. Quiet containment feels stifling.",
  cancer: "Moon in Cancer — your feelings ebb and flow with deep intuitive sensitivity. You thrive in environments of warmth, memory, and heartfelt care.",
  leo: "Moon in Leo — emotional validation and heartfelt appreciation are essential to your spirit. When you love, you give generously.",
  virgo: "Moon in Virgo — order, helpful service, and thoughtful structure soothe your mind. You process feelings by finding practical solutions.",
  libra: "Moon in Libra — harmony in your connections is vital to your emotional equilibrium. You absorb relational friction deeply.",
  scorpio: "Moon in Scorpio — your emotional depth is intense, private, and fiercely loyal. You trust deeply once true safety is proven.",
  sagittarius: "Moon in Sagittarius — space, exploration, and philosophical perspective keep your spirit buoyant. Restriction depletes you.",
  capricorn: "Moon in Capricorn — emotional security is anchored in self-discipline, tangible accomplishments, and reliable boundaries.",
  aquarius: "Moon in Aquarius — you need emotional breathing room and rational clarity to understand what you feel.",
  pisces: "Moon in Pisces — your empathy is oceanic and boundaryless. You replenish in quiet contemplation, music, and imaginative space.",
};

const ASC_KA: Record<string, string> = {
  aries: "სხვების თვალში გაბედული და პირდაპირი ხარ — ადამიანი, რომელიც ყოყმანის ნაცვლად ყოველთვის მოქმედებას ირჩევს.",
  taurus: "პირველივე შეხვედრისას მშვიდი, საფუძვლიანი და ცოტათი ჯიუტი ადამიანის შთაბეჭდილებას ტოვებ. სხვებს უჩნდებათ განცდა, რომ შენი ნდობა შეიძლება.",
  gemini: "ცოცხალი, მსუბუქი და კომუნიკაბელური ჩანხარ — ის, ვინც ნებისმიერ გარემოში ადვილად იწყებს საუბარს და ყველას ღიმილს გვრის.",
  cancer: "გარეგნულად ნაზი და ფრთხილი ჩანხარ, ამიტომ სხვები შენ გვერდით უფრო თამამად იხსნებიან ემოციურად.",
  leo: "ღირსეული და სიცოცხლით სავსე ჩანხარ. შენი შემოსვლა, ხმაურის გარეშეც კი, ოთახის ენერგიას ცვლის.",
  virgo: "მართალია, ნელა იხსნები, მაგრამ შენი დაკვირვებულობა და სიფაქიზე მაშინვე შესამჩნევია. მშვიდი გონება შენი მთავარი ნიშანია.",
  libra: "ხიბლი, თავაზიანობა, გაწონასწორებული ხასიათი — ასეთ შთაბეჭდილებას ტოვებ პირველივე შეხვედრაზე.",
  scorpio: "ღრმა, გამჭოლი მზერა და მშვიდი დაკვირვება — სხვებს აქვთ განცდა, რომ შენ ისინი მანამდე „წაიკითხე“, სანამ ერთმანეთს გაეცნობოდით.",
  sagittarius: "ღია, კეთილგანწყობილი და თავგადასავლების მოყვარული ადამიანის შთაბეჭდილებას ტოვებ. სხვები გრძნობენ, რომ შენთან საუბარი თავისუფლებაა.",
  capricorn: "სერიოზული, თავშეკავებული და ღირსეული ჩანხარ. სხვებს აქვთ განცდა, რომ შენს სიტყვას ყოველთვის ფასი აქვს.",
  aquarius: "პირველივე შეხედვით უცნაური, მაგრამ ამავდროულად მიმზიდველი ხარ. შენნაირები სასიამოვნოდ არღვევენ სტანდარტულ ჩარჩოებს.",
  pisces: "ნაზი, ცოტა მისტიური ჩანხარ — ხალხი გრძნობს, რომ შენთან საუბარი სიტყვებზე ღრმად მიდის.",
};

const ASC_AM: Record<string, string> = {
  aries: "Ուրիշների աչքերում դու խիզախ և անմիջական ես՝ մարդ, ով տատանվելու փոխարեն միշտ ընտրում է գործողությունը:",
  taurus: "Առաջին հանդիպման պահին հանգիստ, հիմնավոր և հուսալի մարդու տպավորություն ես թողնում: Շրջապատի մոտ առաջանում է վստահության զգացում:",
  gemini: "Կենդանի, թեթև և շփվող ես թվում՝ նա, ով ցանկացած միջավայրում հեշտությամբ զրույց է սկսում և ժպիտ պարգևում:",
  cancer: "Արտաքուստ նուրբ և զգուշավոր ես թվում, ինչի շնորհիվ ուրիշները քո կողքին ավելի հեշտությամբ են բացվում էմոցիոնալ առումով:",
  leo: "Արժանապատիվ և կենսուրախ ես թվում: Քո հայտնվելը, նույնիսկ առանց աղմուկի, փոխում է սենյակի մթնոլորտը:",
  virgo: "Թեև դանդաղ ես բացվում, բայց քո ուշադրությունն ու նրբանկատությունը միանգամից նկատելի են: Խաղաղ միտքը քո գլխավոր առանձնահատկությունն է:",
  libra: "Հմայք, քաղաքավարություն և հավասարակշռված բնավորություն՝ հենց այսպիսի տպավորություն ես թողնում առաջին հայացքից:",
  scorpio: "Խորը, թափանցող հայացք և հանգիստ դիտողականություն՝ ուրիշները զգում են, որ դու նրանց «կարդացել ես» նախքան ծանոթանալը:",
  sagittarius: "Բաց, բարեհամբույր և արկածախնդիր մարդու տպավորություն ես թողնում: Շրջապատը զգում է, որ քեզ հետ շփվելը ազատություն է:",
  capricorn: "Լուրջ, զուսպ և արժանապատիվ ես թվում: Ուրիշները զգում են, որ քո խոսքը միշտ կշիռ ունի:",
  aquarius: "Առաջին հայացքից ինքնատիպ ես և միաժամանակ գրավիչ: Դու այն մարդկանցից ես, ովքեր հաճելիորեն կոտրում են ստանդարտ կարծրատիպերը:",
  pisces: "Նուրբ և մի փոքր խորհրդավոր ես թվում՝ մարդիկ զգում են, որ քեզ հետ շփումը շատ ավելի խորն է, քան սովորական բառերը:",
};

const ASC_EN: Record<string, string> = {
  aries: "In the eyes of others, you come across as courageous, decisive, and forthright — someone who leads with action.",
  taurus: "At first glance, you project calm presence, grounded patience, and reliability that others intuitively trust.",
  gemini: "You appear lively, quick-witted, and naturally engaging — someone who sparks conversations effortlessly.",
  cancer: "Your outer presence carries gentle empathy, inviting others to let their emotional guard down with ease.",
  leo: "You project radiant dignity and vibrant charisma. Your entrance naturally warms the room.",
  virgo: "Though measured at first, your keen observation and tasteful precision are immediately felt.",
  libra: "Grace, charm, and balanced tact define the first impression you make in any setting.",
  scorpio: "A perceptive, intense presence — people sense you perceive motives well before words are exchanged.",
  sagittarius: "You project openness, optimism, and an adventurous spirit that makes others feel free in your company.",
  capricorn: "You project grounded competence, poise, and authority. People respect your words instinctively.",
  aquarius: "Unconventional yet magnetic — you refreshingly step outside standard expectations.",
  pisces: "You carry a gentle, imaginative aura that invites conversations beyond the superficial surface.",
};

const SIGN_BLURBS_KA: Record<string, string> = {
  aries: "ცეცხლის კარდინალური ნიშანი — დაწყების ენერგია და გაბედული ინიციატივა.",
  taurus: "მიწის ფიქსირებული ნიშანი — სიმშვიდე, სიმყარე და ხელშესახები სილამაზე.",
  gemini: "ჰაერის მუტაბელური ნიშანი — ცნობისმოყვარეობა და უწყვეტი კომუნიკაცია.",
  cancer: "წყლის კარდინალური ნიშანი — ემოციური ბირთვი, სახლი და ზრუნვა.",
  leo: "ცეცხლის ფიქსირებული ნიშანი — სიამაყე, გულუხვობა და შემოქმედებითი ენერგია.",
  virgo: "მიწის მუტაბელური ნიშანი — დეტალები, წესრიგი და სხვების დახმარება.",
  libra: "ჰაერის კარდინალური ნიშანი — ბალანსი, ურთიერთობები, ესთეტიკა.",
  scorpio: "წყლის ფიქსირებული ნიშანი — სიღრმე, ტრანსფორმაცია, ერთგულება.",
  sagittarius: "ცეცხლის მუტაბელური ნიშანი — სიმართლე, თავისუფლება, ახალი ჰორიზონტები.",
  capricorn: "მიწის კარდინალური ნიშანი — დისციპლინა, მოთმინება, გრძელვადიანი მიზნები.",
  aquarius: "ჰაერის ფიქსირებული ნიშანი — ინოვაცია, ინდივიდუალიზმი, ორიგინალურობა.",
  pisces: "წყლის მუტაბელური ნიშანი — მგრძნობელობა, წარმოსახვა, მისტიკა.",
};

const SIGN_BLURBS_AM: Record<string, string> = {
  aries: "Կրակի կարդինալ նշան — սկզբի էներգիա և խիզախ նախաձեռնողականություն:",
  taurus: "Հողի ֆիքսված նշան — կայունություն, անդորր և շոշափելի գեղեցկություն:",
  gemini: "Օդի մուտաբել նշան — հետաքրքրասիրություն և անընդհատ շփում:",
  cancer: "Ջրի կարդինալ նշան — էմոցիոնալ հիմք, տուն և հոգատարություն:",
  leo: "Կրակի ֆիքսված նշան — արժանապատվություն, առատաձեռնություն և ստեղծագործ ուժ:",
  virgo: "Հողի մուտաբել նշան — դետալներ, կարգուկանոն և աջակցություն ուրիշներին:",
  libra: "Օդի կարդինալ նշան — հավասարակշռություն, հարաբերություններ և գեղագիտություն:",
  scorpio: "Ջրի ֆիքսված նշան — խորություն, վերափոխում և նվիրվածություն:",
  sagittarius: "Կրակի մուտաբել նշան — ճշմարտություն, ազատություն և նոր հորիզոններ:",
  capricorn: "Հողի կարդինալ նշան — կարգապահություն, համբերություն և երկարաժամկետ նպատակներ:",
  aquarius: "Օդի ֆիքսված նշան — նորարարություն, ինդիվիդուալիզմ և ինքնատիպություն:",
  pisces: "Ջրի մուտաբել նշան — զգայունություն, երևակայություն և խորհրդավորություն:",
};

const SIGN_BLURBS_EN: Record<string, string> = {
  aries: "Cardinal Fire sign — initiative, drive, and courageous beginnings.",
  taurus: "Fixed Earth sign — stability, endurance, and tactile beauty.",
  gemini: "Mutable Air sign — curiosity, communication, and versatile thought.",
  cancer: "Cardinal Water sign — emotional depth, protective care, and home.",
  leo: "Fixed Fire sign — radiant creativity, warmth, and generous expression.",
  virgo: "Mutable Earth sign — precision, helpful craft, and grounded clarity.",
  libra: "Cardinal Air sign — harmony, aesthetic grace, and balanced partnerships.",
  scorpio: "Fixed Water sign — transformative depth, insight, and loyal devotion.",
  sagittarius: "Mutable Fire sign — truth, expansive horizons, and free exploration.",
  capricorn: "Cardinal Earth sign — disciplined patience, mastery, and enduring ambition.",
  aquarius: "Fixed Air sign — innovative foresight, uniqueness, and community ideals.",
  pisces: "Mutable Water sign — intuitive empathy, artistic vision, and mysticism.",
};

/**
 * Get an interpretation paragraph for a single big-three placement in the target locale.
 * Falls back to a generic sign blurb if the specific key is unknown.
 */
export function staticInterpretation(
  kind: BigThreeKind,
  signKey: string,
  locale: UserLocale = "ka"
): string {
  let dict: Record<string, string>;
  let blurbs: Record<string, string>;
  let label: string | undefined;

  const sign = SIGNS.find((s) => s.key === signKey);

  if (locale === "am") {
    dict = kind === "sun" ? SUN_AM : kind === "moon" ? MOON_AM : ASC_AM;
    blurbs = SIGN_BLURBS_AM;
    label = sign?.labelAm;
  } else if (locale === "en") {
    dict = kind === "sun" ? SUN_EN : kind === "moon" ? MOON_EN : ASC_EN;
    blurbs = SIGN_BLURBS_EN;
    label = sign?.labelEn;
  } else {
    dict = kind === "sun" ? SUN_KA : kind === "moon" ? MOON_KA : ASC_KA;
    blurbs = SIGN_BLURBS_KA;
    label = sign?.labelKa;
  }

  return (
    dict[signKey] ??
    `${label ?? signKey} — ${
      blurbs[signKey] ?? (locale === "am" ? "Քո նշանի յուրահատուկ էներգիան:" : locale === "en" ? "Unique energy of your sign." : "შენი ნიშნის უნიკალური ენერგია.")
    }`
  );
}

export function signBlurb(signKey: string, locale: UserLocale = "ka"): string {
  if (locale === "am") return SIGN_BLURBS_AM[signKey] ?? "";
  if (locale === "en") return SIGN_BLURBS_EN[signKey] ?? "";
  return SIGN_BLURBS_KA[signKey] ?? "";
}
