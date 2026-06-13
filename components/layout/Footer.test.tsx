import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";

const SITE: ResolvedSiteSettings = {
  name: "Kunanon Jarat",
  shortName: "Fronk",
  tagline: "Building from Bangkok.",
  description: "Founder and builder.",
  email: "hello@example.com",
  discordHandle: "fronk",
  socials: {
    x: "https://x.example",
    linkedin: "https://linkedin.example",
    github: "https://github.example",
    telegram: "https://telegram.example",
    farcaster: "https://farcaster.example",
    website: "https://website.example",
  },
  navigation: [
    { href: "/ventures", label: "Ventures" },
    { href: "/writing", label: "Writing" },
    { href: "/about", label: "About" },
  ],
  footerTagline: "Building fintech and digital workspaces from Bangkok.",
};

describe("Footer > Pages links ease their colour transition", () => {
  it("gives a Pages-list link the transition-colors utility", () => {
    render(<Footer site={SITE} />);
    const link = screen.getByRole("link", { name: "Ventures" });
    expect(link.className).toContain("transition-colors");
  });
});

describe("Footer > renders the navigation and contact", () => {
  it("renders every navigation item as a link to its href", () => {
    render(<Footer site={SITE} />);
    for (const item of SITE.navigation) {
      expect(
        screen.getByRole("link", { name: item.label }),
      ).toHaveAttribute("href", item.href);
    }
  });

  it("exposes the email as a mailto link", () => {
    render(<Footer site={SITE} />);
    const email = screen.getByRole("link", { name: /email me/i });
    expect(email).toHaveAttribute("href", "mailto:hello@example.com");
  });
});

describe("Footer > grid cells defend against overflow", () => {
  it("gives each of the three grid cells min-w-0", () => {
    const { container } = render(<Footer site={SITE} />);
    const grid = container.querySelector(".grid") as HTMLElement;
    expect(grid).not.toBeNull();
    const cells = Array.from(grid.children) as HTMLElement[];
    expect(cells).toHaveLength(3);
    for (const cell of cells) {
      expect(cell.className).toContain("min-w-0");
    }
    // sanity: the Pages cell still lists the nav items
    const pagesCell = cells.find((c) =>
      within(c).queryByText("Pages"),
    ) as HTMLElement;
    expect(within(pagesCell).getByRole("link", { name: "Writing" })).toBeInTheDocument();
  });
});
