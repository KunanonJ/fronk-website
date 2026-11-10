import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversionEvents, track } from "./track";

describe("track (Umami)", () => {
  afterEach(() => {
    delete window.umami;
  });

  it("is a no-op without the Umami tracker", () => {
    expect(() => track("test_event", { a: 1 })).not.toThrow();
  });

  it("sends the event with only the defined properties", () => {
    const umamiTrack = vi.fn();
    window.umami = { track: umamiTrack };
    track(ConversionEvents.topicHubCta, { topic: "erp", venture: undefined });
    expect(umamiTrack).toHaveBeenCalledWith("topic_hub_cta", { topic: "erp" });
  });
});
