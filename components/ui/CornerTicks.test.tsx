import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CornerTicks } from "./CornerTicks";

function tickCount(container: HTMLElement): number {
  return container.querySelectorAll("[data-corner]").length;
}

describe("CornerTicks > given no corners specified > marks all four corners", () => {
  it("renders four corner marks", () => {
    const { container } = render(<CornerTicks />);
    expect(tickCount(container)).toBe(4);
  });

  it("is decorative — hidden from assistive tech and non-interactive", () => {
    const { container } = render(<CornerTicks />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper.className).toContain("pointer-events-none");
  });
});

describe("CornerTicks > given a subset of corners > marks only those", () => {
  it("renders only the requested corners", () => {
    const { container } = render(<CornerTicks corners={["tl", "br"]} />);
    expect(tickCount(container)).toBe(2);
    expect(container.querySelector('[data-corner="tl"]')).not.toBeNull();
    expect(container.querySelector('[data-corner="br"]')).not.toBeNull();
    expect(container.querySelector('[data-corner="tr"]')).toBeNull();
  });
});
