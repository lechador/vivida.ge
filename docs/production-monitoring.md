# Production error monitoring

Vivida uses `@sentry/nextjs` for uncaught browser, React, Node.js, Edge, and
nested React Server Component errors. The integration is inert when no DSN is
configured, so local development and pull-request CI do not emit events.

## Deployment setup

Create a Sentry Next.js project and add these variables to the Vercel
**Production** environment:

- `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`: the project's DSN. Using the same
  value for both is fine.
- `SENTRY_ORG` and `SENTRY_PROJECT`: the organization and project slugs.
- `SENTRY_AUTH_TOKEN`: a protected organization token with release/source-map
  upload access. Never expose it through a `NEXT_PUBLIC_` variable.
- `SENTRY_ENVIRONMENT` and `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: `production`.
- `SENTRY_TRACES_SAMPLE_RATE` and
  `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: start at `0.1`, then tune from real
  traffic and quota usage.

Redeploy after setting the variables. Source maps are uploaded only when the
auth token, organization, and project are all present; missing build credentials
never make a local or preview build fail.

## Alerts

In **Sentry → Alerts → Create Alert → Issues**, create one production rule with
these conditions:

1. A new issue is created or a resolved issue regresses.
2. The same issue is seen at least 20 times in 5 minutes.
3. Send the action to the engineering email/Slack channel.

Keep the alert environment filter on `production` to avoid preview noise.

## Verification

After the first configured deployment, throw a temporary error from a private
test branch, confirm that it appears with a readable application stack trace,
and remove the throw immediately. Verify one browser error and one server route
error. Do not add a permanent public “test error” endpoint.

The SDK keeps default PII collection disabled; do not enable it globally. Add
user identifiers only through an explicit, reviewed sanitization policy.
