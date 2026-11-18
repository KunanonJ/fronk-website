import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WorkStack from "@/components/profile/home/WorkStack";
import { workCopy } from "@/lib/content/homeWorkAbout";
import { stackCards } from "@/lib/landing/stackCards";

/*
 * The work stack (design spec 8.4 and 6.12): an article named "Selected work"
 * (a smoke test reads that name), the five cases in order, each an article
 * whose one link names the case, the cleared evidence lines, and media that
 * stay out of the accessibility tree.
 */
describe("WorkStack", () => {
  const cards = stackCards();

  it("is the article named Selected work, with the section's h2", () => {
    render(<WorkStack />);
    const work = screen.getByRole("article", { name: workCopy.eyebrow });
    expect(work).toHaveAttribute("id", "work");
    expect(
      within(work).getByRole("heading", { level: 2, name: workCopy.heading }),
    ).toBeInTheDocument();
  });

  it("lists the cases in order, each an article named by its h3 title", () => {
    const { container } = render(<WorkStack />);
    const list = container.querySelector(".pf-stack")!;
    expect(list.tagName).toBe("UL");
    const articles = [...list.children].map((item) => item.firstElementChild);
    expect(articles.every((child) => child?.tagName === "ARTICLE")).toBe(true);
    expect(articles).toHaveLength(cards.length);
    cards.forEach((card, index) => {
      const article = screen.getByRole("article", { name: card.name });
      expect(articles[index]).toBe(article);
      expect(
        within(article).getByRole("heading", { level: 3, name: card.name }),
      ).toBeInTheDocument();
    });
  });

  it("gives each card one link, named by its label and the case, to the case page", () => {
    render(<WorkStack />);
    for (const card of cards) {
      const article = screen.getByRole("article", { name: card.name });
      const links = within(article).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName(`${workCopy.cta}: ${card.name}`);
      expect(links[0]).toHaveAttribute("href", card.href);
      expect(links[0]).toHaveClass("ds-stretch");
    }
  });

  it("puts id=ventures on the GoGoCash card", () => {
    render(<WorkStack />);
    expect(screen.getByRole("article", { name: "GoGoCash" })).toHaveAttribute(
      "id",
      "ventures",
    );
    expect(document.querySelectorAll("#ventures")).toHaveLength(1);
  });

  it("shows each card's evidence line where it has one", () => {
    render(<WorkStack />);
    for (const card of cards) {
      const article = screen.getByRole("article", { name: card.name });
      const line = article.querySelector(".pf-card__evidence");
      expect(line?.textContent, card.slug).toBe(card.evidence);
    }
    // The recruiter test on Home reads the first outcome in this article.
    expect(
      screen.getByRole("article", { name: workCopy.eyebrow }),
    ).toHaveTextContent(cards[0]!.evidence!);
  });

  it("hides the media from assistive technology and labels drawn ones", () => {
    const { container } = render(<WorkStack />);
    const media = container.querySelectorAll(".pf-card__media");
    expect(media).toHaveLength(cards.length);
    for (const each of media) {
      expect(each).toHaveAttribute("aria-hidden", "true");
      expect(each).toHaveTextContent(workCopy.illustration);
    }
    // The mockups draw their labels as bars, so no text falls under 12 px.
    expect(
      container.querySelectorAll(
        ".pf-card__frame > svg[viewBox='0 0 640 400']",
      ),
    ).toHaveLength(3);
    expect(container.querySelectorAll(".pf-card__media text")).toHaveLength(0);
    // The ventures draw their logo and steps.
    expect(container.querySelectorAll(".pf-venture-art")).toHaveLength(2);
  });

  it("renders each card's material and its place in the stack on the server", () => {
    const html = renderToString(<WorkStack />);
    cards.forEach((card, index) => {
      expect(html).toContain(`style="--i:${index}"`);
      expect(html).toContain(`data-hue="${card.hue}"`);
    });
    // Every dither field is decoration.
    const canvases = html.match(/<canvas[^>]*>/g) ?? [];
    expect(canvases).toHaveLength(cards.length * 2);
    for (const canvas of canvases)
      expect(canvas).toContain('aria-hidden="true"');
  });
});
