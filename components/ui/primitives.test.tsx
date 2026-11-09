import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { PixelGrid, pixelCells } from "@/components/ui/PixelGrid";
import { Section } from "@/components/ui/Section";

describe("Card", () => {
  it("maps each tone to its role classes, with the card radius and hairline", () => {
    const cases = {
      paper: /bg-surface\b/,
      tint: /bg-surface-tint/,
      warm: /bg-surface-warm/,
      ink: /bg-ink/,
    } as const;
    for (const [tone, re] of Object.entries(cases)) {
      const { container, unmount } = render(
        <Card tone={tone as keyof typeof cases}>x</Card>,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toMatch(re);
      expect(el.className).toMatch(/rounded-card/);
      expect(el.className).toMatch(/border-hairline/);
      unmount();
    }
  });
});

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
    expect((container.firstElementChild as HTMLElement).className).toMatch(/bg-surface\b/);
  });
});

describe("MonoLabel", () => {
  it("is uppercase mono at the 12 px label size", () => {
    render(<MonoLabel>Portfolio</MonoLabel>);
    const el = screen.getByText("Portfolio");
    expect(el.className).toMatch(/font-mono/);
    expect(el.className).toMatch(/text-label/);
    expect(el.className).toMatch(/uppercase/);
  });
});

describe("Section", () => {
  it("labels the section with its heading", () => {
    render(
      <Section id="work" eyebrow="Selected" heading="Work">
        <p>body</p>
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Work" });
    expect(region).toHaveAttribute("id", "work");
    expect(screen.getByRole("heading", { level: 2, name: "Work" })).toBeInTheDocument();
  });
});

describe("PixelGrid", () => {
  const opts = { cols: 16, rows: 6, seed: 42, density: 0.45 } as const;

  it("is deterministic for the same seed (no hydration mismatch)", () => {
    expect(pixelCells({ ...opts, state: "idle" })).toEqual(pixelCells({ ...opts, state: "idle" }));
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

  it("is decorative by default and an image when labelled", () => {
    const { container, unmount } = render(<PixelGrid />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    unmount();
    render(<PixelGrid label="Validator activity" state="live" />);
    expect(screen.getByRole("img", { name: "Validator activity" })).toBeInTheDocument();
  });
});
