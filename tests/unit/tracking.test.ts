import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildTrackingPixelUrl, buildClickRedirectUrl, buildUnsubscribeUrl } from "../../lib/tracking";

describe("tracking helpers", () => {
  const original = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = original;
  });

  it("builds pixel URL", () => {
    expect(
      buildTrackingPixelUrl({ campaignId: "camp-1", subscriberId: "sub-1" })
    ).toBe("https://example.com/api/track/open?campaignId=camp-1&subscriberId=sub-1");
  });

  it("builds click URL", () => {
    expect(
      buildClickRedirectUrl({ token: "tok", subscriberId: "sub-2" })
    ).toBe("https://example.com/api/track/click?token=tok&subscriberId=sub-2");
  });

  it("builds unsubscribe URL", () => {
    expect(buildUnsubscribeUrl({ token: "unsub" })).toBe(
      "https://example.com/unsubscribe?token=unsub"
    );
  });
});
