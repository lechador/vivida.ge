import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchJson, safeIntegrationError } from "../lib/http";

type ResendResponse = { id?: string };

export default defineTool({
  description:
    "Publish the final weekly Georgian audit report to the operator-configured destination. The destination is fixed by environment variables and cannot be chosen by the model.",
  inputSchema: z.object({
    report: z.string().min(200).max(7_000),
  }),
  async execute({ report }, ctx) {
    const webhookUrl = process.env.SEO_AUDIT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(process.env.SEO_AUDIT_WEBHOOK_BEARER
              ? {
                  authorization: `Bearer ${process.env.SEO_AUDIT_WEBHOOK_BEARER}`,
                }
              : {}),
          },
          body: JSON.stringify({ text: report }),
          signal: AbortSignal.any([
            ctx.abortSignal,
            AbortSignal.timeout(20_000),
          ]),
        });
        if (!response.ok) {
          throw new Error(`Webhook returned HTTP ${response.status}`);
        }
        return { published: true, destination: "webhook" };
      } catch (error) {
        const reason = safeIntegrationError(error);
        throw new Error(`Audit webhook delivery failed: ${reason}`);
      }
    }

    const recipient = process.env.SEO_AUDIT_RECIPIENT_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (recipient && resendKey && from) {
      try {
        const result = await fetchJson<ResendResponse>(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${resendKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: [recipient],
              subject: "Vivida — ყოველკვირეული SEO და პროდუქტის აუდიტი",
              text: report,
            }),
            signal: ctx.abortSignal,
          },
        );
        console.info(
          `[seo-audit-delivery] ${JSON.stringify({
            published: true,
            destination: "email",
            deliveryId: result.id ?? null,
          })}`,
        );
        return {
          published: true,
          destination: "email",
          deliveryId: result.id ?? null,
        };
      } catch (error) {
        const reason = safeIntegrationError(error);
        console.error(
          `[seo-audit-delivery] ${JSON.stringify({
            published: false,
            destination: "email",
            reason,
          })}`,
        );
        throw new Error(`Audit email delivery failed: ${reason}`);
      }
    }

    const missing = {
      recipient: !recipient,
      resendKey: !resendKey,
      from: !from,
    };
    console.error(
      `[seo-audit-delivery] ${JSON.stringify({
        published: false,
        destination: "email",
        reason: "missing_configuration",
        missing,
      })}`,
    );
    throw new Error(
      `Audit email delivery is not configured: ${Object.entries(missing)
        .filter(([, isMissing]) => isMissing)
        .map(([name]) => name)
        .join(", ")}`,
    );
  },
});
