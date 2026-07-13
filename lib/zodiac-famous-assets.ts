/**
 * Fixed, reviewed source set for the famous-zodiac quiz. The seed endpoint is
 * deliberately limited to these URLs, rather than accepting an arbitrary URL
 * from a request. Every source is Wikimedia Commons with a reusable licence.
 */
export type FamousZodiacAsset = {
  id: string;
  key: string;
  sourceUrl: string;
  sourcePage: string;
  license: string;
};

export const FAMOUS_ZODIAC_ASSETS: FamousZodiacAsset[] = [
  { id: "taylor-swift", key: "quiz/zodiac-famous/taylor-swift.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Cierre_del_Eras_Tour_de_Taylor_Swift%2C_Buenos_Aires_noche_1.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Cierre_del_Eras_Tour_de_Taylor_Swift,_Buenos_Aires_noche_1.jpg", license: "CC BY-SA 4.0" },
  { id: "leonardo-dicaprio", key: "quiz/zodiac-famous/leonardo-dicaprio.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Leonardo_DiCaprio_from_J._Edgar_by_Rajasekharan_2020.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Leonardo_DiCaprio_from_J._Edgar_by_Rajasekharan_2020.jpg", license: "CC BY-SA 4.0" },
  { id: "cristiano-ronaldo", key: "quiz/zodiac-famous/cristiano-ronaldo.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/1/17/C.Ronaldo.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:C.Ronaldo.jpg", license: "CC BY-SA 3.0" },
  { id: "rihanna", key: "quiz/zodiac-famous/rihanna.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Rihanna_by_Rajasekharan_2019.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Rihanna_by_Rajasekharan_2019.jpg", license: "CC BY-SA 4.0" },
  { id: "brad-pitt", key: "quiz/zodiac-famous/brad-pitt.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/7/75/Brad_Pitt-69924.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Brad_Pitt-69924.jpg", license: "CC BY-SA 4.0" },
  { id: "lady-gaga", key: "quiz/zodiac-famous/lady-gaga.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_%EC%98%AC%EB%A0%88%EB%93%9C_TV%2C_%EB%89%B4%EC%9A%95_%ED%95%9C%EB%B3%B5%ED%8C%90%EC%97%90%EC%84%9C_%EC%84%B8%EA%B3%84%EC%A0%81_%ED%8C%9D%EC%8A%A4%ED%83%80_%EB%A0%88%EC%9D%B4%EB%94%94_%EA%B0%80%EA%B0%80%28Lady_GaGa%29%EC%99%80_%EC%9D%B4%EC%83%89_%EB%A7%88%EC%BC%80%ED%8C%85_-_50618132748_%28cropped%29.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:LG_%EC%98%AC%EB%A0%88%EB%93%9C_TV,_%EB%89%B4%EC%9A%95_%ED%95%9C%EB%B3%B5%ED%8C%90%EC%97%90%EC%84%9C_%EC%84%B8%EA%B3%84%EC%A0%81_%ED%8C%9D%EC%8A%A4%ED%83%80_%EB%A0%88%EC%9D%B4%EB%94%94_%EA%B0%80%EA%B0%80(Lady_GaGa)%EC%99%80_%EC%9D%B4%EC%83%89_%EB%A7%88%EC%BC%80%ED%8C%85_-_50618132748_(cropped).jpg", license: "CC BY 2.0" },
  { id: "michael-jordan", key: "quiz/zodiac-famous/michael-jordan.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Michael_Jordan_dunk_contest_February_1985.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Michael_Jordan_dunk_contest_February_1985.jpg", license: "Public domain" },
  { id: "arnold-schwarzenegger", key: "quiz/zodiac-famous/arnold-schwarzenegger.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Gov._Arnold_Schwarzenegger.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Gov._Arnold_Schwarzenegger.jpg", license: "Public domain" },
  { id: "dolly-parton", key: "quiz/zodiac-famous/dolly-parton.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Dolly_Parton_2023.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Dolly_Parton_2023.jpg", license: "CC BY 3.0" },
  { id: "keanu-reeves", key: "quiz/zodiac-famous/keanu-reeves.jpg", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Keanu_Reeves_2019_%28cropped%29.jpg", sourcePage: "https://commons.wikimedia.org/wiki/File:Keanu_Reeves_2019_(cropped).jpg", license: "CC BY 2.0" },
];

export const FAMOUS_ZODIAC_ASSET_BY_ID = Object.fromEntries(
  FAMOUS_ZODIAC_ASSETS.map((asset) => [asset.id, asset])
);
