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
  it("leads the h1 with the role, in block lines, the last in the accent colour", () => {
    render(<HomeHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.",
    );
    expect(h1).not.toHaveTextContent(/Founder/);
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(4);
    expect(h1.lastElementChild).toHaveTextContent("from Bangkok.");
    expect(h1.lastElementChild?.className).toMatch(/text-mark/);
    expect(h1.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("says who he is open to hearing from, with the accent square", () => {
    const { container } = render(<HomeHero />);
    const pill = screen
      .getByText("Open to roles", { exact: false })
      .closest("p")!;
    expect(pill).toHaveTextContent(
      "Open to roles · Forward Deployed Engineer and AI engineering · Bangkok or remote",
    );
    expect(pill.querySelector("[aria-hidden]")?.className).toMatch(/bg-mark/);
    // "Live" and the Ember square mean live; this is availability.
    expect(screen.queryByText("Live")).toBeNull();
    expect(container.querySelector(".bg-ember")).toBeNull();
  });

  it("offers Contact and the résumé side by side", () => {
    render(<HomeHero />);
    const cta = screen.getByRole("link", { name: "Contact me" });
    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta.className).toMatch(/bg-cta/);
    const resume = screen.getByRole("link", { name: "Résumé" });
    expect(resume).toHaveAttribute("href", "/resume");
    expect(resume.className).not.toMatch(/bg-cta/);
    expect(cta.parentElement).toBe(resume.parentElement);
  });

  it("names the employed role before the ventures in the lead", () => {
    render(<HomeHero />);
    expect(
      screen.getByText(
        "IT Manager & AI Engineering Lead at The Binary Holdings. Also building GoGoCash and Manut AI.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Home cards", () => {
  it("anchors the ventures card at #ventures and never links to itself", () => {
    render(<VenturesCard />);
    const card = screen.getByRole("article", { name: "Ventures" });
    expect(card).toHaveAttribute("id", "ventures");
    expect(
      screen.getByRole("link", { name: "See both ventures →" }),
    ).toHaveAttribute("href", "/proof");
    for (const a of card.querySelectorAll("a"))
      expect(a.getAttribute("href")).not.toMatch(/#ventures$/);
    expect(screen.getByRole("link", { name: "GoGoCash" })).toHaveAttribute(
      "href",
      "/ventures/gogocash",
    );
    expect(screen.getByRole("link", { name: "Manut AI" })).toHaveAttribute(
      "href",
      "/ventures/manut",
    );
    expect(
      screen.getByText("1,000 registered users · 220+ merchants on GoGoCash"),
    ).toBeInTheDocument();
  });

  it("lists the featured work in the canvas order, each with its kind", () => {
    render(<SelectedWorkCard />);
    const items = screen.getAllByRole("listitem");
    // The first outcome the owner states sits under the tagline; a project
    // with none (the validator) keeps its two lines.
    expect(items.map((li) => li.textContent)).toEqual([
      "01TBH IntranetOne back office for a multi-entity group.Adoption: 50+ employeesInternal platform",
      "02AI AutomationAI agents for content ops and hiring.Recurring workflow staffing: 10 people to 1 operatorAI agents",
      "03Node Validator AutomationDaily health checks for Avalanche L1 validators.Ops automation",
    ]);
    // The widest card on Home: the evidence a hiring reader looks for.
    expect(
      screen.getByRole("article", { name: "Selected work" }).className,
    ).toMatch(/col-span-2/);
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
