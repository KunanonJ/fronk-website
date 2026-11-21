import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Notes from "@/components/profile/home/Notes";
import { notesCopy, type Testimonial } from "@/lib/content/testimonials";

/*
 * The notebook's code fails to load (a stale `Notebook-*.js` after a deploy):
 * the notes section goes and the rest of the page stays, rather than the
 * route's error page taking the whole Home (profile redesign Phase 4 review,
 * finding 5).
 */

// A missing chunk rejects with a TypeError in every engine. Vitest wraps an
// error its mock factory throws in an Error of its own, so the mock loads,
// and Notes' loader, reading Notebook from it, gets the TypeError.
vi.mock("@/components/profile/home/Notebook", () => ({
  get Notebook(): never {
    throw new TypeError(
      "Failed to fetch dynamically imported module: /assets/Notebook-x1.js",
    );
  },
}));

const cleared = (name: string): Testimonial => ({
  quote: `Words ${name} agreed to publish.`,
  name,
  role: "Engineer",
  initials: name.slice(0, 2).toUpperCase(),
  source: "LinkedIn recommendation",
  clearedOn: "18-11-26",
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Notes, when the notebook's code fails to load", () => {
  it("holds the notebook's place while it loads, then drops only the section", async () => {
    // React reports the error it caught; the test reads the page instead.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <main>
        <h1>Home</h1>
        <Notes entries={[cleared("Ann"), cleared("Bo"), cleared("Cy")]} />
        <p>The rest of the Home</p>
      </main>,
    );
    // While the code loads: a reserved, empty place under the heading.
    expect(
      container.querySelector(".pf-book-wrap--pending"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: notesCopy.heading }),
      ).toBeNull(),
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Home");
    expect(screen.getByText("The rest of the Home")).toBeInTheDocument();
  });
});
