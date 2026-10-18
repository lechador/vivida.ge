import { describe, expect, it } from "vitest";
import { render } from "@react-email/render";
import { createElement } from "react";

import {
  BookingPaidEmail,
  bookingPaidSubject,
} from "@/lib/email-templates/bazaar-booking-paid";
import {
  ReadingDeliveredEmail,
  readingDeliveredSubject,
} from "@/lib/email-templates/bazaar-reading-delivered";

/**
 * Bazaar transactional mail carries money events, a wrong name, amount, or
 * link reads as fraud. These pin the rendered copy (no sends here).
 */
describe("bazaar emails", () => {
  it("tells the reader who paid, what for, and where the order is", async () => {
    const html = await render(
      createElement(BookingPaidEmail, {
        recipientName: "Maya",
        buyerName: "Alex",
        serviceTitle: "Celtic Cross Deep-Dive",
        amountUsdc: "19.99",
        orderUrl: "https://www.vividaastro.com/readings?view=bookings",
        locale: "en",
      }),
    );
    expect(html).toContain("You have a paid order");
    expect(html).toContain("Alex");
    expect(html).toContain("19.99");
    expect(html).toContain("Celtic Cross Deep-Dive");
    expect(html).toContain(
      "https://www.vividaastro.com/readings?view=bookings",
    );
    // Private content stays out of the inbox: the email points to it, and
    // the template signature never even accepts question or birth data.
    expect(html).toContain("waiting in your inbox");
    expect(html).not.toContain("Will I find love");
    expect(bookingPaidSubject("Celtic Cross Deep-Dive")).toBe(
      "New paid order: Celtic Cross Deep-Dive · Vivida",
    );
  });

  it("tells the buyer their reading is ready without leaking it", async () => {
    const html = await render(
      createElement(ReadingDeliveredEmail, {
        recipientName: "Alex",
        readerName: "Maya K.",
        serviceTitle: "Celtic Cross Deep-Dive",
        readingUrl: "https://www.vividaastro.com/readings?view=bookings",
        locale: "en",
      }),
    );
    expect(html).toContain("Your reading is ready");
    expect(html).toContain("Maya K.");
    expect(html).toContain("Read your reading");
    expect(html).toContain("review");
    expect(readingDeliveredSubject()).toBe("Your reading is ready · Vivida");
  });

  it("greets nameless recipients without breaking", async () => {
    const html = await render(
      createElement(BookingPaidEmail, {
        recipientName: null,
        buyerName: "Alex",
        serviceTitle: "X",
        amountUsdc: "5.00",
        orderUrl: "https://www.vividaastro.com/readings?view=bookings",
        locale: "en",
      }),
    );
    expect(html).toContain("Hello!");
  });
});
