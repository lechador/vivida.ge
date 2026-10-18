export type TestKind = "mbti" | "iq" | "eq" | "big-five";

export async function getTestVisibility(_userId: string): Promise<{
  mbti: boolean;
  iq: boolean;
  eq: boolean;
  "big-five"?: boolean;
}> {
  return { mbti: true, iq: true, eq: true, "big-five": true };
}

export async function setTestVisibility(
  _userId: string,
  _kind: TestKind,
  _visible: boolean,
): Promise<void> {}

export async function getLatestMbtiResult(_userId: string): Promise<{
  id: string;
  mbtiType: string;
  archetypeNameGe: string;
  archetypeNameEn?: string;
} | null> {
  return null;
}

export async function getLatestIqResult(_userId: string): Promise<{
  id: string;
  iq: number;
  percentile: number;
} | null> {
  return null;
}

export async function getLatestEqResult(_userId: string): Promise<{
  id: string;
  overall: number;
  band: string;
} | null> {
  return null;
}

export async function getLatestBigFiveResult(_userId: string): Promise<{
  id: string;
  traitScores: Record<string, number>;
} | null> {
  return null;
}
