import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "@/components/profile/home/SectionHeader";

/*
 * The Home's section header (design spec 8.4 and 8.5), shared with the
 * sections of Phase 4: eyebrow, h2 and lead, with the ids a section uses for
 * its name.
 */
describe("SectionHeader", () => {
  it("renders the eyebrow, an h2 and the lead, with their ids", () => {
    render(
      <section aria-labelledby="demo-eyebrow">
        <SectionHeader
          eyebrow="Selected work"
          eyebrowId="demo-eyebrow"
          title="Projects and ventures."
          titleId="demo-title"
          lead="One line."
        />
      </section>,
    );
    expect(
      screen.getByRole("region", { name: "Selected work" }),
    ).toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Projects and ventures.");
    expect(heading).toHaveAttribute("id", "demo-title");
    expect(heading).toHaveClass("t-title");
    expect(screen.getByText("One line.")).toHaveClass("pf-section-head__lead");
    expect(screen.getByText("Selected work")).toHaveClass("ds-eyebrow");
  });

  it("sets the h2's measure in ch: 13 by default, or the section's own", () => {
    expect(renderToString(<SectionHeader eyebrow="A" title="Title" />)).toMatch(
      /<h2[^>]*style="max-inline-size:13ch"/,
    );
    expect(
      renderToString(
        <SectionHeader eyebrow="A" title="Title" titleMaxWidth={10} />,
      ),
    ).toMatch(/<h2[^>]*style="max-inline-size:10ch"/);
  });

  it("leaves the lead out when there is none, and centres on request", () => {
    const { container } = render(
      <SectionHeader eyebrow="Notes" title="Title" align="centred" />,
    );
    expect(container.querySelector(".pf-section-head__lead")).toBeNull();
    expect(container.firstElementChild).toHaveClass("pf-section-head--centred");
    expect(screen.getByText("Notes")).toHaveClass("ds-eyebrow--centred");
  });
});
