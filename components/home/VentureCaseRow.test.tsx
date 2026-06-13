import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VentureCaseRow } from "./VentureCaseRow";
import type { Venture } from "@/lib/content/ventures";

const WITH_METRICS: Venture = {
  slug: "demo",
  name: "DemoCo",
  tagline: "A demo venture.",
  description: "DemoCo does demo things for demo people.",
  year: 2023,
  role: "Founder",
  status: "active",
  stack: ["Alpha", "Beta"],
  url: "https://demo.example",
  urlLabel: "demo.example",
  metrics: [
    { value: "1,000+", label: "Users" },
    { value: "99%", label: "Uptime" },
  ],
  featured: true,
};

const NO_METRICS: Venture = {
  ...WITH_METRICS,
  slug: "plain",
  name: "PlainCo",
  tagline: "No numbers to show yet.",
  url: "https://plain.example",
  urlLabel: "plain.example",
  metrics: undefined,
};

function layout(container: HTMLElement): string | null {
  return container.querySelector("[data-layout]")?.getAttribute("data-layout") ?? null;
}

describe("VentureCaseRow > alternates the layout by position", () => {
  it("places text then visual on an even index", () => {
    const { container } = render(<VentureCaseRow venture={WITH_METRICS} index={0} />);
    expect(layout(container)).toBe("text-visual");
  });

  it("reverses to visual then text on an odd index", () => {
    const { container } = render(<VentureCaseRow venture={WITH_METRICS} index={1} />);
    expect(layout(container)).toBe("visual-text");
  });
});

describe("VentureCaseRow > renders the venture's content", () => {
  it("shows the name as a heading and the description", () => {
    render(<VentureCaseRow venture={WITH_METRICS} index={0} />);
    expect(screen.getByRole("heading", { name: "DemoCo" })).toBeInTheDocument();
    expect(
      screen.getByText(/democo does demo things/i),
    ).toBeInTheDocument();
  });

  it("links out to the venture url safely", () => {
    render(<VentureCaseRow venture={WITH_METRICS} index={0} />);
    const link = screen.getByRole("link", { name: /demo\.example/i });
    expect(link).toHaveAttribute("href", "https://demo.example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});

describe("VentureCaseRow > metrics panel is honest", () => {
  it("renders each real metric value and label when present", () => {
    const { container } = render(<VentureCaseRow venture={WITH_METRICS} index={0} />);
    const panel = container.querySelector("[data-panel]") as HTMLElement;
    expect(panel).not.toBeNull();
    const scoped = within(panel);
    expect(scoped.getByText("1,000+")).toBeInTheDocument();
    expect(scoped.getByText("Users")).toBeInTheDocument();
    expect(scoped.getByText("99%")).toBeInTheDocument();
    expect(scoped.getByText("Uptime")).toBeInTheDocument();
  });

  it("wakes the instrument panel on hover (panel-live)", () => {
    const { container } = render(<VentureCaseRow venture={WITH_METRICS} index={0} />);
    const panel = container.querySelector("[data-panel]") as HTMLElement;
    expect(panel.className).toContain("panel-live");
  });

  it("invents no figures when a venture has no metrics, but keeps its tagline", () => {
    render(<VentureCaseRow venture={NO_METRICS} index={0} />);
    expect(screen.queryByText("1,000+")).toBeNull();
    expect(screen.queryByText("99%")).toBeNull();
    expect(screen.getByText("No numbers to show yet.")).toBeInTheDocument();
  });

  it("fills the panel with the stack when a venture has no metrics", () => {
    const { container } = render(<VentureCaseRow venture={NO_METRICS} index={0} />);
    const panel = within(container.querySelector("[data-panel]") as HTMLElement);
    expect(panel.getByText("Alpha")).toBeInTheDocument();
    expect(panel.getByText("Beta")).toBeInTheDocument();
  });
});
