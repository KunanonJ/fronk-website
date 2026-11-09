import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import PortfolioStrip from "@/components/landing/home/PortfolioStrip";
import ProofStrip from "@/components/landing/home/ProofStrip";
import { hero, ventures } from "@/lib/content/landing";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { getProofMetrics } from "@/lib/content/proof";

vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

describe("Home hero", () => {
  it("leads with the owner's two-line statement as the h1, no video", () => {
    const { container } = render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Building fintech and AI from Bangkok.");
    expect(h1).toHaveTextContent("Founder of GoGoCash and Manut AI.");
    expect(container.querySelector("video")).toBeNull();
  });

  it("offers Contact and See my work, and labels the live state in words", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: hero.primaryCta.label })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: hero.secondaryCta.label })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText(hero.status)).toBeInTheDocument();
  });
});

describe("Home ventures", () => {
  it("shows exactly two ventures, GoGoCash and Manut AI, with no Airplusauto", () => {
    const { container } = render(<Features />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["GoGoCash", "Manut AI"]);
    expect(container.textContent).not.toMatch(/Airplusauto/i);
    expect(container.querySelector("video")).toBeNull();
  });

  it("gives each venture a unique, descriptive link name", () => {
    render(<Features />);
    const names = ventures.cards.map((c) => c.linkLabel);
    expect(new Set(names).size).toBe(names.length);
    for (const card of ventures.cards) {
      expect(screen.getByRole("link", { name: card.linkLabel })).toHaveAttribute("href", card.href);
    }
    expect(screen.queryByRole("link", { name: /^Learn more$/ })).toBeNull();
  });
});

describe("Proof and portfolio strips", () => {
  it("shows only published metrics", () => {
    render(<ProofStrip />);
    for (const metric of getProofMetrics()) {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
    }
  });

  it("links every portfolio project once, numbered, plus All work", () => {
    render(<PortfolioStrip />);
    const list = screen.getByRole("list");
    const links = within(list).getAllByRole("link");
    const projects = getAllPortfolioProjects();
    expect(links).toHaveLength(projects.length);
    projects.forEach((p, i) => {
      expect(links[i]).toHaveAttribute("href", `/portfolio/${p.slug}`);
      expect(links[i]).toHaveTextContent(p.name);
    });
    expect(screen.getByRole("link", { name: /All work/ })).toHaveAttribute("href", "/portfolio");
  });
});
