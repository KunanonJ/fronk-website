import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import VentureHubPage from "@/components/landing/discovery/VentureHubPage";
import { loopArc } from "@/components/landing/discovery/VentureCards";
import { getVentureBySlug } from "@/lib/content/ventures";

function renderVenture(
  slug: string,
  relatedTopics: readonly { label: string; href: string }[] = [],
) {
  const venture = getVentureBySlug(slug)!;
  render(
    <ChromeProvider>
      <VentureHubPage venture={venture} relatedTopics={relatedTopics} />
    </ChromeProvider>,
  );
  return venture;
}

const GOGOCASH_TOPICS = [
  {
    label: "Tech startups Bangkok & SEA",
    href: "/topics/tech-startup-thailand-sea",
  },
];

describe("VentureHubPage (GoGoCash, the drawn venture)", () => {
  it("leads with the canvas h1: logo and name, then the tagline lines", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("GoGoCash Shopping-to-earn cashback.");
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
    expect(h1.children[2]?.className).toMatch(/text-mark/);
    expect(h1.querySelector("img")).toHaveAttribute(
      "src",
      "/brand/gogocash.svg",
    );
    expect(screen.getByText("· 2023 — present")).toBeInTheDocument();
  });

  it("links out and to contact, and states the free start", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    const visit = screen.getByRole("link", { name: "Visit gogocash.co" });
    expect(visit).toHaveAttribute("href", "https://gogocash.co");
    expect(visit).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByText("Free to start")).toBeInTheDocument();
    // The pill opens the shared header panel; aria-controls appears only
    // while the panel exists.
    const share = screen.getByRole("button", { name: "Share" });
    expect(share).toHaveAttribute("data-panel-trigger");
    expect(share).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the published metrics as stat tiles", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    for (const [label, value] of [
      ["Users", "1,000+"],
      ["Merchants", "220+"],
      ["Max cashback", "30%"],
    ])
      expect(screen.getByText(label).nextElementSibling).toHaveTextContent(
        value!,
      );
  });

  it("draws the case sections, related topics, the other venture and Share", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    for (const name of [
      "What it is",
      "Where it stands",
      "My role",
      "Related topics",
      "Also building",
      "Share",
    ])
      expect(screen.getByRole("article", { name })).toBeInTheDocument();

    const what = screen.getByRole("article", { name: "What it is" });
    expect(
      within(what).getByText("A cashback layer over everyday e-commerce."),
    ).toBeInTheDocument();
    expect(
      within(within(what).getByRole("list", { name: "Categories" }))
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Cashback", "E-commerce", "Affiliate"]);

    const role = screen.getByRole("article", { name: "My role" });
    expect(within(role).getByText("Founder.")).toBeInTheDocument();
    expect(within(role).getByRole("link", { name: "About →" })).toHaveAttribute(
      "href",
      "/about",
    );

    const related = screen.getByRole("article", { name: "Related topics" });
    expect(
      within(related).getByRole("link", { name: /Tech startups Bangkok/ }),
    ).toHaveAttribute("href", "/topics/tech-startup-thailand-sea");

    const next = screen.getByRole("article", { name: "Also building" });
    expect(within(next).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Manut AI",
    );
    expect(
      within(next).getByRole("link", { name: "Case study →" }),
    ).toHaveAttribute("href", "/ventures/manut");
  });

  it("steps through the core loop with pressed buttons and a live dial", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    const group = screen.getByRole("group", { name: "The core loop" });
    const steps = within(group).getAllByRole("button");
    expect(steps.map((step) => step.textContent)).toEqual([
      "01Browse",
      "02Shop",
      "03Track cashback",
      "04Withdraw",
    ]);
    expect(steps[0]).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(steps[3]!);
    expect(steps[3]).toHaveAttribute("aria-pressed", "true");
    expect(steps[0]).toHaveAttribute("aria-pressed", "false");
    const dial = screen.getByText("04 / 04").parentElement;
    expect(dial).toHaveAttribute("aria-live", "polite");
    expect(dial).toHaveTextContent("Withdraw");
  });

  it("shares the page's title and canonical URL", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    const share = screen.getByRole("article", { name: "Share" });
    expect(
      within(share).getByText(
        "GoGoCash: Shopping-to-earn cashback — Fronk Kunanon Jarat",
      ),
    ).toBeInTheDocument();
    expect(
      within(share).getByRole("button", { name: "Copy link" }),
    ).toBeInTheDocument();
    expect(
      within(share).getByRole("link", { name: "Post on X" }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/x\.com\/intent\/post\?text=GoGoCash/),
    );
    expect(
      within(share).getByRole("link", { name: "Email the link" }),
    ).toHaveAttribute("href", expect.stringMatching(/^mailto:\?subject=/));
  });

  it("links no hidden blog page", () => {
    renderVenture("gogocash", GOGOCASH_TOPICS);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href") ?? "");
    expect(hrefs.filter((href) => href.startsWith("/blog"))).toEqual([]);
  });
});

describe("VentureHubPage (Manut, a variant the canvas does not draw)", () => {
  it("leaves out the blocks it has no data for", () => {
    renderVenture("manut", [
      {
        label: "AI transformation Thailand",
        href: "/topics/ai-transformation-thailand",
      },
    ]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Manut AI ERP/CRM workspace with Intelligence AI for automotive SMEs.",
    );
    // No published metrics and no core loop.
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(document.querySelector("dl")).toBeNull();
    expect(
      screen.queryByRole("group", { name: "The core loop" }),
    ).not.toBeInTheDocument();
  });

  it("draws its own sections and points Also building at GoGoCash", () => {
    renderVenture("manut");
    const why = screen.getByRole("article", {
      name: "Why it matters in Thailand & SEA",
    });
    expect(
      within(why).getByText(
        "SMEs and startups need a system of record before flashy agents.",
      ),
    ).toBeInTheDocument();
    // No related links given: the card is left out.
    expect(
      screen.queryByRole("article", { name: "Related topics" }),
    ).not.toBeInTheDocument();
    const next = screen.getByRole("article", { name: "Also building" });
    expect(within(next).getByRole("heading", { level: 3 })).toHaveTextContent(
      "GoGoCash",
    );
    expect(
      within(next).getByRole("link", { name: "gogocash.co →" }),
    ).toHaveAttribute("href", "https://gogocash.co");
  });
});

describe("loopArc", () => {
  it("matches the canvas quarter arcs", () => {
    expect(loopArc(0, 4)).toBe("M109.75 20.6A80 80 0 0 1 179.4 90.25");
    expect(loopArc(2, 4)).toBe("M90.25 179.4A80 80 0 0 1 20.6 109.75");
  });
});
