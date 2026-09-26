import * as Sentry from "@sentry/nextjs";

import { parseSentrySampleRate } from "./lib/sentry-config";
import { isSensitiveTokenUrl } from "./lib/privacy/sensitive-routes";
import {
  sanitizeSentryEvent,
  sanitizeSentrySpan,
} from "./lib/privacy/sentry-privacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sensitiveDocument =
  typeof window !== "undefined" && isSensitiveTokenUrl(window.location.href);

Sentry.init({
  dsn,
  enabled: Boolean(dsn) && !sensitiveDocument,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: parseSentrySampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  ),
  beforeSend(event) {
    return sanitizeSentryEvent(event, window.location.href);
  },
  beforeSendTransaction(event) {
    return sanitizeSentryEvent(event, window.location.href);
  },
  beforeSendSpan(span) {
    return sanitizeSentrySpan(span);
  },
});

export function onRouterTransitionStart(href: string, navigationType: string) {
  // The incoming URL may contain a bearer token before the document changes.
  if (
    isSensitiveTokenUrl(window.location.href) ||
    isSensitiveTokenUrl(href, window.location.href)
  )
    return;
  Sentry.captureRouterTransitionStart(href, navigationType);
}
