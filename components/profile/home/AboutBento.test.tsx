import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import AboutBento from "@/components/profile/home/AboutBento";
import { MessTile } from "@/components/profile/home/MessTile";
import { MotionTile } from "@/components/profile/home/MotionTile";
import {
  iconRows,
  PRINCIPLE_ICONS,
} from "@/components/profile/home/PrincipleTile";
import { aboutPage } from "@/lib/content/aboutPage";
import { aboutCopy } from "@/lib/content/homeWorkAbout";
import { aboutStats } from "@/lib/landing/aboutStats";

/*
 * The About bento (design spec 8.5): the story, the mess tile, the stats as
 * real text, a looping tile that only moves with its pause control, and the
 * four principles with their pixel icons.
 */

function stubMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AboutBento", () => {
  it("is the section named About, with the section's h2", () => {
    render(<AboutBento />);
    const about = screen.getByRole("region", { name: aboutCopy.eyebrow });
    expect(about).toHaveAttribute("id", "about");
    expect(
      within(about).getByRole("heading", { level: 2, name: aboutCopy.heading }),
    ).toBeInTheDocument();
  });

  it("tells today's About story, its links opening in a new tab as they say", () => {
    const { container } = render(<AboutBento />);
    const brief = container.querySelector<HTMLElement>(".pf-brief")!;
    const paragraphs = brief.querySelectorAll("p");
    const story = aboutPage.story.paragraphs;
    expect(paragraphs).toHaveLength(story.length);
    story.forEach((paragraph, index) => {
      for (const span of paragraph.spans)
        expect(paragraphs[index]).toHaveTextContent(span.text.trim());
    });
    const spans = story.flatMap((paragraph) =>
      paragraph.spans.flatMap((span) => (span.type === "link" ? [span] : [])),
    );
    const links = within(brief).getAllByRole("link");
    expect(links).toHaveLength(spans.length);
    spans.forEach((span, index) => {
      expect(links[index]).toHaveAttribute("href", span.href);
      // The note's leading space sits inside the hidden span. jsdom has no
      // CSS, so it computes names without it; the browser checks the name
      // (tests/e2e/profile-work-about.spec.ts).
      expect(links[index]).toHaveTextContent(
        `${span.text} (opens in a new tab)`,
        { normalizeWhitespace: false },
      );
      expect(links[index]).toHaveAttribute("target", "_blank");
      expect(links[index]).toHaveAttribute("rel", "noopener");
      // No visible space between the link and the punctuation after it.
      expect(links[index]!.firstChild?.textContent).toBe(span.text);
    });
  });

  it("shows each stat as text beside its label", () => {
    const { container } = render(<AboutBento />);
    const items = container.querySelectorAll(".pf-stats__item");
    const stats = aboutStats();
    expect(items).toHaveLength(stats.length);
    stats.forEach((stat, index) => {
      expect(items[index]!.querySelector(".sr-only")).toHaveTextContent(
        stat.figure,
      );
      expect(items[index]).toHaveTextContent(stat.label);
      expect(items[index]!.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
    expect(container).toHaveTextContent(aboutCopy.stats.footnote);
  });

  it("lists the four principles as /about prints them, each with an icon", () => {
    const { container } = render(<AboutBento />);
    for (const principle of aboutPage.principles.items) {
      expect(
        screen.getByRole("heading", { level: 3, name: principle.title }),
      ).toBeInTheDocument();
      expect(container).toHaveTextContent(principle.body);
    }
    expect(container.querySelectorAll(".pf-principle .pf-art")).toHaveLength(4);
  });
});

describe("MessTile", () => {
  it("renders the tidy list on the server, which is what stays without script", () => {
    const html = renderToString(
      <MessTile chips={aboutCopy.mess.chips} line={aboutCopy.mess.line} />,
    );
    expect(html).toContain('data-state="tidy"');
    for (const chip of aboutCopy.mess.chips) expect(html).toContain(chip);
    expect(html).toContain(aboutCopy.mess.line);
    expect(html).toContain('style="--mx:34px;--my:6px;--mr:-6deg;--d:0.00s"');
  });

  it("stays tidy under reduced motion", () => {
    stubMotion(true);
    const { container } = render(
      <MessTile chips={aboutCopy.mess.chips} line={aboutCopy.mess.line} />,
    );
    expect(container.querySelector(".pf-mess")).toHaveAttribute(
      "data-state",
      "tidy",
    );
  });
});

describe("MotionTile", () => {
  const labels = { pause: "Pause the animation", play: "Play the animation" };

  it("is still in the server HTML, which has no pause control", () => {
    const html = renderToString(
      <MotionTile caption={aboutCopy.motion.caption} labels={labels} />,
    );
    expect(html).not.toContain("data-running");
    expect(html).not.toContain(labels.pause);
    expect(html.match(/pf-motion__block"/g)).toHaveLength(36);
    expect(html).toContain(aboutCopy.motion.caption);
  });

  it("runs after hydration and pauses from its control", () => {
    stubMotion(false);
    const { container } = render(
      <MotionTile caption={aboutCopy.motion.caption} labels={labels} />,
    );
    const tile = container.querySelector(".pf-motion");
    expect(tile).toHaveAttribute("data-running");
    expect(tile).not.toHaveAttribute("data-paused");
    fireEvent.click(screen.getByRole("button", { name: labels.pause }));
    expect(tile).toHaveAttribute("data-paused");
    expect(screen.getByRole("button", { name: labels.play })).toBeVisible();
  });

  it("never runs under reduced motion, and shows no control", () => {
    stubMotion(true);
    const { container } = render(
      <MotionTile caption={aboutCopy.motion.caption} labels={labels} />,
    );
    expect(container.querySelector(".pf-motion")).not.toHaveAttribute(
      "data-running",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("the principles' pixel icons", () => {
  it("are 16 by 16, one per principle, on a tile with clipped corners", () => {
    expect(PRINCIPLE_ICONS).toHaveLength(aboutPage.principles.items.length);
    for (const icon of PRINCIPLE_ICONS) {
      expect(icon).toHaveLength(16);
      for (const row of icon) expect(row).toMatch(/^[.tac]{16}$/);
      expect(icon[0]!.slice(0, 2)).toBe("..");
      expect(icon[15]!.slice(14)).toBe("..");
      expect(icon[1]![0]).toBe(".");
      expect(icon[8]![0]).toBe("t");
    }
  });

  it("fill only the empty cells with the tile's tint, its corners clipped", () => {
    const rows = iconRows([
      "a.....",
      "......",
      "......",
      "......",
      "......",
      ".....c",
    ]);
    expect(rows).toEqual([
      "a.tt..",
      ".tttt.",
      "tttttt",
      "tttttt",
      ".tttt.",
      "..tt.c",
    ]);
  });
});
