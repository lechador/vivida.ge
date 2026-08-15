import { defineAgent } from "eve";

export default defineAgent({
  model: "zai/glm-5.2",
  modelContextWindowTokens: 1_000_000,
  reasoning: "low",
  limits: {
    maxInputTokensPerSession: 120_000,
    maxOutputTokensPerSession: 12_000,
    sessionTimeoutMs: 24 * 60 * 60 * 1_000,
  },
});
