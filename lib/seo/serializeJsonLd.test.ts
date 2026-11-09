import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./serializeJsonLd";

describe("serializeJsonLd", () => {
  it("cannot close the script tag it lives in", () => {
    const out = serializeJsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script");
    expect(JSON.parse(out)).toEqual({ headline: "</script><script>alert(1)</script>" });
  });

  it("leaves ordinary JSON-LD byte-identical", () => {
    const data = { "@type": "Person", name: "Fronk Kunanon Jarat", jobTitle: "IT Manager & AI Engineering Lead" };
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
