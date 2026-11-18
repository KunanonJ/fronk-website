import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DesignSystemPage from "@/components/system/DesignSystemPage";
import { SAMPLE_NOTES } from "@/components/profile/preview/sampleNotes";

/*
 * /design (profile redesign Phase 7g): the content of the deleted
 * /preview/system on the unlinked design-system page, with the sample
 * notebook back for its browser checks (profile-journey.spec.ts).
 */

beforeEach(() => {
  // The marquee, the reveals and the notebook read the motion preference.
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DesignSystemPage", () => {
  it("keeps the h1 the parity reference holds, in the new hero", () => {
    render(<DesignSystemPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/^Design system$/);
    expect(h1).toHaveClass("t-display");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("shows every part of the new design, section by section", () => {
    render(<DesignSystemPage />);
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "Colour",
      "Type",
      "Shape and depth",
      "Primitives",
      "Notebook, with sample notes",
      "States and preferences",
    ]);
    // Swatches paint tokens, never raw values.
    const colour = screen.getByRole("region", { name: "Colour" });
    expect(within(colour).getByText("--accent")).toBeInTheDocument();
    expect(colour.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it("brings back the sample notebook, labelled as samples", () => {
    const { container } = render(<DesignSystemPage />);
    const notebook = container.querySelector(
      "section[aria-labelledby='notebook']",
    );
    expect(notebook).not.toBeNull();
    expect(notebook).toHaveTextContent("These three notes are samples");
    expect(notebook!.querySelectorAll("article")).toHaveLength(
      SAMPLE_NOTES.length,
    );
  });

  it("has its own theme switch, since the page has no site chrome", () => {
    render(<DesignSystemPage />);
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Dark" })).not.toBeChecked();
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
  });
});
