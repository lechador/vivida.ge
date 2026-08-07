import * as Sentry from "@sentry/nextjs";

import { parseSentrySampleRate } from "./lib/sentry-config";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: parseSentrySampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  ),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
