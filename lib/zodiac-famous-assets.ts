export type FamousZodiacAsset = {
  id: string;
  r2Key: string;
  sourceUrl: string;
  sourcePage: string;
  license: string;
};

export const FAMOUS_ZODIAC_ASSETS: FamousZodiacAsset[] = [
  {
    id: "albert-einstein",
    r2Key: "quiz/famous/albert-einstein.jpg",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Albert_Einstein_Head.jpg",
    license: "Public Domain",
  },
  {
    id: "marilyn-monroe",
    r2Key: "quiz/famous/marilyn-monroe.jpg",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Marilyn_Monroe_photo_pose_Seven_Year_Itch.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Marilyn_Monroe_photo_pose_Seven_Year_Itch.jpg",
    license: "Public Domain",
  },
  {
    id: "david-bowie",
    r2Key: "quiz/famous/david-bowie.jpg",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski-cropped.jpg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski-cropped.jpg",
    license: "CC BY-SA 3.0",
  },
];
