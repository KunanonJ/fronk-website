import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasMock } from "@/components/profile/home/CanvasMock";
import { canvasMock, type MockFrame } from "@/lib/content/home";

/*
 * The hero's canvas mock (design spec 8.2 and 12, item 16; plan gate 6): it
 * exposes only its frame links (and, on phones, the pager); a frame chosen
 * by pointer or focus drives the inspector; the named cursor tours once and
 * rests; drawings carry the "Illustration" label.
 */

const FRAMES = canvasMock.frames;

/** Motion allowed or not, and whether the viewport is wide (810 px and up). */
function stubMedia({ reduce = false, wide = true } = {}) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce")
          ? reduce
          : query.includes("min-width")
            ? wide
            : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

const inspector = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".pf-mock__inspector")!;

beforeEach(() => {
  vi.useFakeTimers();
  stubMedia();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CanvasMock", () => {
  it("exposes a group of three named frame links and hides the decoration", () => {
    const { container } = render(<CanvasMock ready={false} />);
    const group = screen.getByRole("group", { name: "Featured projects" });
    const links = within(group).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual(
      FRAMES.map((frame) => `${frame.name}: open the case study`),
    );
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      FRAMES.map((frame) => `/preview/portfolio/${frame.slug}`),
    );
    // A link's visible text is its name and nothing else, so the visible
    // label is part of the accessible name (WCAG 2.5.3; axe's
    // label-content-name-mismatch): the tags sit beside the link.
    expect(
      links.map((link) => link.textContent?.replace("#", "").trim()),
    ).toEqual(FRAMES.map((frame) => frame.name));
    expect(within(group).getByRole("list")).toBeInTheDocument();
    for (const part of [
      ".pf-mock__bar",
      ".pf-mock__layers",
      ".pf-mock__inspector",
      ".pf-mock__comment",
      ".pf-mock__cursor",
      ".pf-mock__tools",
    ]) {
      expect(container.querySelector(part)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    }
    // Nothing in the hidden parts takes focus: the inspector's button is a
    // pointer's shortcut, a span with no link of its own.
    expect(
      container.querySelectorAll(
        "[aria-hidden='true'] :is(a[href], button, input, [tabindex])",
      ),
    ).toHaveLength(0);
    expect(inspector(container).querySelector(".pf-mock__open")?.tagName).toBe(
      "SPAN",
    );
  });

  it("labels drawn screens as illustrations, and a real screenshot as nothing", () => {
    const shot: MockFrame = {
      ...FRAMES[0]!,
      cover: {
        src: "/portfolio/x/cover.webp",
        alt: "A screen",
        width: 1440,
        height: 900,
      },
    };
    const { container } = render(
      <CanvasMock ready={false} frames={[shot, ...FRAMES.slice(1)]} />,
    );
    const items = container.querySelectorAll(".pf-mock__item");
    expect(items[0]!.querySelector("img")).toHaveAttribute("alt", "");
    expect(items[0]!.textContent).not.toContain("Illustration");
    expect(items[1]!.textContent).toContain("Illustration");
    expect(items[1]!.querySelector(".pf-thumb--review-queue")).not.toBeNull();
  });

  it("moves the selection and the inspector to a frame on hover and on focus", () => {
    const { container } = render(<CanvasMock ready={false} />);
    const [first, second, third] = screen.getAllByRole("link");
    expect(first).toHaveAttribute("data-selected");
    expect(inspector(container)).toHaveTextContent(FRAMES[0]!.name);

    fireEvent.pointerEnter(second!);
    expect(second).toHaveAttribute("data-selected");
    expect(first).not.toHaveAttribute("data-selected");
    expect(inspector(container)).toHaveTextContent(FRAMES[1]!.category);
    expect(inspector(container)).toHaveTextContent(FRAMES[1]!.period);
    // The inspector's button presses the selected frame's own link.
    const opened = vi.fn((event: MouseEvent) => event.preventDefault());
    second!.addEventListener("click", opened);
    fireEvent.click(inspector(container).querySelector(".pf-mock__open")!);
    expect(opened).toHaveBeenCalledTimes(1);

    fireEvent.focus(third!);
    expect(third).toHaveAttribute("data-selected");
    expect(
      container.querySelector(".pf-mock__layer[data-selected]"),
    ).toHaveTextContent(FRAMES[2]!.name);
  });

  it("tours the frames once with the named cursor, ends on the first, and rests", () => {
    const { container } = render(<CanvasMock ready />);
    const cursor = container.querySelector(".pf-mock__cursor")!;
    expect(cursor).toHaveTextContent("Kunanon");
    expect(cursor).toHaveAttribute("data-frame", "0");

    advance(900);
    expect(cursor).toHaveAttribute("data-frame", "2");
    expect(inspector(container)).toHaveTextContent(FRAMES[2]!.name);
    advance(1200);
    expect(cursor).toHaveAttribute("data-frame", "1");
    advance(1200);
    expect(cursor).toHaveAttribute("data-frame", "0");
    expect(inspector(container)).toHaveTextContent(FRAMES[0]!.name);

    advance(30_000);
    expect(cursor).toHaveAttribute("data-frame", "0");
  });

  it("does not tour under reduced motion, on a phone, before the hero shows, or once a reader picks", () => {
    const tour = (ready: boolean) => {
      const view = render(<CanvasMock ready={ready} />);
      advance(5000);
      const at = view.container
        .querySelector(".pf-mock__cursor")!
        .getAttribute("data-frame");
      view.unmount();
      return at;
    };
    expect(tour(false)).toBe("0");

    stubMedia({ reduce: true });
    expect(tour(true)).toBe("0");

    stubMedia({ wide: false });
    expect(tour(true)).toBe("0");

    stubMedia();
    const { container } = render(<CanvasMock ready />);
    fireEvent.pointerEnter(screen.getAllByRole("link")[1]!);
    advance(5000);
    expect(container.querySelector(".pf-mock__cursor")).toHaveAttribute(
      "data-frame",
      "0",
    );
    expect(screen.getAllByRole("link")[1]).toHaveAttribute("data-selected");
  });

  it("ends the tour for good when the hero's motion toggle pauses, as a pick does", () => {
    const { container, rerender } = render(<CanvasMock ready />);
    const cursor = () =>
      container.querySelector(".pf-mock__cursor")!.getAttribute("data-frame");
    advance(900);
    expect(cursor()).toBe("2");
    rerender(<CanvasMock ready paused />);
    advance(5000);
    expect(cursor()).toBe("2");
    rerender(<CanvasMock ready paused={false} />);
    advance(5000);
    expect(cursor()).toBe("2");
  });

  it("turns the phone row with a pager whose buttons name their frame", () => {
    render(<CanvasMock ready={false} />);
    const pager = screen.getAllByRole("button");
    expect(pager.map((button) => button.getAttribute("aria-label"))).toEqual(
      FRAMES.map((frame) => `Show ${frame.name}`),
    );
    expect(pager[0]).toHaveAttribute("aria-current", "true");

    fireEvent.click(pager[1]!);
    expect(pager[1]).toHaveAttribute("aria-current", "true");
    expect(pager[0]).not.toHaveAttribute("aria-current");
    expect(screen.getByText(`${FRAMES[1]!.name}, 2 of 3`)).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
