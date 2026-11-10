import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ExperienceCard,
  HowIWorkCard,
  SelectedWorkCard,
  VenturesCard,
} from "@/components/landing/home/HomeCards";
import HomeHero from "@/components/landing/home/HomeHero";
import { aboutPage } from "@/lib/content/aboutPage";

describe("Home hero", () => {
  it("greets with the canvas h1 in three block lines", () => {
    render(<HomeHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Hi, I’m Kunanon Jarat. Founder of GoGoCash and Manut AI.",
    );
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
    expect(h1.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("leads with an ink Contact button and the Live status", () => {
    render(<HomeHero />);
    const cta = screen.getByRole("link", { name: "Contact me" });
    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta.className).toMatch(/bg-cta/);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});

describe("Home cards", () => {
  it("anchors the ventures card at #ventures and links there", () => {
    render(<VenturesCard />);
    const card = screen.getByRole("article", { name: "Ventures" });
    expect(card).toHaveAttribute("id", "ventures");
    expect(
      screen.getByRole("link", { name: "See both ventures →" }),
    ).toHaveAttribute("href", "/#ventures");
    expect(screen.getByRole("link", { name: "GoGoCash" })).toHaveAttribute(
      "href",
      "/ventures/gogocash",
    );
    expect(screen.getByRole("link", { name: "Manut AI" })).toHaveAttribute(
      "href",
      "/ventures/manut",
    );
    expect(
      screen.getByText("1,000+ users · 220+ merchants on GoGoCash"),
    ).toBeInTheDocument();
  });

  it("lists the featured work in the canvas order", () => {
    render(<SelectedWorkCard />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "01TBH IntranetOne back office for a multi-entity group.",
      "02AI AutomationAI agents for content ops and hiring.",
      "03Node Validator AutomationDaily health checks for Avalanche L1 validators.",
    ]);
    expect(screen.getByRole("link", { name: "All work →" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
  });

  it("shows four résumé roles and links the résumé", () => {
    render(<ExperienceCard />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(
      screen.getByText("AI Project Manager, Aiden Labs"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Résumé →" })).toHaveAttribute(
      "href",
      "/resume",
    );
  });

  it("steps through the operating principles", () => {
    const { container } = render(<HowIWorkCard />);
    const [first, second] = aboutPage.principles.items;
    const live = () => container.querySelector("[aria-live]");
    expect(live()).toHaveTextContent(first!.title);
    fireEvent.click(screen.getByRole("button", { name: "Step 02" }));
    expect(live()).toHaveTextContent(second!.title);
    expect(screen.getByRole("button", { name: "Step 02" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the four steps on one row with short visible labels", () => {
    render(<HowIWorkCard />);
    const group = screen.getByRole("group", { name: "Operating principles" });
    expect(group.className).toMatch(/\bgrid-flow-col\b/);
    expect(group.className).not.toMatch(/\bflex(-wrap)?\b/);
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["01", "02", "03", "04"]);
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Step 01",
      "Step 02",
      "Step 03",
      "Step 04",
    ]);
  });

  it("reserves the longest principle's height with hidden copies", () => {
    const { container } = render(<HowIWorkCard />);
    const hidden = container.querySelectorAll('[aria-hidden="true"].invisible');
    expect(hidden).toHaveLength(aboutPage.principles.items.length - 1);
  });

  it("never links the hidden blog or press", () => {
    render(
      <>
        <HomeHero />
        <ExperienceCard />
        <VenturesCard />
        <SelectedWorkCard />
        <HowIWorkCard />
      </>,
    );
    for (const a of document.querySelectorAll("a"))
      expect(a.getAttribute("href")).not.toMatch(/^\/(blog|press)/);
  });
});
