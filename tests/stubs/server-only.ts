// Test stub for the `server-only` marker package. In the Next.js runtime the
// default entry throws unless resolved under the `react-server` condition;
// vitest (plain node) must alias `server-only` here instead (see
// vitest.config.mts) so server modules stay importable in unit tests.
export {};
