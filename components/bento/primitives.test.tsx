import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BentoCard, bentoSpan } from "@/components/bento/Bento";

describe("BentoCard", () => {
  it("labels each card by its kicker heading and maps spans", () => {
    render(
      <BentoCard headingId="card-x" title="Experience" span={3}>
        <p>inside</p>
      </BentoCard>,
    );
    const card = screen.getByRole("article", { name: "Experience" });
    expect(card.className).toMatch(/rounded-bento/);
    expect(card.className).toMatch(/lg:col-span-3/);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "card-x",
    );
  });

  it("spans two columns from 641 px when wider than one", () => {
    expect(bentoSpan(1)).toBe("");
    expect(bentoSpan(2)).toBe("min-[641px]:col-span-2");
    expect(bentoSpan(3)).toBe("min-[641px]:col-span-2 lg:col-span-3");
  });
});
