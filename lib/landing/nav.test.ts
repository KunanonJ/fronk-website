import { describe, expect, it } from "vitest";
import {
  activeSectionAtFocus,
  expandHashHref,
  isHashHref,
  isHomeSectionId,
  isNavItemActive,
  normalizePath,
  parseHomeSectionHash,
  resolveHomeAwareHref,
  scrollSpySectionIds,
} from "./nav";

describe("normalizePath", () => {
  it("normalizes empty and root", () => {
    expect(normalizePath("")).toBe("/");
    expect(normalizePath("/")).toBe("/");
  });

  it("strips a trailing slash", () => {
    expect(normalizePath("/about/")).toBe("/about");
  });
});

describe("parseHomeSectionHash", () => {
  it("accepts # and /# forms", () => {
    expect(parseHomeSectionHash("#ventures")).toBe("ventures");
    expect(parseHomeSectionHash("/#ventures")).toBe("ventures");
    expect(parseHomeSectionHash("ventures")).toBe("ventures");
  });

  it("rejects unknown or empty hashes", () => {
    expect(parseHomeSectionHash("#missing")).toBeNull();
    expect(parseHomeSectionHash("#")).toBeNull();
    expect(parseHomeSectionHash("/about")).toBeNull();
  });
});

describe("expandHashHref", () => {
  it("expands bare hashes for off-home navigation", () => {
    expect(expandHashHref("#ventures")).toBe("/#ventures");
  });

  it("leaves paths and absolute URLs alone", () => {
    expect(expandHashHref("/#ventures")).toBe("/#ventures");
    expect(expandHashHref("/about")).toBe("/about");
    expect(expandHashHref("https://example.com")).toBe("https://example.com");
  });
});

describe("isHomeSectionId", () => {
  it("matches known sections only", () => {
    expect(isHomeSectionId("ventures")).toBe(true);
    expect(isHomeSectionId("blog")).toBe(false);
  });
});

describe("scrollSpySectionIds", () => {
  it("only includes sections that have a hash nav link", () => {
    expect(
      scrollSpySectionIds([
        { href: "/" },
        { href: "/about" },
        { href: "/#ventures" },
        { href: "/contact" },
      ]),
    ).toEqual(["ventures"]);
  });

  it("dedupes and preserves order", () => {
    expect(
      scrollSpySectionIds([
        { href: "#about" },
        { href: "/#ventures" },
        { href: "/#about" },
      ]),
    ).toEqual(["about", "ventures"]);
  });
});

describe("resolveHomeAwareHref", () => {
  it("collapses /#hash to #hash on home", () => {
    expect(resolveHomeAwareHref("/#ventures", "/")).toBe("#ventures");
    expect(resolveHomeAwareHref("/#ventures", "")).toBe("#ventures");
  });

  it("keeps /#hash off-home for cross-page navigation", () => {
    expect(resolveHomeAwareHref("/#ventures", "/about")).toBe("/#ventures");
    expect(resolveHomeAwareHref("/#ventures", "/blog/")).toBe("/#ventures");
  });

  it("leaves ordinary routes untouched", () => {
    expect(resolveHomeAwareHref("/about", "/")).toBe("/about");
    expect(resolveHomeAwareHref("#ventures", "/")).toBe("#ventures");
  });
});

describe("isHashHref", () => {
  it("detects hash forms", () => {
    expect(isHashHref("#ventures")).toBe(true);
    expect(isHashHref("/#ventures")).toBe(true);
    expect(isHashHref("/ventures")).toBe(false);
  });
});

describe("activeSectionAtFocus", () => {
  const sections = [
    { id: "about", top: 100, bottom: 800 },
    { id: "ventures", top: 800, bottom: 1600 },
    { id: "contact", top: 1600, bottom: 1900 },
  ] as const;

  it("returns null above the first section", () => {
    expect(activeSectionAtFocus(sections, 40)).toBeNull();
  });

  it("uses the last section whose top crossed the focus line", () => {
    expect(activeSectionAtFocus(sections, 120)).toBe("about");
    expect(activeSectionAtFocus(sections, 900)).toBe("ventures");
    expect(activeSectionAtFocus(sections, 1700)).toBe("contact");
  });

  it("activates a short trailing section once it enters the footer band", () => {
    expect(
      activeSectionAtFocus(
        [
          { id: "ventures", top: -900, bottom: 345 },
          { id: "contact", top: 345, bottom: 820 },
        ],
        240,
        800,
      ),
    ).toBe("contact");
  });

  it("keeps the prior section while the footer only peeks at the bottom", () => {
    expect(
      activeSectionAtFocus(
        [
          { id: "ventures", top: -100, bottom: 720 },
          { id: "contact", top: 720, bottom: 1100 },
        ],
        240,
        800,
      ),
    ).toBe("ventures");
  });
});

describe("isNavItemActive", () => {
  const hashLinked = ["ventures"] as const;

  it("highlights home wordmark unless a hash-linked section is active", () => {
    expect(isNavItemActive("/", "/", null, hashLinked)).toBe(true);
    expect(isNavItemActive("/", "/", "about", hashLinked)).toBe(true);
    expect(isNavItemActive("/", "/", "contact", hashLinked)).toBe(true);
    expect(isNavItemActive("/", "/", "ventures", hashLinked)).toBe(false);
  });

  it("highlights section links from # and /# forms", () => {
    expect(isNavItemActive("/#ventures", "/", "ventures")).toBe(true);
    expect(isNavItemActive("#ventures", "/", "ventures")).toBe(true);
    expect(isNavItemActive("/#ventures", "/", "about")).toBe(false);
    expect(isNavItemActive("/#ventures", "/about", "ventures")).toBe(false);
  });

  it("highlights named routes by pathname", () => {
    expect(isNavItemActive("/about", "/about", null)).toBe(true);
    expect(isNavItemActive("/blog", "/blog/hello", null)).toBe(true);
    expect(isNavItemActive("/press", "/", null)).toBe(false);
  });
});
