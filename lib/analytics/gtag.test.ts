import { afterEach, describe, expect, it, vi } from "vitest";
import { track } from "./gtag";

afterEach(() => {
  delete window.gtag;
});

describe("track > GA4 event helper", () => {
  it("no-ops (does not throw) when gtag is not on the page", () => {
    delete window.gtag;
    expect(() => track("select_venture", { venture: "GoGoCash" })).not.toThrow();
  });

  it("forwards the event name and params to gtag", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    track("select_venture", { venture: "GoGoCash" });
    expect(gtag).toHaveBeenCalledWith("event", "select_venture", {
      venture: "GoGoCash",
    });
  });

  it("sends an empty params object when none are given", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    track("newsletter_subscribe");
    expect(gtag).toHaveBeenCalledWith("event", "newsletter_subscribe", {});
  });
});
