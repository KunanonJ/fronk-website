import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import TopicHubPage from "@/components/landing/discovery/TopicHubPage";
import {
  TOPIC_SLUGS,
  getTopicPillar,
  type TopicLocale,
} from "@/lib/content/topics/pillars";

function renderTopic(slug: string, locale: TopicLocale) {
  const pillar = getTopicPillar(slug, locale)!;
  render(
    <ChromeProvider>
      <TopicHubPage pillar={pillar} />
    </ChromeProvider>,
  );
  return pillar;
}

describe("TopicHubPage (English, the drawn topic)", () => {
  it("draws the h1 in lines with muted connectors and an accent last line", () => {
    const pillar = renderTopic("ai-transformation-thailand", "en");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(pillar.h1);
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
    expect(h1.children[2]?.className).toMatch(/text-mark/);
    expect(within(h1).getByText("for").className).toMatch(/text-ink-3/);
    expect(screen.getByRole("main")).not.toHaveAttribute("lang");
  });

  it("switches language by route, marking the current page", () => {
    renderTopic("ai-transformation-thailand", "en");
    const nav = screen.getByRole("navigation", { name: "Language" });
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

  it("numbers the sections and lists proof, FAQ, related links and contact", () => {
    const pillar = renderTopic("ai-transformation-thailand", "en");
    pillar.sections.forEach((section, i) => {
      const card = screen.getByRole("article", { name: section.heading });
      expect(card).toHaveTextContent(`0${i + 1}`);
      expect(card).toHaveTextContent(section.body);
    });
    const proof = screen.getByRole("article", { name: "Operator proof" });
    expect(within(proof).getAllByRole("listitem")).toHaveLength(3);

    const faq = screen.getByRole("article", { name: "FAQ" });
    expect(faq).toHaveAttribute("id", "topic-faq");
    expect(faq.querySelectorAll("dt")).toHaveLength(pillar.faqs.length);

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

    const contact = screen.getByRole("article", { name: "Contact" });
    expect(contact).toHaveTextContent(pillar.description);
    expect(
      within(contact).getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    ).toHaveAttribute("href", "mailto:fronk.kunanon@gmail.com");
  });

  it("tags both transformation CTAs for analytics", () => {
    renderTopic("ai-transformation-thailand", "en");
    const ctas = screen.getAllByRole("link", {
      name: "Talk about transformation",
    });
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/contact");
    }
  });

  it("lays the canvas grid out: FAQ full width, proof beside s3", () => {
    renderTopic("ai-transformation-thailand", "en");
    expect(screen.getByRole("article", { name: "FAQ" }).className).toMatch(
      /lg:col-span-3/,
    );
    expect(
      screen.getByRole("article", { name: "Operator proof" }).className,
    ).toMatch(/min-\[641px\]:col-span-2/);
  });
});

describe("TopicHubPage (Thai)", () => {
  it("marks <main> as Thai and keeps the h1 word for word", () => {
    const pillar = renderTopic("ai-transformation-thailand", "th");
    expect(screen.getByRole("main")).toHaveAttribute("lang", "th");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      pillar.h1,
    );
    expect(screen.getByText("หัวข้อ")).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "หลักฐานจากงานจริง" }),
    ).toBeInTheDocument();
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
    const nav = screen.getByRole("navigation", { name: "Language" });
    expect(within(nav).getByRole("link", { name: "ไทย" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("stacks the FAQ beside the proof card, as the canvas does", () => {
    renderTopic("ai-transformation-thailand", "th");
    const faq = screen.getByRole("article", { name: "FAQ" });
    expect(faq.className).not.toMatch(/lg:col-span-3/);
    expect(faq.className).toMatch(/min-h-\[300px\]/);
  });

  it("fills the grid for the one-section pillar the canvas leaves out", () => {
    const pillar = renderTopic("tech-startup-thailand-sea", "th");
    expect(pillar.sections).toHaveLength(1);
    expect(screen.getByRole("article", { name: "FAQ" }).className).toMatch(
      /lg:col-span-3/,
    );
    expect(
      screen.getByRole("article", { name: "หลักฐานจากงานจริง" }).className,
    ).toMatch(/min-\[641px\]:col-span-2 lg:col-span-1/);
  });
});

describe("TopicHubPage (every pillar)", () => {
  it("renders each slug in both languages with no hidden blog links", () => {
    for (const locale of ["en", "th"] as const) {
      for (const slug of TOPIC_SLUGS) {
        const { unmount } = render(
          <ChromeProvider>
            <TopicHubPage pillar={getTopicPillar(slug, locale)!} />
          </ChromeProvider>,
        );
        const hrefs = screen
          .getAllByRole("link")
          .map((link) => link.getAttribute("href") ?? "");
        expect(
          hrefs.filter((href) => href.startsWith("/blog")),
          `${locale} ${slug}`,
        ).toEqual([]);
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        unmount();
      }
    }
  });
});
