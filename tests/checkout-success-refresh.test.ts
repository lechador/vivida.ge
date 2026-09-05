import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  effect: undefined as undefined | (() => void),
  refresh: vi.fn(),
  replace: vi.fn(),
  fbTrack: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
}));
vi.mock("react", () => ({ useEffect: (effect: () => void) => { mocks.effect = effect; } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams("status=success&session_id=cs_paid"),
}));
vi.mock("@/lib/fb-pixel", () => ({ fbTrack: mocks.fbTrack }));
vi.mock("@/lib/analytics", () => ({ ANALYTICS_EVENT: {}, trackEvent: vi.fn() }));

import { CheckoutSuccessTracker } from "@/components/billing/checkout-success-tracker";

beforeEach(() => {
  mocks.getItem.mockReturnValue(null);
  mocks.fbTrack.mockReset();
  vi.stubGlobal("sessionStorage", { getItem: mocks.getItem, setItem: mocks.setItem });
});
afterEach(() => vi.unstubAllGlobals());

it("refreshes the server-rendered balance after successful reconciliation even if analytics throws", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ kind: "credits", value: 6.9, currency: "GEL", contentId: "credits_30" }),
  }));
  mocks.fbTrack.mockImplementation(() => { throw new Error("analytics unavailable"); });
  CheckoutSuccessTracker();
  mocks.effect!();
  await vi.waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
});

it("does not refresh repeatedly when the purchase has already been tracked", () => {
  mocks.getItem.mockReturnValue("1");
  vi.stubGlobal("fetch", vi.fn());
  CheckoutSuccessTracker();
  mocks.effect!();
  expect(fetch).not.toHaveBeenCalled();
  expect(mocks.refresh).not.toHaveBeenCalled();
});
