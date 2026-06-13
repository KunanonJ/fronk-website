import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders the default variant as a mono HUD label", () => {
    render(<Badge>Live</Badge>);
    expect(screen.getByText("Live")).toHaveClass("label-mono");
  });

  it("renders the outline variant as a hairline-bordered mono label", () => {
    render(<Badge variant="outline">About</Badge>);
    const el = screen.getByText("About");
    expect(el).toHaveClass("label-mono");
    expect(el.className).toMatch(/\bborder\b/);
  });

  it("renders the inverted variant with a solid fill", () => {
    render(<Badge variant="inverted">Preview</Badge>);
    expect(screen.getByText("Preview").className).toMatch(/bg-fg/);
  });
});
