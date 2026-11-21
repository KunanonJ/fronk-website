import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OpenSourceStrip from "@/components/profile/home/OpenSourceStrip";
import { OPEN_SOURCE_PROJECTS } from "@/lib/content/openSource";
import { formatDay } from "@/lib/utils/relativeDay";

/*
 * Home's open-source strip (21-11-26): a section named by its h2, a pill to
 * the page and a tile per project that opens its card there, dated in the
 * HTML and put into words in the browser.
 */
describe("OpenSourceStrip", () => {
  it("is a section named by its h2", () => {
    render(<OpenSourceStrip />);
    const section = screen.getByRole("region", { name: "Built in the open." });
    expect(section).toHaveAttribute("id", "open-source");
    expect(
      within(section).getByRole("heading", { level: 2 }),
    ).toHaveTextContent("Built in the open.");
  });

  it("links the page, then each project's card on it", () => {
    render(<OpenSourceStrip />);
    expect(
      screen.getByRole("link", { name: "All open source" }),
    ).toHaveAttribute("href", "/open-source");
    const tiles = within(screen.getByRole("list")).getAllByRole("link");
    expect(tiles.map((tile) => tile.getAttribute("href"))).toEqual([
      "/open-source#superstacks",
      "/open-source#thai-accounting-tax-law",
      "/open-source#openfinance",
    ]);
    tiles.forEach((tile, index) => {
      const project = OPEN_SOURCE_PROJECTS[index]!;
      expect(tile).toHaveTextContent(project.name);
      expect(tile).toHaveTextContent(project.kind);
      expect(tile).toHaveTextContent(project.facts.release!.tag);
    });
  });

  it("dates each project in the HTML, and never says how long ago there", () => {
    const html = renderToString(<OpenSourceStrip />);
    // "16 Nov 2026" for Superstacks at the 21-11-26 sync.
    for (const { facts } of OPEN_SOURCE_PROJECTS)
      expect(html).toContain(
        `<time dateTime="${facts.lastCommitAt.slice(0, 10)}">${formatDay(facts.lastCommitAt)}</time>`,
      );
    expect(html).not.toMatch(/ago|today|yesterday/);
  });
});
