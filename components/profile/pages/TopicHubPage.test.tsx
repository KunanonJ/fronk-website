import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import TopicHubPage from "@/components/profile/pages/TopicHubPage";
import {
  TOPIC_SLUGS,
  getTopicPillar,
  type TopicLocale,
} from "@/lib/content/topics/pillars";

/*
 * The topic hub template (profile redesign, Phase 7 lane D1, plan step 7a).
 * The intents of the bento hub's tests, on the new layout: the h1 word for
 * word, the language switch, every section, the proof, the FAQ, the related
 * links and the contact block, the FDE hubs' hiring path, and Thai marked as
 * Thai.
 */

function renderTopic(slug: string, locale: TopicLocale) {
  const pillar = getTopicPillar(slug, locale)!;
  const view = render(
    <ChromeProvider>
      <TopicHubPage pillar={pillar} />
    </ChromeProvider>,
  );
  return { pillar, ...view };
}

const hero = () =>
  screen.getByRole("heading", { level: 1 }).closest("section")!;

describe("TopicHubPage (English)", () => {
  it("draws the h1 in lines with muted connectors and an accent last line", () => {
    const { pillar } = renderTopic("ai-transformation-thailand", "en");
    const h1 = screen.getByRole("heading", { level: 1 });
    // Word for word, spaces included: the parity gate reads this text.
    expect(h1.textContent).toBe(pillar.h1);
    expect(h1).toHaveClass("t-display");
    expect(h1.children).toHaveLength(3);
    expect(h1.children[2]).toHaveClass("pf-page-hero__accent");
    expect(within(h1).getByText("for")).toHaveClass("pf-page-hero__muted");
    expect(screen.getByRole("main")).not.toHaveAttribute("lang");
    expect(hero()).toHaveAttribute("aria-labelledby", "hero-title");
  });

  it("switches language by route, marking the current page", () => {
    renderTopic("ai-transformation-thailand", "en");
    const nav = screen.getByRole("navigation", { name: "Language" });
    expect(nav).not.toHaveAttribute("lang");
    expect(within(nav).getByRole("link", { name: "English" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const thai = within(nav).getByRole("link", { name: "ไทย" });
    expect(thai).toHaveAttribute(
      "href",
      "/th/topics/ai-transformation-thailand",
    );
    expect(thai).toHaveAttribute("hreflang", "th");
    expect(thai).toHaveAttribute("lang", "th");
    expect(thai).not.toHaveAttribute("aria-current");
  });

  it("sets each section as a chapter with its number, heading and body", () => {
    const { pillar } = renderTopic("ai-transformation-thailand", "en");
    pillar.sections.forEach((section, i) => {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: section.heading,
      });
      const chapter = heading.closest("section")!;
      expect(chapter).toHaveClass("pf-case-chapter");
      // The number is drawn in the kicker, hidden from assistive technology.
      const kicker = chapter.querySelector(".pf-case-kicker")!;
      expect(kicker).toHaveAttribute("aria-hidden", "true");
      expect(kicker).toHaveTextContent(`0${i + 1}`);
      expect(chapter).toHaveTextContent(section.body);
    });
  });

  it("lists the proof, the FAQ, the related links and the contact block", () => {
    const { pillar } = renderTopic("ai-transformation-thailand", "en");
    const proof = screen.getByRole("article", { name: "Operator proof" });
    // The strip numbers its facts in CSS: each item's text is the fact alone.
    expect(
      within(proof)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(pillar.proof);

    const faq = screen.getByRole("region", { name: "FAQ" });
    expect(faq).toHaveAttribute("id", "topic-faq");
    const items = faq.querySelectorAll("details");
    expect(items).toHaveLength(pillar.faqs.length);
    expect(items[0]).toHaveAttribute("open");
    pillar.faqs.forEach((item, i) => {
      // Every answer is in the HTML, open or closed (FAQPage JSON-LD).
      expect(items[i]).toHaveTextContent(item.question);
      expect(items[i]).toHaveTextContent(item.answer);
      // Numbered as the bento hub numbered them, the number drawn only.
      const number = items[i]!.querySelector(".pf-faq__number")!;
      expect(number).toHaveTextContent(`0${i + 1}`);
      expect(number).toHaveAttribute("aria-hidden", "true");
      expect(
        within(items[i] as HTMLElement).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(item.question);
    });

    const explore = screen.getByRole("article", { name: "Keep exploring" });
    expect(
      within(explore)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/topics/erp-crm-internal-systems",
      "/ventures/manut",
      "/topics/tech-startup-thailand-sea",
    ]);
    // Link names are their words: the numbers and arrows are drawn, not read.
    const manut = within(explore).getByRole("link", { name: "Manut case" });
    expect(manut).toHaveTextContent("02Manut case→");
    expect(manut.querySelector(".pf-hub-links__number")).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    const contact = screen.getByRole("article", { name: "Contact" });
    expect(contact).toHaveTextContent(pillar.description);
    expect(
      within(contact).getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    ).toHaveAttribute("href", "mailto:fronk.kunanon@gmail.com");
  });

  it("offers the call to action in the hero and in the contact block", () => {
    renderTopic("ai-transformation-thailand", "en");
    const ctas = screen.getAllByRole("link", {
      name: "Talk about transformation",
    });
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/contact");
      expect(cta).toHaveClass("ds-pill");
    }
    expect(within(hero()).getByRole("button", { name: "Share" })).toBeVisible();
  });
});

describe("TopicHubPage (Thai)", () => {
  it("marks <main> as Thai and keeps the h1 word for word", () => {
    const { pillar } = renderTopic("ai-transformation-thailand", "th");
    expect(screen.getByRole("main")).toHaveAttribute("lang", "th");
    // No space between ไทย and และ: the segments carry their own.
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      pillar.h1,
    );
    expect(screen.getByText("หัวข้อ")).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "หลักฐานจากงานจริง" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "อ่านต่อ" })).toBeVisible();
    expect(screen.getByRole("article", { name: "ติดต่อ" })).toBeVisible();
  });

  it("labels English text and links as English", () => {
    renderTopic("ai-transformation-thailand", "th");
    expect(screen.getByText("Share")).toHaveAttribute("lang", "en");
    const english = screen.getByRole("link", { name: /English version/ });
    expect(english).toHaveAttribute(
      "href",
      "/topics/ai-transformation-thailand",
    );
    expect(english).toHaveAttribute("lang", "en");
    expect(english).toHaveAttribute("hreflang", "en");
    // The switch's own name is English; each link names its language.
    const nav = screen.getByRole("navigation", { name: "Language" });
    expect(nav).toHaveAttribute("lang", "en");
    const thai = within(nav).getByRole("link", { name: "ไทย" });
    expect(thai).toHaveAttribute("aria-current", "page");
    expect(thai).toHaveAttribute("lang", "th");
    expect(
      screen.getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    ).toHaveAttribute("lang", "en");
  });

  it("sets the one-section hub the same way", () => {
    const { pillar } = renderTopic("tech-startup-thailand-sea", "th");
    expect(pillar.sections).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: pillar.sections[0]!.heading,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "FAQ" })).toBeInTheDocument();
  });
});

describe("TopicHubPage (every hub)", () => {
  it("renders each slug in both languages, the h1 exact, with no hidden blog links", () => {
    for (const locale of ["en", "th"] as const) {
      for (const slug of TOPIC_SLUGS) {
        const pillar = getTopicPillar(slug, locale)!;
        const { unmount } = render(
          <ChromeProvider>
            <TopicHubPage pillar={pillar} />
          </ChromeProvider>,
        );
        const hrefs = screen
          .getAllByRole("link")
          .map((link) => link.getAttribute("href") ?? "");
        expect(
          hrefs.filter((href) => href.startsWith("/blog")),
          `${locale} ${slug}`,
        ).toEqual([]);
        const h1s = screen.getAllByRole("heading", { level: 1 });
        expect(h1s).toHaveLength(1);
        expect(h1s[0]!.textContent, `${locale} ${slug}`).toBe(pillar.h1);
        unmount();
      }
    }
  });
});

describe("TopicHubPage (the FDE hub, where a recruiter lands)", () => {
  const SLUG = "forward-deployed-ai-engineering";

  it("says who he is open to hearing from, under the lede", () => {
    renderTopic(SLUG, "en");
    const pill = screen.getByText("Open to roles").closest("p")!;
    expect(pill).toHaveTextContent(
      "Open to roles · Forward Deployed Engineer and AI engineering · Bangkok or remote",
    );
    expect(screen.getByText("Open to roles")).toHaveClass("ds-badge");
    expect(hero()).toContainElement(pill);
  });

  it("offers the hiring contact and the résumé side by side", () => {
    renderTopic(SLUG, "en");
    expect(
      within(hero()).getByRole("link", { name: "Contact" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    const resume = within(hero()).getByRole("link", { name: "Résumé" });
    expect(resume).toHaveAttribute("href", "/resume");
    // The second button is the ghost pill: one dark action per group.
    expect(resume).toHaveClass("ds-pill--ghost");
    // The contact block at the foot of the page leads to the same form.
    const card = screen.getByRole("article", { name: "Contact" });
    expect(within(card).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact?topic=hiring",
    );
  });

  it("lists the résumé among the pages to explore", () => {
    renderTopic(SLUG, "en");
    const explore = screen.getByRole("article", { name: "Keep exploring" });
    expect(
      within(explore)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toContain("/resume");
  });

  it("sets its four sections as chapters 01 to 04 in the hub's column", () => {
    const { pillar, container } = renderTopic(SLUG, "en");
    expect(pillar.sections).toHaveLength(4);
    const kickers = [
      ...container.querySelectorAll(
        "section.pf-case-chapter > p.pf-case-kicker",
      ),
    ].map((kicker) => kicker.textContent);
    expect(kickers).toEqual(["01", "02", "03", "04"]);
    const column = container.querySelector(".pf-hub-column")!;
    for (const section of pillar.sections) {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: section.heading,
      });
      expect(column).toContainElement(heading);
      // A row: from 1024 px the kicker and heading sit beside the body.
      expect(heading.closest("section")).toHaveClass("pf-hub-row");
    }
  });

  it("does the same in Thai, in Thai", () => {
    renderTopic(SLUG, "th");
    // The same words are in the proof list and the FAQ; this is the hero's pill.
    expect(
      within(hero()).getByText("เปิดรับตำแหน่ง").closest("p"),
    ).toHaveTextContent(
      "เปิดรับตำแหน่ง · Forward Deployed Engineer และงานวิศวกรรม AI ในกรุงเทพฯ หรือทำงานทางไกล",
    );
    expect(
      within(hero()).getByRole("link", { name: "ติดต่อ" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    expect(
      within(hero()).getByRole("link", { name: "เรซูเม่" }),
    ).toHaveAttribute("href", "/resume");
    const explore = screen.getByRole("article", { name: "อ่านต่อ" });
    expect(
      within(explore)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toContain("/resume");
  });

  it("keeps the pill and the second button off the other hubs", () => {
    renderTopic("ai-transformation-thailand", "en");
    expect(screen.queryByText("Open to roles", { exact: false })).toBeNull();
    expect(screen.queryByRole("link", { name: "Résumé" })).toBeNull();
  });
});
