import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

import { EmailLayout } from "@/lib/email-templates/_layout";

/**
 * The layout footer is the one piece of copy every email shares, so a locale
 * bug there reaches every reader at once. It has had exactly that bug: written
 * as `locale === "en"`, Armenian fell through to the *Georgian* branch — a
 * script its reader cannot read, in an email whose body was Armenian.
 *
 * lib/i18n/locale.ts documents the trap. These assertions are the guard.
 */
function layout(locale: "ka" | "en" | "am", unsubscribeUrl?: string) {
  return render(
    // `children` goes in the props object because vitest only collects
    // `tests/**/*.test.ts`, so there is no JSX here to nest it in.
    // eslint-disable-next-line react/no-children-prop
    createElement(EmailLayout, {
      preview: "preview",
      locale,
      unsubscribeUrl,
      children: createElement("p", null, "body"),
    }),
  );
}

describe("EmailLayout footer", () => {
  it("writes the footer in Armenian, not Georgian, for Armenian readers", async () => {
    const html = await layout("am");

    expect(html).toContain("Այս նամակն ավտոմատ կերպով ուղարկվել է Vivida-ից");
    expect(html).not.toContain("ეს წერილი ავტომატურად გამოიგზავნა");
    expect(html).not.toContain("This email was sent automatically");
  });

  it("localises the unsubscribe link too", async () => {
    await expect(layout("am", "https://vivida.ge/unsubscribe?t=1")).resolves.toContain(
      "Չեղարկել բաժանորդագրությունը",
    );
    await expect(layout("en", "https://vivida.ge/unsubscribe?t=1")).resolves.toContain(
      "Unsubscribe",
    );
    await expect(layout("ka", "https://vivida.ge/unsubscribe?t=1")).resolves.toContain(
      "გამოწერის გაუქმება",
    );
  });

  it("leaves Georgian and English readers where they were", async () => {
    await expect(layout("ka")).resolves.toContain(
      "ეს წერილი ავტომატურად გამოიგზავნა vivida.ge-დან",
    );
    await expect(layout("en")).resolves.toContain(
      "This email was sent automatically by Vivida",
    );
  });

  it("stamps the reader's language on the document", async () => {
    for (const locale of ["ka", "en", "am"] as const) {
      await expect(layout(locale)).resolves.toContain(`lang="${locale}"`);
    }
  });
});
