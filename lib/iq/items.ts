import { dots, type FigureSpec, type Mark, type ShapeKind } from "@/lib/iq/figures";

/**
 * The IQ item bank — ~28 culture-fair items across four reasoning domains.
 *
 * Each item carries a Rasch difficulty `b` on the logit scale (roughly −2 easy
 * … +2 hard); the scorer (lib/iq/scoring.ts) uses the *pattern* of right/wrong
 * against these difficulties to estimate ability, exactly as a real IRT-normed
 * test does. Figural items are built by rule (rotation / count / distribution),
 * so the answer cell is produced by the same transformation as the givens and
 * is correct by construction.
 *
 * The bank is FIXED and ordered by difficulty within domain — everyone takes
 * the same test, which keeps scores comparable and lets us self-norm later
 * from real responses.
 */

export type IqDomain = "numeric" | "logic" | "spatial" | "pattern";

export const DOMAIN_LABELS_KA: Record<IqDomain, string> = {
  numeric: "რიცხვითი ლოგიკა",
  logic: "ლოგიკური აზროვნება",
  spatial: "სივრცითი აზროვნება",
  pattern: "პატერნების ამოცნობა",
};

export type IqOption =
  | { kind: "text"; text: string }
  | { kind: "figure"; spec: FigureSpec };

export type IqStem =
  | { type: "number-series"; sequence: number[] }
  | { type: "matrix"; cells: (FigureSpec | null)[] } // 9 cells, row-major, one null
  | { type: "analogy"; a: FigureSpec; b: FigureSpec; c: FigureSpec }
  | { type: "odd-one-out" } // the options themselves are the figures
  | { type: "logic"; textKa: string };

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
  analogy: "როგორც პირველი წყვილი — ისე მესამე. რომელი ფიგურაა გამოტოვებული?",
  "odd-one-out": "აირჩიე ზედმეტი ფიგურა.",
  logic: "", // the stem text is the prompt
};

// ── figure helpers ─────────────────────────────────────────────────────────
const fig = (spec: FigureSpec): IqOption => ({ kind: "figure", spec });
const txt = (t: string): IqOption => ({ kind: "text", text: t });
const one = (shape: ShapeKind, extra: Partial<Mark> = {}): FigureSpec => [
  { shape, size: 56, ...extra },
];

// ── builders ───────────────────────────────────────────────────────────────
function ns(
  id: string,
  b: number,
  sequence: number[],
  options: number[],
  answer: number
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
  options: string[],
  answer: number
): IqItem {
  return {
    id,
    domain: "logic",
    b,
    stem: { type: "logic", textKa },
    options: options.map(txt),
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
  answer: number
): IqItem {
  const cells: (FigureSpec | null)[] = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      cells.push(r === 2 && c === 2 ? null : cell(r, c));
  return { id, domain, b, stem: { type: "matrix", cells }, options: options.map(fig), answer };
}

function analogy(
  id: string,
  domain: IqDomain,
  b: number,
  a: FigureSpec,
  bb: FigureSpec,
  c: FigureSpec,
  options: FigureSpec[],
  answer: number
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
  answer: number
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
  ns("n3", -0.6, [7, 14, 28, 56], [84, 112, 98, 110], 1),
  ns("n4", -0.3, [81, 27, 9], [6, 3, 1, 4], 1),
  ns("n5", 0.2, [1, 1, 2, 3, 5], [7, 8, 10, 6], 1), // fibonacci
  ns("n6", -0.8, [3, 6, 12, 24], [36, 48, 42, 50], 1),
  ns("n7", 0.7, [4, 9, 16, 25], [30, 36, 49, 35], 1), // squares
  ns("n8", 0.6, [2, 3, 5, 8, 12], [15, 16, 17, 18], 2), // +1,+2,+3,+4
  ns("n9", 1.2, [2, 6, 12, 20, 30], [40, 42, 44, 36], 1), // +4,+6,+8,+10
  ns("n10", 1.8, [1, 3, 7, 15, 31], [47, 63, 62, 64], 1), // ×2+1
  ns("n11", 0.9, [6, 7, 9, 12, 16], [20, 21, 19, 22], 1), // +1,+2,+3,+4,+5
  // hard tier — multi-rule / interleaved, to separate high scorers
  ns("n12", 1.5, [2, 3, 5, 7, 11, 13], [15, 16, 17, 19], 2), // primes → 17
  ns("n16", 1.9, [2, 100, 4, 90, 8, 80], [16, 70, 12, 32], 0), // two interleaved series → 16
  ns("n14", 2.1, [3, 5, 10, 12, 24], [26, 36, 48, 28], 0), // +2,×2 alternating → 26
  ns("n15", 2.4, [1, 2, 6, 24, 120], [600, 720, 840, 240], 1), // ×2,×3,×4,×5 → 720

  // ── Logic (verbal / abstract, Georgian, culture-light) ───────────────────
  logic(
    "l1",
    -0.4,
    "თუ A > B და B > C, მაშინ რომელი მტკიცებაა ჭეშმარიტი?",
    ["A > C", "C > A", "A = C", "ვერ დავადგენთ"],
    0
  ),
  logic(
    "l2",
    0.4,
    "თუ „მზე“ = 3 და „გზა“ = 3, მაშინ „ბაღი“ = ?",
    ["3", "4", "5", "6"],
    1
  ), // count the letters
  logic(
    "l3",
    0.5,
    "ორშაბათი, ოთხშაბათი, პარასკევი, … — რომელი დღე მოდის შემდეგ?",
    ["შაბათი", "კვირა", "ორშაბათი", "ხუთშაბათი"],
    1
  ), // every 2 days → Sunday
  logic(
    "l4",
    1.0,
    "რომელი რიცხვია ზედმეტი? 3, 5, 7, 9, 11",
    ["3", "7", "9", "11"],
    2
  ), // 9 is the only non-prime
  logic(
    "l5",
    1.1,
    "3 მუშა სამუშაოს ასრულებს 3 საათში. რამდენ ხანში დაასრულებს იმავე სამუშაოს 6 მუშა?",
    ["1.5 საათი", "2 საათი", "3 საათი", "6 საათი"],
    0
  ),

  // hard tier — letter series, transitive ordering, syllogism with a trap
  logic(
    "l8",
    1.3,
    "ა, გ, ე, ზ, … — რომელი ასო მოდის შემდეგ?",
    ["თ", "ი", "კ", "ლ"],
    1
  ), // every 2nd letter of the Georgian alphabet → ი
  logic(
    "l7",
    1.6,
    "ანა უფროსია ბექოზე. გია უფროსია ანაზე. დათო უმცროსია ბექოზე. ვინ არის ყველაზე უფროსი?",
    ["ანა", "ბექო", "გია", "დათო"],
    2
  ), // გია > ანა > ბექო > დათო
  logic(
    "l6",
    1.9,
    "ყველა კატა ცხოველია. ზოგიერთი ცხოველი შავია. რომელი დასკვნაა ნამდვილად სწორი?",
    [
      "ყველა კატა შავია",
      "ზოგი კატა შავია",
      "ვერ დავადგენთ, არის თუ არა კატა შავი",
      "ვერცერთი კატა არ არის შავი",
    ],
    2
  ), // the valid conclusion is "cannot be determined"

  // ── Spatial (rotation) ───────────────────────────────────────────────────
  // arrow rotates by 45° along both axes: rot(r,c) = (r+c)·45 → answer 180°
  matrix(
    "s1",
    "spatial",
    0.0,
    (r, c) => one("arrow", { rot: (r + c) * 45, size: 54 }),
    [90, 135, 180, 225].map((rot) => one("arrow", { rot, size: 54 })),
    2
  ),
  // analogy: arrow up → arrow right (=+90°) :: triangle up → triangle +90°
  analogy(
    "s2",
    "spatial",
    0.5,
    one("arrow", { rot: 0, size: 54 }),
    one("arrow", { rot: 90, size: 54 }),
    one("triangle", { rot: 0, size: 54 }),
    [
      one("triangle", { rot: 90, size: 54 }),
      one("triangle", { rot: 180, size: 54 }),
      one("triangle", { rot: 0, size: 54 }),
      one("triangle", { rot: 270, size: 54 }),
    ],
    0
  ),
  // odd-one-out: four arrows (various rotations) + one triangle
  odd(
    "s3",
    "spatial",
    0.6,
    [
      one("arrow", { rot: 0, size: 54 }),
      one("arrow", { rot: 90, size: 54 }),
      one("triangle", { rot: 0, size: 54 }),
      one("arrow", { rot: 180, size: 54 }),
      one("arrow", { rot: 270, size: 54 }),
    ],
    2
  ),

  // hard: two independent rotation rules — rows add 90°, columns add 45°
  // rot(r,c) = r·90 + c·45 → (2,2) = 180 + 90 = 270°
  matrix(
    "s4",
    "spatial",
    1.6,
    (r, c) => one("arrow", { rot: r * 90 + c * 45, size: 54 }),
    [225, 270, 180, 315].map((rot) => one("arrow", { rot, size: 54 })),
    1
  ),

  // ── Pattern (figural reasoning) ──────────────────────────────────────────
  // dot count, reading order 1..9 → answer 9
  matrix(
    "p1",
    "pattern",
    -1.5,
    (r, c) => dots(r * 3 + c + 1),
    [8, 9, 7, 6].map((n) => dots(n)),
    1
  ),
  // distribution-of-three (Latin square) of shapes → (2,2) = square
  matrix(
    "p2",
    "pattern",
    0.2,
    (r, c) => one((["circle", "square", "triangle"] as const)[(r + c) % 3], { size: 50 }),
    (["circle", "square", "triangle", "diamond"] as const).map((s) => one(s, { size: 50 })),
    1
  ),
  // multiplicative dot count: count = (r+1)(c+1) → (2,2) = 9
  matrix(
    "p3",
    "pattern",
    0.7,
    (r, c) => dots((r + 1) * (c + 1)),
    [6, 9, 8, 12].map((n) => dots(n)),
    1
  ),
  // analogy: add a centre dot (square→square+dot :: circle→circle+dot)
  analogy(
    "p4",
    "pattern",
    0.0,
    one("square", { size: 56 }),
    [{ shape: "square", size: 56 }, smallDot],
    one("circle", { size: 56 }),
    [
      [{ shape: "circle", size: 56 }, smallDot],
      one("circle", { size: 56 }),
      [{ shape: "circle", size: 56 }, smallDot, { shape: "dot", size: 16, x: 32 }],
      [{ shape: "triangle", size: 56 }, smallDot],
    ],
    0
  ),
  // analogy: big outline → small filled (circle then square)
  analogy(
    "p5",
    "pattern",
    0.5,
    one("circle", { size: 72 }),
    one("circle", { size: 34, fill: true }),
    one("square", { size: 72 }),
    [
      one("square", { size: 34, fill: true }),
      one("square", { size: 72, fill: true }),
      one("square", { size: 34 }),
      one("triangle", { size: 34, fill: true }),
    ],
    0
  ),
  // odd-one-out: four polygons + one circle (circle has no straight sides)
  odd(
    "p6",
    "pattern",
    0.4,
    [
      one("triangle", { size: 54 }),
      one("square", { size: 52 }),
      one("pentagon", { size: 54 }),
      one("hexagon", { size: 54 }),
      one("circle", { size: 54 }),
    ],
    4
  ),
  // odd-one-out: dot counts 2,4,6,3,8 → 3 is the only odd count
  odd(
    "p7",
    "pattern",
    0.7,
    [dots(2), dots(4), dots(6), dots(3), dots(8)],
    3
  ),
  // size grows across columns, shape changes down rows → (2,2)=triangle largest
  matrix(
    "p8",
    "pattern",
    0.8,
    (r, c) =>
      one((["circle", "square", "triangle"] as const)[r], { size: 28 + c * 20 }),
    [
      one("triangle", { size: 68 }),
      one("triangle", { size: 48 }),
      one("square", { size: 68 }),
      one("triangle", { size: 28 }),
    ],
    0
  ),
  // figure addition: col0 = big shape, col1 = small mark, col2 = both
  matrix(
    "p9",
    "pattern",
    1.5,
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
    0
  ),
  // hard: TWO attributes at once — shape distributed by (r+c)%3, fill by
  // (r+c) parity → (2,2) = filled square
  matrix(
    "p10",
    "pattern",
    1.6,
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
    0
  ),
  // hard: shape by row + inner dot present in columns 0 & 2 only → (2,2) =
  // triangle with a centre dot
  matrix(
    "p11",
    "pattern",
    1.7,
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
    0
  ),
];

/**
 * Presented easy → hard (a Raven-style difficulty ramp): gentle warm-ups first,
 * genuinely hard items last. Scoring uses the response *pattern* against each
 * item's `b`, not the order, so the ramp only shapes the taker's experience —
 * it doesn't bias the score. Sorting also interleaves domains naturally, since
 * difficulties overlap across them.
 */
export const IQ_ITEMS: IqItem[] = [...RAW_ITEMS].sort((a, b) => a.b - b.b);

/** How many items — used by the UI and scoring. */
export const IQ_ITEM_COUNT = IQ_ITEMS.length;

/** localStorage key the test writes answers to for the result page to read. */
export const IQ_ANSWERS_STORAGE_KEY = "vivida_iq_answers";

/** Overall time budget (seconds). ~50s/item — brisk but not frantic. */
export const IQ_TIME_LIMIT_SEC = 30 * 60;

export function iqItemById(id: string): IqItem | undefined {
  return IQ_ITEMS.find((i) => i.id === id);
}
