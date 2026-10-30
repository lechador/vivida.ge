import {
  dots,
  type FigureSpec,
  type Mark,
  type ShapeKind,
} from "@/lib/iq/figures";

/**
 * The IQ item bank, 39 culture-fair items across four reasoning domains.
 *
 * Each item carries a Rasch difficulty `b` on the logit scale. The `b` values
 * are NOT hand estimates anymore: they were jointly calibrated (iterative
 * Rasch estimation of θ and b) from 881 completed real attempts in Oct 2026
 * (split-half stability r = 0.985; the previous hand-set values correlated
 * only r = 0.46 with the calibrated ones). Two items were removed in that
 * pass because they measured nothing: the letter-count item and the
 * 3-5-7-9-11 odd-one-out both had point-biserial correlation ≈ 0.05 against
 * the rest of the test, and the odd-one-out was passed by only 12% of
 * takers, below the 25% guessing floor, because its intended answer was
 * systematically less attractive than a distractor. Figural items are built
 * by rule (rotation / count / distribution), so the answer cell is produced
 * by the same transformation as the givens and is correct by construction.
 *
 * The bank is FIXED, everyone draws from the same pool, which keeps scores
 * comparable and lets us re-calibrate later from real responses. Re-run
 * scripts/recalibrate-iq.mjs before touching any `b` by hand.
 */

export type IqDomain = "numeric" | "logic" | "spatial" | "pattern";

export const DOMAIN_LABELS_KA: Record<IqDomain, string> = {
  numeric: "რიცხვითი ლოგიკა",
  logic: "ლოგიკური აზროვნება",
  spatial: "სივრცითი აზროვნება",
  pattern: "პატერნების ამოცნობა",
};

export const DOMAIN_LABELS_EN: Record<IqDomain, string> = {
  numeric: "Numerical reasoning",
  logic: "Logical reasoning",
  spatial: "Spatial reasoning",
  pattern: "Pattern recognition",
};

export type IqOption =
  | { kind: "text"; text: string; textEn?: string }
  | { kind: "figure"; spec: FigureSpec };

export type IqStem =
  | { type: "number-series"; sequence: number[] }
  | { type: "matrix"; cells: (FigureSpec | null)[] } // 9 cells, row-major, one null
  | { type: "analogy"; a: FigureSpec; b: FigureSpec; c: FigureSpec }
  | { type: "odd-one-out" } // the options themselves are the figures
  | { type: "logic"; textKa: string; textEn: string };

export type IqItem = {
  id: string;
  domain: IqDomain;
  b: number;
  stem: IqStem;
  options: IqOption[];
  answer: number; // index into options
};

/** Georgian prompt shown above the options, by stem kind. */
export const STEM_PROMPT_KA: Record<IqStem["type"], string> = {
  "number-series": "რომელი რიცხვი აგრძელებს მიმდევრობას?",
  matrix: "რომელი ფიგურა უნდა იყოს კითხვის ნიშნის ადგილას?",
  analogy: "როგორც პირველ წყვილში, ისე მეორეში. რომელი ფიგურაა გამოტოვებული?",
  "odd-one-out": "აირჩიე ზედმეტი ფიგურა.",
  logic: "", // the stem text is the prompt
};

export const STEM_PROMPT_EN: Record<IqStem["type"], string> = {
  "number-series": "Which number continues the sequence?",
  matrix: "Which figure belongs in the missing cell?",
  analogy:
    "Apply the first pair's rule to the second pair. Which figure is missing?",
  "odd-one-out": "Choose the figure that does not belong.",
  logic: "",
};

// ── figure helpers ─────────────────────────────────────────────────────────
const fig = (spec: FigureSpec): IqOption => ({ kind: "figure", spec });
const txt = (t: string, textEn?: string): IqOption => ({
  kind: "text",
  text: t,
  textEn,
});
const one = (shape: ShapeKind, extra: Partial<Mark> = {}): FigureSpec => [
  { shape, size: 56, ...extra },
];

// ── builders ───────────────────────────────────────────────────────────────
function ns(
  id: string,
  b: number,
  sequence: number[],
  options: number[],
  answer: number,
): IqItem {
  return {
    id,
    domain: "numeric",
    b,
    stem: { type: "number-series", sequence },
    options: options.map((n) => txt(String(n))),
    answer,
  };
}

function logic(
  id: string,
  b: number,
  textKa: string,
  textEn: string,
  options: string[],
  optionsEn: string[],
  answer: number,
): IqItem {
  return {
    id,
    domain: "logic",
    b,
    stem: { type: "logic", textKa, textEn },
    options: options.map((option, index) => txt(option, optionsEn[index])),
    answer,
  };
}

/** 3×3 matrix whose cell figures are produced by `cell(r,c)`; (2,2) is blank. */
function matrix(
  id: string,
  domain: IqDomain,
  b: number,
  cell: (r: number, c: number) => FigureSpec,
  options: FigureSpec[],
  answer: number,
): IqItem {
  const cells: (FigureSpec | null)[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      cells.push(r === 2 && c === 2 ? null : cell(r, c));
  return {
    id,
    domain,
    b,
    stem: { type: "matrix", cells },
    options: options.map(fig),
    answer,
  };
}

function analogy(
  id: string,
  domain: IqDomain,
  b: number,
  a: FigureSpec,
  bb: FigureSpec,
  c: FigureSpec,
  options: FigureSpec[],
  answer: number,
): IqItem {
  return {
    id,
    domain,
    b,
    stem: { type: "analogy", a, b: bb, c },
    options: options.map(fig),
    answer,
  };
}

function odd(
  id: string,
  domain: IqDomain,
  b: number,
  figures: FigureSpec[],
  answer: number,
): IqItem {
  return {
    id,
    domain,
    b,
    stem: { type: "odd-one-out" },
    options: figures.map(fig),
    answer,
  };
}

// small centred marks used for "addition" / analogy overlays
const smallDot: Mark = { shape: "dot", size: 16 };
const smallPlus: Mark = { shape: "plus", size: 26, sw: 5 };
const smallLine: Mark = { shape: "line", size: 40, sw: 6 };

const RAW_ITEMS: IqItem[] = [
  // ── Numeric (number series) ──────────────────────────────────────────────
  ns("n3", 0.43, [7, 14, 28, 56], [84, 112, 98, 110], 1),
  ns("n4", 0.57, [81, 27, 9], [6, 3, 1, 4], 1),
  ns("n5", 2.0, [1, 1, 2, 3, 5], [7, 8, 10, 6], 1), // fibonacci
  ns("n6", 0.7, [3, 6, 12, 24], [36, 48, 42, 50], 1),
  ns("n7", 1.11, [4, 9, 16, 25], [30, 36, 49, 35], 1), // squares
  ns("n8", 1.88, [2, 3, 5, 8, 12], [15, 16, 17, 18], 2), // +1,+2,+3,+4
  ns("n9", 1.07, [2, 6, 12, 20, 30], [40, 42, 44, 36], 1), // +4,+6,+8,+10
  ns("n10", 1.92, [1, 3, 7, 15, 31], [47, 63, 62, 64], 1), // ×2+1
  ns("n11", 1.11, [6, 7, 9, 12, 16], [20, 21, 19, 22], 1), // +1,+2,+3,+4,+5
  // hard tier, multi-rule / interleaved, to separate high scorers
  ns("n12", 3.56, [2, 3, 5, 7, 11, 13], [15, 16, 17, 19], 2), // primes → 17
  ns("n16", 1.95, [2, 100, 4, 90, 8, 80], [16, 70, 12, 32], 0), // two interleaved series → 16
  ns("n14", 2.29, [3, 5, 10, 12, 24], [26, 36, 48, 28], 0), // +2,×2 alternating → 26
  ns("n15", 2.35, [1, 2, 6, 24, 120], [600, 720, 840, 240], 1), // ×2,×3,×4,×5 → 720

  // ── Logic (verbal / abstract, Georgian, culture-light) ───────────────────
  logic(
    "l1",
    1.41,
    "თუ A > B და B > C, მაშინ რომელი მტკიცებაა ჭეშმარიტი?",
    "If A > B and B > C, which statement must be true?",
    ["A > C", "C > A", "A = C", "ვერ დავადგენთ"],
    ["A > C", "C > A", "A = C", "Cannot be determined"],
    0,
  ),
  logic(
    "l3",
    0.17,
    "ორშაბათი, ოთხშაბათი, პარასკევი, …, რომელი დღე მოდის შემდეგ?",
    "Monday, Wednesday, Friday, …, which day comes next?",
    ["შაბათი", "კვირა", "ორშაბათი", "ხუთშაბათი"],
    ["Saturday", "Sunday", "Monday", "Thursday"],
    1,
  ), // every 2 days → Sunday
  logic(
    "l5",
    0.86,
    "3 მუშა სამუშაოს 3 საათში ასრულებს. რამდენ ხანში დაასრულებს იმავე სამუშაოს 6 მუშა?",
    "Three workers complete a job in three hours. How long would six equally productive workers take?",
    ["1.5 საათი", "2 საათი", "3 საათი", "6 საათი"],
    ["1.5 hours", "2 hours", "3 hours", "6 hours"],
    0,
  ),

  // hard tier, letter series, transitive ordering, syllogism with a trap
  logic(
    "l8",
    0.82,
    "ა, გ, ე, ზ, …, რომელი ასო მოდის შემდეგ?",
    "A, C, E, G, …, which letter comes next?",
    ["თ", "ი", "კ", "ლ"],
    ["H", "I", "J", "K"],
    1,
  ), // every 2nd letter of the Georgian alphabet → ი
  logic(
    "l7",
    0.12,
    "ანა უფროსია ბექოზე. გია უფროსია ანაზე. დათო უმცროსია ბექოზე. ვინ არის ყველაზე უფროსი?",
    "Anna is older than Ben. George is older than Anna. Daniel is younger than Ben. Who is the oldest?",
    ["ანა", "ბექო", "გია", "დათო"],
    ["Anna", "Ben", "George", "Daniel"],
    2,
  ), // გია > ანა > ბექო > დათო
  logic(
    "l6",
    4.19,
    "ყველა კატა ცხოველია. ზოგიერთი ცხოველი შავია. რომელი დასკვნაა ნამდვილად სწორი?",
    "All cats are animals. Some animals are black. Which conclusion is definitely valid?",
    [
      "ყველა კატა შავია",
      "ზოგიერთი კატა შავია",
      "ვერ დავადგენთ, არის თუ არა რომელიმე კატა შავი",
      "არცერთი კატა არ არის შავი",
    ],
    [
      "All cats are black",
      "Some cats are black",
      "It cannot be determined whether any cats are black",
      "No cats are black",
    ],
    2,
  ), // the valid conclusion is "cannot be determined"

  // ── Spatial (rotation) ───────────────────────────────────────────────────
  // arrow rotates by 45° along both axes: rot(r,c) = (r+c)·45 → answer 180°
  matrix(
    "s1",
    "spatial",
    0.46,
    (r, c) => one("arrow", { rot: (r + c) * 45, size: 54 }),
    [90, 135, 180, 225].map((rot) => one("arrow", { rot, size: 54 })),
    2,
  ),
  // analogy: arrow up → arrow right (=+90°) :: triangle up → triangle +90°
  analogy(
    "s2",
    "spatial",
    0.59,
    one("arrow", { rot: 0, size: 54 }),
    one("arrow", { rot: 90, size: 54 }),
    one("triangle", { rot: 0, size: 54 }),
    [
      one("triangle", { rot: 90, size: 54 }),
      one("triangle", { rot: 180, size: 54 }),
      one("triangle", { rot: 0, size: 54 }),
      one("triangle", { rot: 270, size: 54 }),
    ],
    0,
  ),
  // odd-one-out: four arrows (various rotations) + one triangle
  odd(
    "s3",
    "spatial",
    -1.28,
    [
      one("arrow", { rot: 0, size: 54 }),
      one("arrow", { rot: 90, size: 54 }),
      one("triangle", { rot: 0, size: 54 }),
      one("arrow", { rot: 180, size: 54 }),
      one("arrow", { rot: 270, size: 54 }),
    ],
    2,
  ),

  // hard: two independent rotation rules, rows add 90°, columns add 45°
  // rot(r,c) = r·90 + c·45 → (2,2) = 180 + 90 = 270°
  matrix(
    "s4",
    "spatial",
    0.75,
    (r, c) => one("arrow", { rot: r * 90 + c * 45, size: 54 }),
    [225, 270, 180, 315].map((rot) => one("arrow", { rot, size: 54 })),
    1,
  ),

  // ── Pattern (figural reasoning) ──────────────────────────────────────────
  // dot count, reading order 1..9 → answer 9
  matrix(
    "p1",
    "pattern",
    -1.55,
    (r, c) => dots(r * 3 + c + 1),
    [8, 9, 7, 6].map((n) => dots(n)),
    1,
  ),
  // distribution-of-three (Latin square) of shapes → (2,2) = square
  matrix(
    "p2",
    "pattern",
    -0.32,
    (r, c) =>
      one((["circle", "square", "triangle"] as const)[(r + c) % 3], {
        size: 50,
      }),
    (["circle", "square", "triangle", "diamond"] as const).map((s) =>
      one(s, { size: 50 }),
    ),
    1,
  ),
  // multiplicative dot count: count = (r+1)(c+1) → (2,2) = 9
  matrix(
    "p3",
    "pattern",
    0.61,
    (r, c) => dots((r + 1) * (c + 1)),
    [6, 9, 8, 12].map((n) => dots(n)),
    1,
  ),
  // analogy: add a centre dot (square→square+dot :: circle→circle+dot)
  analogy(
    "p4",
    "pattern",
    0.23,
    one("square", { size: 56 }),
    [{ shape: "square", size: 56 }, smallDot],
    one("circle", { size: 56 }),
    [
      [{ shape: "circle", size: 56 }, smallDot],
      one("circle", { size: 56 }),
      [
        { shape: "circle", size: 56 },
        smallDot,
        { shape: "dot", size: 16, x: 32 },
      ],
      [{ shape: "triangle", size: 56 }, smallDot],
    ],
    0,
  ),
  // analogy: big outline → small filled (circle then square)
  analogy(
    "p5",
    "pattern",
    1.3,
    one("circle", { size: 72 }),
    one("circle", { size: 34, fill: true }),
    one("square", { size: 72 }),
    [
      one("square", { size: 34, fill: true }),
      one("square", { size: 72, fill: true }),
      one("square", { size: 34 }),
      one("triangle", { size: 34, fill: true }),
    ],
    0,
  ),
  // odd-one-out: four polygons + one circle (circle has no straight sides)
  odd(
    "p6",
    "pattern",
    0.36,
    [
      one("triangle", { size: 54 }),
      one("square", { size: 52 }),
      one("pentagon", { size: 54 }),
      one("hexagon", { size: 54 }),
      one("circle", { size: 54 }),
    ],
    4,
  ),
  // odd-one-out: dot counts 2,4,6,3,8 → 3 is the only odd count
  odd("p7", "pattern", 1.18, [dots(2), dots(4), dots(6), dots(3), dots(8)], 3),
  // size grows across columns, shape changes down rows → (2,2)=triangle largest
  matrix(
    "p8",
    "pattern",
    -1.26,
    (r, c) =>
      one((["circle", "square", "triangle"] as const)[r], {
        size: 28 + c * 20,
      }),
    [
      one("triangle", { size: 68 }),
      one("triangle", { size: 48 }),
      one("square", { size: 68 }),
      one("triangle", { size: 28 }),
    ],
    0,
  ),
  // figure addition: col0 = big shape, col1 = small mark, col2 = both
  matrix(
    "p9",
    "pattern",
    -0.11,
    (r, c) => {
      const big: Mark = {
        shape: (["circle", "square", "diamond"] as const)[r],
        size: 60,
      };
      const small: Mark = [smallDot, smallPlus, smallLine][r];
      if (c === 0) return [big];
      if (c === 1) return [small];
      return [big, small];
    },
    [
      [{ shape: "diamond", size: 60 }, smallLine],
      [{ shape: "diamond", size: 60 }, smallPlus],
      [{ shape: "triangle", size: 60 }, smallLine],
      [{ shape: "diamond", size: 60 }],
    ],
    0,
  ),
  // hard: TWO attributes at once, shape distributed by (r+c)%3, fill by
  // (r+c) parity → (2,2) = filled square
  matrix(
    "p10",
    "pattern",
    2.24,
    (r, c) =>
      one((["circle", "square", "triangle"] as const)[(r + c) % 3], {
        size: 50,
        fill: (r + c) % 2 === 0,
      }),
    [
      one("square", { size: 50, fill: true }),
      one("square", { size: 50 }),
      one("circle", { size: 50, fill: true }),
      one("triangle", { size: 50, fill: true }),
    ],
    0,
  ),
  // hard: shape by row + inner dot present in columns 0 & 2 only → (2,2) =
  // triangle with a centre dot
  matrix(
    "p11",
    "pattern",
    -0.99,
    (r, c) => {
      const base: Mark = {
        shape: (["circle", "square", "triangle"] as const)[r],
        size: 60,
      };
      return c === 1 ? [base] : [base, smallDot];
    },
    [
      [{ shape: "triangle", size: 60 }, smallDot],
      [{ shape: "triangle", size: 60 }],
      [{ shape: "circle", size: 60 }, smallDot],
      [{ shape: "square", size: 60 }, smallDot],
    ],
    0,
  ),

  // ── Very-hard ceiling ────────────────────────────────────────
  // Extends the top of the scale so it can actually separate ~130 from ~145;
  // adaptively, only high-θ takers ever reach these.
  ns("n17", 3.46, [3, 4, 8, 17, 33, 58], [88, 94, 96, 84], 1), // +1,+4,+9,+16,+25 (squares) → 94
  ns("n18", 2.29, [2, 3, 6, 18, 108], [648, 1944, 216, 972], 1), // each = product of the two before → 1944
  logic(
    "l9",
    2.27,
    "ზოგიერთი A არის B. ყველა B არის C. არცერთი C არ არის D. რომელი დასკვნაა აუცილებლად სწორი?",
    "Some A are B. All B are C. No C are D. Which conclusion must be true?",
    [
      "ყველა A არის D",
      "ზოგიერთი A არ არის D",
      "არცერთი A არ არის C",
      "ყველა D არის B",
    ],
    ["All A are D", "Some A are not D", "No A are C", "All D are B"],
    1,
  ), // some A are B → C → not D ⇒ some A are not D
  // XOR matrix (hardest Raven rule): col2 = col0 ⊕ col1 by dot position →
  // (2,2) = a single bottom dot
  matrix(
    "p12",
    "pattern",
    0.94,
    (r, c) => {
      const T: Mark = { shape: "dot", size: 18, y: 34 };
      const Bm: Mark = { shape: "dot", size: 18, y: 66 };
      const G: Mark[][][] = [
        [[T], [Bm], [T, Bm]],
        [[T, Bm], [Bm], [T]],
        [[T, Bm], [T], [Bm]],
      ];
      return G[r][c];
    },
    [
      [{ shape: "dot", size: 18, y: 66 }],
      [{ shape: "dot", size: 18, y: 34 }],
      [
        { shape: "dot", size: 18, y: 34 },
        { shape: "dot", size: 18, y: 66 },
      ],
      [],
    ],
    0,
  ),
  // two simultaneous transforms, rotate 180° AND add a centre dot
  analogy(
    "s5",
    "spatial",
    1.5,
    one("arrow", { rot: 0, size: 54 }),
    [{ shape: "arrow", rot: 180, size: 54 }, smallDot],
    one("triangle", { rot: 0, size: 54 }),
    [
      [{ shape: "triangle", rot: 180, size: 54 }, smallDot],
      [{ shape: "triangle", rot: 0, size: 54 }, smallDot],
      [{ shape: "triangle", rot: 180, size: 54 }],
      [{ shape: "triangle", rot: 90, size: 54 }, smallDot],
    ],
    0,
  ),
];

/**
 * Presented easy → hard (a Raven-style difficulty ramp): gentle warm-ups first,
 * genuinely hard items last. Scoring uses the response *pattern* against each
 * item's `b`, not the order, so the ramp only shapes the taker's experience,
 * it doesn't bias the score. Sorting also interleaves domains naturally, since
 * difficulties overlap across them.
 */
export const IQ_ITEMS: IqItem[] = [...RAW_ITEMS].sort((a, b) => a.b - b.b);

/** How many items, used by the UI and scoring. */
export const IQ_ITEM_COUNT = IQ_ITEMS.length;

/** localStorage key the test writes answers to for the result page to read. */
export const IQ_ANSWERS_STORAGE_KEY = "vivida_iq_answers";

/** Overall time budget (seconds). ~60s/item over the adaptive 25, brisk but
 *  not frantic; adaptive items sit near your ability, so they take longer. */
export const IQ_TIME_LIMIT_SEC = 25 * 60;

export function iqItemById(id: string): IqItem | undefined {
  return IQ_ITEMS.find((i) => i.id === id);
}
