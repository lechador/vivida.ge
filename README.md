This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Weekly SEO and product audit agent

The project embeds a read-only [eve](https://github.com/vercel/eve) agent. Vercel runs it every Monday at 06:00 UTC (10:00 Asia/Tbilisi). It compares the latest 28 complete days with the preceding 28 days, audits public SEO markup and public PageSpeed data, and delivers one Georgian report.

The agent cannot edit files, run shell commands, browse arbitrary URLs, deploy, or publish site content. Its production HTTP routes accept Vercel OIDC only and otherwise fail closed.

Required Vercel project setup:

1. Enable Web Analytics and Speed Insights in the Vercel dashboard. Their client collectors are already mounted in the root layout.
2. Create a dedicated Google service account and add its `client_email` as a viewer to the GA4 property and both Search Console properties.
3. Add `GOOGLE_SEO_SERVICE_ACCOUNT_JSON`, `GA4_PROPERTY_ID`, and `GSC_SITE_URLS` from `.env.example` to Vercel Production environment variables.
4. Set either `SEO_AUDIT_RECIPIENT_EMAIL` (uses the existing Resend configuration) or `SEO_AUDIT_WEBHOOK_URL`. Without either one, reports are written to Vercel Logs.

PageSpeed checks use Google's public endpoint without an API key. If its public quota is temporarily unavailable, the report records that data gap and continues with GA4, Search Console, and the public-site audit.

Useful commands:

```bash
npm run eve:info
npm run eve:build
```

During local development, trigger the schedule once with:

```bash
curl -X POST http://localhost:2000/eve/v1/dev/schedules/weekly-audit
```
