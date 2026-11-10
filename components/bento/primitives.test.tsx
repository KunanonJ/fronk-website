import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Bento,
  BentoCard,
  BentoPair,
  CardLink,
  Well,
} from "@/components/bento/Bento";
import { CtaLink, GlassLink } from "@/components/bento/Buttons";
import {
  AvailabilityPill,
  EyebrowChip,
  LivePill,
  MetaTag,
  TechChip,
} from "@/components/bento/Chips";
import { Segmented } from "@/components/bento/Segmented";
import SiteFooter from "@/components/bento/SiteFooter";

describe("Bento grid", () => {
  it("is one column on phones, two from 641px, three from 1024px", () => {
    const { container } = render(
      <Bento dense>
        <div />
      </Bento>,
    );
    const grid = container.firstElementChild!;
    expect(grid.className).toMatch(/\bbento\b/);
    expect(grid.className).toMatch(/grid-cols-1/);
    expect(grid.className).toMatch(/min-\[641px\]:grid-cols-2/);
    expect(grid.className).toMatch(/lg:grid-cols-3/);
    expect(grid.className).toMatch(/grid-flow-row-dense/);
  });

  it("keeps the pair at two columns", () => {
    const { container } = render(<BentoPair />);
    expect(container.firstElementChild!.className).toMatch(/bento-2/);
  });

  it("labels each card by its kicker heading and maps spans", () => {
    render(
      <BentoCard headingId="card-x" title="Experience" span={3}>
        <Well>inside</Well>
        <CardLink href="/resume" corner>
          Résumé →
        </CardLink>
      </BentoCard>,
    );
    const card = screen.getByRole("article", { name: "Experience" });
    expect(card.className).toMatch(/rounded-bento/);
    expect(card.className).toMatch(/lg:col-span-3/);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "card-x",
    );
    expect(screen.getByRole("link", { name: "Résumé →" }).className).toMatch(
      /min-h-11/,
    );
  });
});

describe("chips and buttons", () => {
  it("pairs the live Ember square with its word", () => {
    render(<LivePill status="Building GoGoCash and Manut AI" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(
      screen.getByText("· Building GoGoCash and Manut AI"),
    ).toBeInTheDocument();
  });

  it("marks availability with the accent square and lets the pill wrap", () => {
    const { container } = render(
      <AvailabilityPill label="Open to roles" detail="Somewhere or remote" />,
    );
    const pill = container.querySelector("p")!;
    expect(pill).toHaveTextContent("Open to roles · Somewhere or remote");
    const marker = pill.querySelector("[aria-hidden]")!;
    expect(marker.className).toMatch(/bg-mark/);
    expect(marker.className).not.toMatch(/bg-ember|kj-live/);
    // Two lines on a phone: a fixed radius, never a full pill, and room to shrink.
    expect(pill.className).not.toMatch(
      /rounded-full|leading-none|whitespace-nowrap/,
    );
    expect(pill.className).toMatch(/max-w-full/);
  });

  it("renders eyebrow, meta and tech chips with decorative markers only", () => {
    const { container } = render(
      <>
        <EyebrowChip>Portfolio</EyebrowChip>
        <MetaTag marked>Original</MetaTag>
        <TechChip>TypeScript</TechChip>
      </>,
    );
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    for (const marker of container.querySelectorAll(".bg-mark"))
      expect(marker).toHaveAttribute("aria-hidden", "true");
  });

  it("makes primary buttons ink (--cta), not Signal", () => {
    render(
      <>
        <CtaLink href="/contact">Contact me</CtaLink>
        <CtaLink href="/portfolio" variant="secondary">
          See my work
        </CtaLink>
        <GlassLink href="/contact">Say hello</GlassLink>
      </>,
    );
    const primary = screen.getByRole("link", { name: "Contact me" });
    expect(primary.className).toMatch(/bg-cta/);
    expect(primary.className).toMatch(/text-on-cta/);
    expect(primary.className).not.toMatch(/bg-action/);
    expect(screen.getByRole("link", { name: "See my work" }).className).toMatch(
      /bg-surface/,
    );
    expect(screen.getByRole("link", { name: "Say hello" }).className).toMatch(
      /kj-glass/,
    );
  });

  it("drives a segmented group with aria-pressed buttons", () => {
    const onChange = vi.fn();
    render(
      <Segmented
        label="Operating principles"
        value="0"
        onChange={onChange}
        options={[
          { label: "Step 01", value: "0" },
          { label: "Step 02", value: "1" },
        ]}
      />,
    );
    const group = screen.getByRole("group", { name: "Operating principles" });
    // A wrapped rounded-full track turns into an oval; the bento radius
    // (28 px, half the 56 px track) is a pill on one line and a card on two.
    expect(group.className).toMatch(/\brounded-bento\b/);
    expect(group.className).not.toMatch(/\brounded-full\b/);
    expect(screen.getByRole("button", { name: "Step 01" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Step 02" }));
    expect(onChange).toHaveBeenCalledWith("1");
  });
});

describe("SiteFooter", () => {
  it("links the socials and the agent surfaces, and nothing hidden", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(/© \d{4} Kunanon Jarat · Bangkok/),
    ).toBeInTheDocument();
    for (const name of ["X", "LinkedIn", "GitHub"])
      expect(screen.getByRole("link", { name })).toHaveAttribute(
        "target",
        "_blank",
      );
    const agents = screen.getByRole("navigation", { name: "For agents" });
    expect(
      [...agents.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ).toEqual(["/agents.md", "/llms.txt", "/sitemap.md", "/skills.md"]);
    for (const a of document.querySelectorAll("a"))
      expect(a.getAttribute("href")).not.toMatch(/^\/(blog|press)/);
  });
});
