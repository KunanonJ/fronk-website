import { describe, expect, it } from "vitest";
import { parseJsonc, readWranglerVars } from "./wrangler-vars.mjs";

describe("wrangler vars for the Vite build", () => {
  it("parses comments, URLs inside strings and trailing commas", () => {
    const text = `/** header */\n{\n  // line\n  "url": "https://kunanonj.com", /* inline */\n  "list": [1, 2,],\n}`;
    expect(parseJsonc(text)).toEqual({
      url: "https://kunanonj.com",
      list: [1, 2],
    });
  });

  it("reads the public site and Sanity settings from both Worker configs", () => {
    for (const file of ["wrangler.jsonc", "wrangler.start.jsonc"]) {
      const vars = readWranglerVars(file);
      expect(vars.NEXT_PUBLIC_SITE_URL, file).toBe("https://kunanonj.com");
      expect(vars.NEXT_PUBLIC_SANITY_PROJECT_ID, file).toBeTruthy();
      expect(vars.NEXT_PUBLIC_SANITY_DATASET, file).toBe("production");
    }
  });
});
