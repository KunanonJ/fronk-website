import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Notes from "@/components/profile/home/Notes";
import HomePage from "@/components/profile/home/HomePage";
import { withRouter } from "@/tests/routerContext";
import {
  notebookEntries,
  notesCopy,
  type Testimonial,
} from "@/lib/content/testimonials";

/*
 * The Home's notebook section (design spec 8.7; plan step 4d and gate 4):
 * with zero to two cleared quotes there is no section, no heading and no link
 * to it; from three, the section and its notebook render.
 */

const cleared = (name: string): Testimonial => ({
  quote: `Words ${name} agreed to publish.`,
  name,
  role: "Engineer",
  initials: name.slice(0, 2).toUpperCase(),
  source: "LinkedIn recommendation",
  clearedOn: "18-11-26",
});

describe("Notes", () => {
  it("renders nothing with zero, one or two cleared quotes", () => {
    for (const entries of [
      [],
      [cleared("Ann")],
      [cleared("Ann"), cleared("Bo")],
    ])
      expect(renderToString(<Notes entries={entries} />)).toBe("");
  });

  it("renders the section, its heading and the notebook from three", async () => {
    render(<Notes entries={[cleared("Ann"), cleared("Bo"), cleared("Cy")]} />);
    expect(
      screen.getByRole("region", { name: notesCopy.heading }),
    ).toBeInTheDocument();
    // The notebook's code loads on demand, so it arrives a moment later.
    expect(
      await screen.findByRole("group", { name: notesCopy.label }),
    ).toBeInTheDocument();
    expect(screen.getByText(notesCopy.eyebrow)).toHaveClass(
      "ds-eyebrow--centred",
    );
  });

  it("leaves the Home without a notebook, a heading or a link to it while fewer than three are cleared", () => {
    // The hero's ScriptOnce reads the router, as in the app.
    const html = renderToString(withRouter(<HomePage />));
    if (notebookEntries().length > 0) {
      expect(html).toContain('aria-labelledby="notes-title"');
      return;
    }
    expect(html).not.toContain("pf-notes");
    expect(html).not.toContain("notes-title");
    expect(html).not.toContain(notesCopy.heading);
    expect(html).not.toContain('href="#notes"');
  });
});
