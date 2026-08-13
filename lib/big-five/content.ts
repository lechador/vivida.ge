/**
 * Georgian marketing / SEO copy for the Big Five test page. Kept here (not
 * inline in the route) so it goes through the same Vertex grammar pass as the
 * items and interpretations — see scripts/proofread-bigfive.mjs.
 */

export const BIG5_META_DESCRIPTION =
  "გაიარე პიროვნების დიდი ხუთეულის (Big Five) უფასო ტესტი ქართულად. აღმოაჩინე შენი პროფილი ხუთი მეცნიერულად დადასტურებული თვისების მიხედვით: ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნევროტიზმი. 40 კითხვა, 5-7 წუთი. მიიღე შედეგი მყისიერად, რეგისტრაციის გარეშე.";

export const BIG5_INTRO: string[] = [
  "დიდი ხუთეული (Big Five, იგივე OCEAN) პიროვნების ერთ-ერთი ყველაზე ავტორიტეტული და მეცნიერულად დასაბუთებული მოდელია. MBTI-სგან განსხვავებით, ის ადამიანებს ტიპებად კი არ ყოფს, არამედ ხუთ დამოუკიდებელ თვისებას ზომავს — თითოეულს დაბლიდან მაღალ მაჩვენებლამდე.",
  "ტესტში „სწორი“ და „არასწორი“ პასუხები არ არსებობს. თითოეული თვისების ორივე პოლუსი — მაღალიც და დაბალიც — თანაბრად ღირებულია და უბრალოდ განსხვავებულ პიროვნულ მახასიათებლებს აღწერს. შედეგი გაჩვენებს, სად იმყოფები ხუთივე თვისების შკალაზე და როგორია შენი უნიკალური პროფილი.",
];

export const BIG5_FAQ: { q: string; a: string }[] = [
  {
    q: "რა არის დიდი ხუთეული (Big Five)?",
    a: "დიდი ხუთეული პიროვნების ფსიქოლოგიური მოდელია, რომელიც ხასიათს ხუთი ძირითადი განზომილებით აღწერს: ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნევროტიზმი. ეს აკადემიურ ფსიქოლოგიაში ყველაზე ფართოდ გამოყენებული და კვლევებით დადასტურებული მოდელია.",
  },
  {
    q: "როგორ ითვლება შედეგი?",
    a: "თითოეულ კითხვას 5-ბალიან სკალაზე პასუხობ. ყოველი თვისების შესაბამისი პასუხები ჯამდება, შებრუნებული კითხვები კი თანხმობისკენ მიდრეკილების დაბალანსებას ემსახურება. თითოეული თვისება 0-დან 100-მდე ფასდება. საერთო ქულა არ არსებობს — შედეგი ხუთი დამოუკიდებელი თვისებისგან შემდგარი პროფილია.",
  },
  {
    q: "Big Five თუ MBTI — რა განსხვავებაა?",
    a: "MBTI ადამიანს 16 ტიპიდან ერთ-ერთს მიაკუთვნებს, დიდი ხუთეული კი ხუთ თვისებას ცალკეულ შკალებზე ზომავს. ამ მიდგომით Big Five უკეთ ასახავს ნიუანსებს: ადამიანები მკვეთრად გამიჯნულ ტიპებად კი არ იყოფიან, არამედ თითოეულ თვისებაზე სხვადასხვა მაჩვენებელი აქვთ.",
  },
  {
    q: "ტესტი უფასოა და საჭიროა თუ არა რეგისტრაცია?",
    a: "ტესტის გავლა და ძირითადი პროფილის მიღება უფასოდ, რეგისტრაციის გარეშე შეგიძლია. თითოეული თვისების დეტალური ანალიზის სანახავად უფასო რეგისტრაციაა საჭირო.",
  },
  {
    q: "რამდენად ზუსტია ტესტი?",
    a: "ეს თვითშეფასების ტესტია — ის ასახავს იმას, თუ როგორ აღიქვამ საკუთარ თავს. შედეგი სანდო ორიენტირს გაძლევს, თუმცა ის კლინიკური დიაგნოზი არ არის.",
  },
];

export const BIG5_META_DESCRIPTION_EN = "Take a free 40-question Big Five personality test and explore your openness, conscientiousness, extraversion, agreeableness and neuroticism profile.";

export const BIG5_INTRO_EN = [
  "The Big Five, also known as OCEAN, is one of the most widely researched models of personality. Rather than assigning a fixed type, it measures five broad traits on continuous scales.",
  "There are no correct or incorrect answers. Both ends of every trait describe valid tendencies, and the result shows the distinctive shape of your five-trait profile.",
];

export const BIG5_FAQ_EN = [
  { q: "What is the Big Five personality model?", a: "The Big Five describes personality through openness, conscientiousness, extraversion, agreeableness and neuroticism. It is widely used in contemporary personality research." },
  { q: "How is the result calculated?", a: "Each statement uses a five-point agreement scale. Reverse-keyed items balance agreement bias, and each trait is scored independently from 0 to 100. There is no single overall score." },
  { q: "How is Big Five different from MBTI?", a: "MBTI assigns one of sixteen types, while Big Five measures five traits on continuous scales. That makes it easier to represent nuance and mixed tendencies." },
  { q: "Is the test free?", a: "The assessment and core five-trait profile are free. An account lets you save the result, while any optional deeper analysis is clearly marked before using credits." },
  { q: "Is this a clinical assessment?", a: "No. It is a self-report tool for reflection and is not a diagnosis or substitute for professionally administered assessment." },
];
