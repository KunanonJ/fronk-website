import { describe, expect, it } from "vitest";
import { routeShareMeta } from "./routeMeta";

describe("routeShareMeta", () => {
  it("sets matching canonical, openGraph.url, and twitter title for the route", () => {
    const meta = routeShareMeta({
      title: "About",
      description: "Founder story from Bangkok.",
      path: "/about",
    });

    expect(meta.alternates?.canonical).toBe("/about");
    expect(meta.openGraph?.url).toContain("/about");
    expect(meta.openGraph?.title).toBe("About");
    expect(meta.twitter?.title).toBe("About");
    expect(meta.description).toBe("Founder story from Bangkok.");
  });

  it("supports article type with publishedTime", () => {
    const meta = routeShareMeta({
      title: "Shipping from Bangkok",
      description: "Notes",
      path: "/blog/shipping-from-bangkok",
      type: "article",
      publishedTime: "2026-06-12",
      images: ["https://example.com/a.jpg"],
    });

    const og = meta.openGraph as {
      type?: string;
      publishedTime?: string;
    };
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-06-12");
  });
});
