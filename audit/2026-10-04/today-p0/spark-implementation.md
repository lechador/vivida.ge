P0 ბეთჩი შესრულებულია სამუშაო ხის /Users/giviendeladze/.hermes/cache/scratch/vivida-today-p0-spark-20261004 ფარგლებში. კომიტი/ფუში არ გაკეთებულა.

შეცვლილი ფაილები:

- components/dashboard/daily-card.tsx — ჰედლაინი + შეჯამება ყოველთვის ჩანს; გრძელი body და ტრანზიტები გადავიდა <details>/<summary> ბლოკში („დეტალები და ტრანზიტები" / „Details and transits"), მთლიანი კონტენტი შენარჩუნებულია. „read" სენტინელი შეჯამების პარაგრაფზეა — მონტაჟი onRead-ს არ იძახებს.
- components/dashboard/daily-dashboard.tsx — ექსტრა-ტალღაში DailyRitual (უფასო ინსაითი) პირველია, ProDailyBrief (PRO ფენა, პრემიუმისთვის სრულად ღია) მის ქვემოთ, შემდეგ weekly/ლოკი.
- app/dashboard/page.tsx — DailyDashboard პირველი კონტენტია, PopularTools (ტარო + AI) მის ქვემოთ; PhoneGiftPopup-ის მონტაჟი, phoneGiftPopupEligible იმპორტი და phoneGiftPopupDismissedAt/phoneVerifiedAt სელექტ-ველები წაშლილია.
- components/nav/nav-items.ts — NAV_ITEMS რიგი: Today/Tarot/Ask/Library პირველი, დანარჩენი მეორადი; messages დამატებულია („წერილები"/„Messages", AI „ჰკითხე"/„Ask"-გან განსხვავებული); მობილური ტაბები: today/tarot/ask/library (+ tab-ლეიბლი „ჩემი ისტორია"/„My history"), საერთო ობიექტებიდან.
- components/nav/mobile-nav.tsx — ვარიანტი tab („მეტი"/„More" ღილაკი) + წერილების/Ask ბეჯები draw-ში.
- components/nav/mobile-tab-bar.tsx — 4 ლინკი + More, რომელიც იმავე draw-ს ხსნის; ცარიელი href არ არის; Ask ბეჯი რეალურ /ask ტაბზე.
- components/nav/desktop-sidebar.tsx — messages ხელით დამატება მოხსნილია (NAV_ITEMS-შია); app-header.tsx draw-ს ბეჯების რაოდენობებს აწვდის.
- წაშლილია: components/phone-gift/phone-gift-popup.tsx (მომხმარებელი აღარ დარჩა). შენარჩუნებულია: PhoneGiftForm/Card (/credits-ზე), საჩუქრის თანხები/იდემპოტენტობა, SMS-თანხმობა, phoneGiftPopupEligible/dismissPhoneGiftPopup სერვერ-თავსებადობა, DAILY_RITUAL_VERSION=2, პროგრესი, ანალიტიკის სახელები.
- ახალი ტესტები: tests/today-daily-card.test.ts, tests/today-dashboard-order.test.ts, tests/today-nav.test.ts.

RED/GREEN (რეალური გაშვებით):

- today-daily-card: RED 3 fail / 1 pass → GREEN 4/4.
- today-dashboard-order: RED 6 fail → GREEN 6/6 (+ phone-gift.test.ts 10/10 მწვანე).
- today-nav: RED 7 fail → GREEN 7/7.

სრული შემოწმება:

- npm run check — წარმატებული (env OK, eslint სუფთა, tsc --noEmit სუფთა).
- npx vitest run — 112 ფაილი pass, 2 skipped; 525 ტესტი pass, 8 skipped (ბაზელაინი იყო 508/8 — რეგრესია არ არის).

შეზღუდვები/შენიშვნები:

- /messages გვერდის KA სათაური („ჩატი") და ჩატ-ვიჯეტის ლეიბლი უცვლელია — ეს ფაილები ნებადართული არეალის გარეთაა; ნავში ახლა „წერილებია". სურვილის შემთხვევაში ცალკე ბეთჩია საჭირო.
- ბრაუზერული ვერიფიკაცია არ გამიკეთებია (სერვერი არ დამიწყია) — მშობელი ამოწმებს.
