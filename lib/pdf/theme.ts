/**
 * PDF colour palette — the app's dark "deep cosmos" theme converted to hex
 * (react-pdf has no oklch). Tuned for print readability over a long report:
 * soft off-white text on deep purple-black, never pure #000/#fff, with
 * accent + element colours lifted enough to stay legible on the dark ground.
 */
export const C = {
  // Surfaces (deep purple-black → raised panels)
  bg: "#0f0a1c",
  panel: "#191230",
  panel2: "#211a3d",
  // Text
  text: "#f1eef8", // soft moonlight white
  textMuted: "#b4a9c9",
  textDim: "#8d82a6",
  onAccent: "#140d24",
  // Dividers / borders
  border: "#332b4d",
  borderSoft: "#272040",
  // Brand accents
  violet: "#b884f2",
  pink: "#ef7ab0",
  cyan: "#5fd2de",
  gold: "#eac358",
  // Elements (fire / earth / air / water) — lifted for dark legibility
  fire: "#e06b46",
  earth: "#86ad5c",
  air: "#5cb7e2",
  water: "#9a78ee",
} as const;

export const ELEMENT_COLOR: Record<string, string> = {
  ცეცხლი: C.fire,
  მიწა: C.earth,
  ჰაერი: C.air,
  წყალი: C.water,
};
