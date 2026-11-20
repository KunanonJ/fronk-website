import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProfileMain } from "@/components/profile/site/ProfileMain";

/*
 * The reading line (reading aids): only the long reads draw it, as hidden
 * decoration, and their <main> carries the class its view timeline needs.
 */
describe("ProfileMain", () => {
  it("draws no reading line by default", () => {
    const html = renderToString(<ProfileMain>Page</ProfileMain>);
    expect(html).not.toContain("pf-reading");
  });

  it("draws a hidden reading line first on a long read", () => {
    const html = renderToString(<ProfileMain reading>Page</ProfileMain>);
    expect(html).toMatch(
      /^<main id="main" tabindex="-1" class="pf-main outline-none pf-main--reading"><div class="pf-reading" aria-hidden="true"><\/div>Page<\/main>$/,
    );
  });
});
