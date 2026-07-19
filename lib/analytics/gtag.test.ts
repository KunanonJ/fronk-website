import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversionEvents, track, trackConversion } from "./gtag";

describe("track / trackConversion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.gtag;
    delete window.dataLayer;
  });

  it("track is a no-op without gtag", () => {
    expect(() => track("test_event")).not.toThrow();
  });

  it("trackConversion pushes dataLayer and calls gtag when present", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.dataLayer = [];

    trackConversion(ConversionEvents.topicHubCta, { topic: "erp" });

    expect(gtag).toHaveBeenCalledWith("event", "topic_hub_cta", {
      topic: "erp",
    });
    expect(window.dataLayer).toContainEqual({
      event: "topic_hub_cta",
      topic: "erp",
    });
  });
});
