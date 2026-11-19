import { describe, expect, it } from "vitest";

import { safeHref } from "./safeHref";

describe("safeHref", () => {
  it.each([
    "https://example.com/a?b=c#d",
    "http://example.com",
    "mailto:hello@example.com?subject=Hi",
    "tel:+6620000000",
    "/portfolio/tbh-intranet",
    "//example.com/path",
    "#ventures",
    "?tag=ai",
    "resume.pdf",
  ])("keeps %s", (href) => {
    expect(safeHref(href)).toBe(href);
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "\u0000javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "search-ms:query=x&crumb=location:\\\\attacker\\share",
    "http://[bad",
  ])("refuses %j", (href) => {
    expect(safeHref(href)).toBeUndefined();
  });
});
