import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Journey from "@/components/profile/home/Journey";
import {
  journeyCopy,
  orbitCopy,
  orbitTools,
  recordsCopy,
  storyCopy,
} from "@/lib/content/homeJourney";
import { careerRecords } from "@/lib/landing/journey";

/*
 * The Home's Journey (design spec 8.6; plan steps 4a to 4c, gate 2): the
 * stage's copy, the orbit as a real list with buttons that turn it, its pause
 * button, the story and the records card, all read from the content modules.
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

const offset = (container: HTMLElement) =>
  container
    .querySelector<HTMLElement>(".pf-orbit")!
    .style.getPropertyValue("--orbit-offset");

describe("Journey", () => {
  it("is section#journey, named by its h2, with the eyebrow, lead and a link to the story", () => {
    render(<Journey />);
    const section = screen.getByRole("region", { name: journeyCopy.heading });
    expect(section).toHaveAttribute("id", "journey");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "journey-title",
    );
    // The spec's 9ch measure (jsdom drops logical properties, so read the HTML).
    expect(renderToString(<Journey />)).toMatch(
      /<h2 id="journey-title"[^>]*style="max-inline-size:9ch"/,
    );
    expect(screen.getByText(journeyCopy.eyebrow)).toHaveClass("t-meta");
    expect(screen.getByText(journeyCopy.lead)).toHaveClass("t-lead");
    expect(
      screen.getByRole("link", { name: journeyCopy.storyLink }),
    ).toHaveAttribute("href", "#story");
  });

  it("lists the tools as text, with their kinds, and hides the file tiles", () => {
    const { container } = render(<Journey />);
    const list = screen.getByRole("list", { name: orbitCopy.label });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(orbitTools.length);
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(
        `${orbitTools[index]!.name}, ${orbitTools[index]!.kind}`,
      );
    });
    const files = container.querySelectorAll(".pf-orbit__item--file");
    expect(files).toHaveLength(orbitCopy.files.length);
    for (const file of files)
      expect(file).toHaveAttribute("aria-hidden", "true");
    for (const art of container.querySelectorAll(".pf-px"))
      expect(art).toHaveAttribute("aria-hidden", "true");
  });

  it("places the ring in the server HTML, with no controls and no motion", () => {
    const html = renderToString(<Journey />);
    expect(html).toContain("--n:20");
    expect(html).toMatch(/class="pf-orbit__item" style="--i:0"/);
    expect(html).not.toContain(orbitCopy.next);
    expect(html).not.toContain("data-running");
  });

  it("turns the ring one slot per press of previous or next", () => {
    stubMotion(false);
    const { container } = render(<Journey />);
    const step = 360 / (orbitTools.length + orbitCopy.files.length);
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.previous }));
    expect(offset(container)).toBe(`${step}deg`);
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.next }));
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.next }));
    expect(offset(container)).toBe(`${-step}deg`);
  });

  it("spins only with motion allowed, and pauses by its button", () => {
    stubMotion(false);
    const { container } = render(<Journey />);
    const stage = container.querySelector(".pf-journey__stage")!;
    expect(stage).toHaveAttribute("data-running");
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.pause }));
    expect(stage).toHaveAttribute("data-paused");
    expect(
      screen.getByRole("button", { name: orbitCopy.play }),
    ).not.toHaveAttribute("aria-pressed");
  });

  it("plays at once when Play is pressed: hover and focus hold it again only after both have left", () => {
    stubMotion(false);
    const { container } = render(
      <>
        <Journey />
        <button type="button">Elsewhere</button>
      </>,
    );
    const stage = container.querySelector<HTMLElement>(".pf-journey__stage")!;
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.pause }));
    expect(stage).not.toHaveAttribute("data-play");
    const play = screen.getByRole("button", { name: orbitCopy.play });
    fireEvent.pointerEnter(stage);
    play.focus();
    fireEvent.click(play);
    expect(stage).not.toHaveAttribute("data-paused");
    expect(stage).toHaveAttribute("data-play");
    // The pointer leaves, focus stays inside: still playing.
    fireEvent.pointerLeave(stage);
    expect(stage).toHaveAttribute("data-play");
    // Focus leaves too: the holds are back.
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    fireEvent.blur(screen.getByRole("button", { name: orbitCopy.pause }), {
      relatedTarget: elsewhere,
    });
    expect(stage).not.toHaveAttribute("data-play");
    // Pause clears it as well.
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.pause }));
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.play }));
    expect(stage).toHaveAttribute("data-play");
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.pause }));
    expect(stage).not.toHaveAttribute("data-play");
  });

  it("puts the heading before the tool list, so a screen reader meets it first", () => {
    stubMotion(false);
    render(<Journey />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: journeyCopy.heading,
    });
    const list = screen.getByRole("list", { name: orbitCopy.label });
    expect(
      heading.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The controls come after the list.
    expect(
      list.compareDocumentPosition(
        screen.getByRole("button", { name: orbitCopy.previous }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("stays still under reduced motion, with no pause button, but still turns by the buttons", () => {
    stubMotion(true);
    const { container } = render(<Journey />);
    expect(container.querySelector(".pf-journey__stage")).not.toHaveAttribute(
      "data-running",
    );
    expect(screen.queryByRole("button", { name: orbitCopy.pause })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: orbitCopy.next }));
    expect(offset(container)).not.toBe("");
  });

  it("tells the story at #story, with the roles I am open to and their chips", () => {
    const { container } = render(<Journey />);
    const story = container.querySelector("#story")!;
    expect(story.querySelectorAll("p strong").length).toBeGreaterThanOrEqual(2);
    expect(
      within(story as HTMLElement).getByRole("heading", {
        level: 3,
        name: storyCopy.rolesHeading,
      }),
    ).toBeInTheDocument();
    expect(story).toHaveTextContent(storyCopy.roles);
    for (const chip of storyCopy.chips)
      expect(within(story as HTMLElement).getByText(chip)).toHaveClass(
        "ds-chip",
      );
  });

  it("shows the records card: roles and education from the résumé, and the full résumé", () => {
    render(<Journey />);
    const card = screen.getByRole("complementary", { name: recordsCopy.label });
    const { employment, education } = careerRecords();
    const [roles, school] = within(card).getAllByRole("list");
    expect(within(roles!).getAllByRole("listitem")).toHaveLength(
      employment.length,
    );
    expect(within(school!).getAllByRole("listitem")).toHaveLength(
      education.length,
    );
    expect(card).toHaveTextContent(employment[0]!.period);
    expect(card).not.toHaveTextContent("—");
    expect(
      within(card).getByRole("heading", {
        level: 3,
        name: recordsCopy.employment,
      }),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: recordsCopy.resume.label }),
    ).toHaveAttribute("href", recordsCopy.resume.href);
  });
});
