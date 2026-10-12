/** Color tier for a synastry overall percentage, shared between the
 *  chip on the friends list and the bigger ring on the ranked tab so the
 *  same number reads the same colour wherever it appears. */
export function synastryAccent(percent: number): string {
  if (percent >= 78) return "oklch(0.78 0.18 305)"; // violet, strong / celestial
  if (percent >= 55) return "oklch(0.78 0.18 200)"; // cyan, natural flow
  if (percent >= 43) return "oklch(0.85 0.16 85)"; // amber, alive dynamic
  return "oklch(0.7 0.18 30)"; // warm red, friction
}
