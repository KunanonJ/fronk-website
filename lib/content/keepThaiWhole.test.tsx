import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { keepThaiWordsWhole } from "@/lib/content/keepThaiWhole";

function draw(text: string) {
  const { container } = render(<p>{keepThaiWordsWhole(text)}</p>);
  const p = container.querySelector("p")!;
  const kept = [...p.querySelectorAll("span")].map((span) => ({
    text: span.textContent,
    nowrap: span.style.whiteSpace === "nowrap",
  }));
  return { text: p.textContent, kept };
}

describe("keepThaiWordsWhole", () => {
  it("draws each listed Thai word in a span that does not wrap, and changes no text", () => {
    const text =
      "ลดเครื่องมือกระจัดกระจาย สำหรับ SME และสตาร์ทอัพในไทย ผู้ใช้ลงทะเบียน 1,000 ราย";
    const { text: drawn, kept } = draw(text);
    expect(drawn).toBe(text);
    expect(kept).toEqual([
      { text: "เครื่องมือ", nowrap: true },
      { text: "กระจัดกระจาย", nowrap: true },
      { text: "สตาร์ทอัพ", nowrap: true },
      { text: "ลงทะเบียน", nowrap: true },
    ]);
  });

  it("keeps a word whole each time it comes", () => {
    const { kept } = draw("สต็อก และสต็อก");
    expect(kept.map((span) => span.text)).toEqual(["สต็อก", "สต็อก"]);
  });

  it("returns text without the words as it is", () => {
    expect(keepThaiWordsWhole("ความหมายในบริบทไทย")).toBe("ความหมายในบริบทไทย");
    expect(keepThaiWordsWhole("Startups in Bangkok.")).toBe(
      "Startups in Bangkok.",
    );
  });
});
