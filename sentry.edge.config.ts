import * as Sentry from "@sentry/nextjs";

import { parseSentrySampleRate } from "./lib/sentry-config";
import {
  sanitizeSentryEvent,
  sanitizeSentrySpan,
} from "./lib/privacy/sentry-privacy";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV,
  tracesSampleRate: parseSentrySampleRate(
    process.env.SENTRY_TRACES_SAMPLE_RATE,
  ),
  beforeSend(event) {
    return sanitizeSentryEvent(event);
  },
  beforeSendTransaction(event) {
    return sanitizeSentryEvent(event);
  },
  beforeSendSpan(span) {
    return sanitizeSentrySpan(span);
  },
});
