import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AboutHero from "@/components/landing/about/AboutHero";
import { aboutPage } from "@/lib/content/aboutPage";
import { socials } from "@/lib/content/landing";

describe("AboutHero", () => {
  it("leads with the canvas h1 in three lines, the eyebrow and the role", () => {
    render(<AboutHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok.",
    );
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
    expect(screen.getByText(aboutPage.hero.role)).toBeInTheDocument();
    expect(screen.getByText(/Fronk · Bangkok, Thailand/)).toBeInTheDocument();
  });

  it("says who he is open to hearing from, between the role and the buttons", () => {
    render(<AboutHero />);
    const pill = screen
      .getByText("Open to roles", { exact: false })
      .closest("p")!;
    expect(pill).toHaveTextContent(
      "Open to roles · Forward Deployed Engineer and AI engineering · Bangkok or remote",
    );
    const role = screen.getByText(aboutPage.hero.role);
    const contact = screen.getByRole("link", { name: "Contact me" });
    expect(
      role.compareDocumentPosition(pill) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      pill.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the portrait panel, loaded first", () => {
    render(<AboutHero />);
    const portrait = screen.getByRole("img", {
      name: aboutPage.hero.portraitAlt,
    });
    expect(portrait.getAttribute("src")).toContain("/profile-portrait.webp");
    expect(portrait).toHaveAttribute("fetchpriority", "high");
  });

  it("offers an ink Contact button, the work and a jump to the story", () => {
    render(<AboutHero />);
    const contact = screen.getByRole("link", { name: "Contact me" });
    expect(contact).toHaveAttribute("href", "/contact");
    expect(contact.className).toMatch(/bg-cta/);
    expect(screen.getByRole("link", { name: "See my work" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
    expect(screen.getByRole("link", { name: /Read my story/ })).toHaveAttribute(
      "href",
      "#story",
    );
  });

  it("links every social profile with an accessible name, opening in a new tab", () => {
    render(<AboutHero />);
    const list = screen.getByRole("list", { name: "Social profiles" });
    for (const { label, href } of socials) {
      const link = within(list).getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("has no email signup and no background video", () => {
    const { container } = render(<AboutHero />);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector("video")).toBeNull();
  });
});
