import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AboutHero from "@/components/landing/about/AboutHero";
import { aboutPage } from "@/lib/content/aboutPage";
import { socials } from "@/lib/content/landing";

vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => "/about",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

describe("AboutHero", () => {
  it("leads with the portrait, the name as h1 and the role line", () => {
    render(<AboutHero />);
    const portrait = screen.getByRole("img", {
      name: aboutPage.hero.portraitAlt,
    });
    expect(portrait.getAttribute("src")).toContain("/profile-portrait.webp");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Kunanon Jarat",
    );
    expect(screen.getByText(aboutPage.hero.role)).toBeInTheDocument();
    expect(screen.getByText(/Fronk · Bangkok, Thailand/)).toBeInTheDocument();
  });

  it("offers Contact and work CTAs and a jump to the story", () => {
    render(<AboutHero />);
    expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute(
      "href",
      "/contact",
    );
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
