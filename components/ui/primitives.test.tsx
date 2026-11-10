import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "@/components/ui/Chip";
import { PixelGrid, pixelCells } from "@/components/ui/PixelGrid";

describe("Chip", () => {
  it("renders a 12 px mono label without state", () => {
    render(<Chip>Fintech</Chip>);
    const chip = screen.getByText("Fintech");
    expect(chip.className).toMatch(/text-label/);
    expect(chip.querySelector(".bg-ember")).toBeNull();
  });

  it.each([
    ["live", "Live"],
    ["failed", "Failed"],
  ] as const)("pairs the Ember square with a word for %s", (state, word) => {
    const { container } = render(<Chip state={state}>Validator</Chip>);
    expect(container.querySelector(".bg-ember")).not.toBeNull();
    expect(screen.getByText(word)).toBeInTheDocument();
    // Ember sits on the chip's Paper surface, never on a tint.
    expect((container.firstElementChild as HTMLElement).className).toMatch(
      /bg-surface\b/,
    );
  });
});

describe("PixelGrid", () => {
  const opts = { cols: 16, rows: 6, seed: 42, density: 0.45 } as const;

  it("is deterministic for the same seed (no hydration mismatch)", () => {
    expect(pixelCells({ ...opts, state: "idle" })).toEqual(
      pixelCells({ ...opts, state: "idle" }),
    );
    expect(pixelCells({ ...opts, state: "idle" })).not.toEqual(
      pixelCells({ ...opts, seed: 43, state: "idle" }),
    );
  });

  it("uses Ember only for live or failed state", () => {
    const tones = (state: "idle" | "live" | "failed") =>
      pixelCells({ ...opts, state }).filter((c) => c.tone === "ember").length;
    expect(tones("idle")).toBe(0);
    expect(tones("live")).toBeGreaterThan(0);
    expect(tones("failed")).toBeGreaterThan(0);
  });

  it("draws the canvas 404 art in accent, river and Ember squares", () => {
    const { container } = render(
      <PixelGrid cols={12} rows={8} seed={404} state="failed" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("viewBox", "0 0 177 117");
    const fills = Array.from(svg.querySelectorAll("rect")).map(
      (r) => r.getAttribute("class") ?? "",
    );
    expect(fills).toHaveLength(42);
    expect(fills.filter((c) => c.includes("fill-ember"))).toHaveLength(3);
    expect(fills.every((c) => /fill-(mark|\(--river\)|ember)/.test(c))).toBe(
      true,
    );
  });

  it("is decorative by default and an image when labelled", () => {
    const { container, unmount } = render(<PixelGrid />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    unmount();
    render(<PixelGrid label="Validator activity" state="live" />);
    expect(
      screen.getByRole("img", { name: "Validator activity" }),
    ).toBeInTheDocument();
  });
});
