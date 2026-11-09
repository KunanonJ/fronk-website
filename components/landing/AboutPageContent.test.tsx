import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPageContent from "@/components/landing/AboutPageContent";
import { aboutPage } from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { activityLevelClass } from "@/lib/github/contributions";

// ContributionActivity fetches GitHub data on mount; keep tests offline.
vi.stubGlobal(
  "fetch",
  vi.fn(
    async () => new Response(JSON.stringify({ ok: false }), { status: 503 }),
  ),
);

describe("AboutPageContent", () => {
  it("has an 'On this page' jump list pointing at real section ids", () => {
    const { container } = render(<AboutPageContent />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBe(6);
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it("renders every FAQ item with text identical to FAQ_ITEMS, first one open", () => {
    const { container } = render(<AboutPageContent />);
    const details = [
      ...container.querySelectorAll(`#${aboutPage.faq.id} details`),
    ];
    expect(details).toHaveLength(FAQ_ITEMS.length);
    FAQ_ITEMS.forEach((item, i) => {
      expect(details[i]!.querySelector("summary")).toHaveTextContent(
        item.question,
      );
      expect(details[i]!.querySelector("p")).toHaveTextContent(item.answer);
    });
    expect(details[0]).toHaveAttribute("open");
  });
});

describe("activityLevelClass", () => {
  it("maps levels 0-4 to theme-aware classes and clamps out-of-range values", () => {
    expect(activityLevelClass(0)).toBe("bg-hairline-strong");
    expect(activityLevelClass(4)).toBe("bg-link");
    expect(activityLevelClass(9)).toBe("bg-link");
    expect(activityLevelClass(-2)).toBe("bg-hairline-strong");
  });
});
