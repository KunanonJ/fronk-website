import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CanvasMock } from "@/components/profile/home/CanvasMock";
import { canvasMock, type MockFrame } from "@/lib/content/home";

/*
 * The hero's canvas mock (design spec 8.2 and 12, item 16; plan gate 6): it
 * exposes only its frame links (and, on phones, the pager); a frame chosen
 * by pointer or focus drives the inspector; the named cursor tours once and
 * rests; drawings carry the "Illustration" label. From 810 px with a mouse
 * its toolbar is real (now-building-and-genz Phase 4); CanvasInk.test.tsx
 * covers the drawing layer itself.
 */

const store = vi.hoisted(() => ({ award: vi.fn(() => true) }));
vi.mock("@/lib/brand/traitStore", () => store);

const FRAMES = canvasMock.frames;

/**
 * Motion allowed or not, whether the viewport is wide (810 px and up), and
 * whether the pointer can hover (a mouse).
 */
function stubMedia({ reduce = false, wide = true, fine = false } = {}) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce")
          ? reduce
          : query.includes("min-width")
            ? wide
            : query.includes("pointer: fine")
              ? fine
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
      FRAMES.map((frame) => `/portfolio/${frame.slug}`),
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

  it("selects a frame from its layer, as hovering the frame does, and sends the named cursor there", () => {
    const { container } = render(<CanvasMock ready />);
    const links = screen.getAllByRole("link");
    const layers = container.querySelectorAll<HTMLElement>(".pf-mock__layer");
    const cursor = container.querySelector(".pf-mock__cursor")!;

    // Over a layer, its frame is outlined but the selection stays.
    fireEvent.pointerEnter(layers[1]!);
    expect(links[1]).toHaveAttribute("data-hovered");
    expect(links[1]).not.toHaveAttribute("data-selected");
    expect(links[0]).toHaveAttribute("data-selected");
    fireEvent.pointerLeave(container.querySelector(".pf-mock__layer-list")!);
    expect(links[1]).not.toHaveAttribute("data-hovered");

    // Pressed, it selects the frame, drives the inspector and the cursor,
    // and ends the tour like any pick.
    fireEvent.click(layers[1]!);
    expect(links[1]).toHaveAttribute("data-selected");
    expect(links[0]).not.toHaveAttribute("data-selected");
    expect(layers[1]).toHaveAttribute("data-selected");
    expect(inspector(container)).toHaveTextContent(FRAMES[1]!.name);
    expect(cursor).toHaveAttribute("data-frame", "1");
    advance(5000);
    expect(cursor).toHaveAttribute("data-frame", "1");
    expect(links[1]).toHaveAttribute("data-selected");

    // The selected frame is not outlined twice.
    fireEvent.pointerEnter(layers[1]!);
    expect(links[1]).not.toHaveAttribute("data-hovered");
  });

  it("drifts the dotted canvas against a fine pointer, and eases it back when it leaves", () => {
    // Frames run at once; the id 0 says none is still pending, as it is
    // once a real frame has run.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((step) => {
      step(0);
      return 0;
    });
    const pan = (canvas: HTMLElement) => [
      canvas.style.getPropertyValue("--pan-x"),
      canvas.style.getPropertyValue("--pan-y"),
    ];
    const hover = (canvas: HTMLElement, clientX: number, clientY: number) => {
      vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
        left: 100,
        top: 50,
        width: 400,
        height: 200,
      } as DOMRect);
      fireEvent.pointerMove(canvas, { clientX, clientY });
    };

    stubMedia({ fine: true });
    const view = render(<CanvasMock ready={false} />);
    const canvas =
      view.container.querySelector<HTMLElement>(".pf-mock__canvas")!;
    // The pointer at the canvas's right edge, a quarter of the way down.
    hover(canvas, 500, 100);
    expect(pan(canvas)).toEqual(["-12px", "6px"]);
    fireEvent.pointerLeave(canvas);
    expect(pan(canvas)).toEqual(["0px", "0px"]);
    // Paused by the hero's motion toggle, it rests where it started.
    hover(canvas, 500, 100);
    view.rerender(<CanvasMock ready={false} paused />);
    expect(pan(canvas)).toEqual(["", ""]);
    hover(canvas, 100, 50);
    expect(pan(canvas)).toEqual(["", ""]);
    view.unmount();

    // Never under reduced motion, nor for a touch screen.
    for (const media of [{ fine: true, reduce: true }, { fine: false }]) {
      stubMedia(media);
      const still = render(<CanvasMock ready={false} />);
      const el =
        still.container.querySelector<HTMLElement>(".pf-mock__canvas")!;
      hover(el, 500, 100);
      expect(pan(el)).toEqual(["", ""]);
      still.unmount();
    }
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

describe("CanvasMock's tools, from 810 px with a mouse", () => {
  const toolbar = () => screen.getByRole("toolbar", { name: "Canvas tools" });
  const button = (name: string) =>
    within(toolbar()).getByRole("button", { name });
  /** The icon in each slot, by lucide's class, or "dot" for the ink. */
  const icons = (bar: Element) =>
    [...bar.querySelectorAll(":scope > * > svg")].map(
      (svg) =>
        [...svg.classList].find((name) => name.startsWith("lucide-")) ?? "dot",
    );
  /** The toolbar shows its own tools from the first paint. */
  const TOOLS = [
    "lucide-mouse-pointer-2",
    "lucide-sticker",
    "lucide-pen-tool",
    "dot",
    "lucide-eraser",
  ];

  beforeEach(() => {
    stubMedia({ fine: true });
  });

  it("is a toolbar of five buttons, drawn as the decorative one until it is reached for", () => {
    const { container } = render(<CanvasMock ready={false} />);
    const bar = toolbar();
    expect(bar.closest("[aria-hidden='true']")).toBeNull();
    expect(bar).toHaveClass("pf-mock__tools");
    const group = screen.getByRole("group", { name: "Featured projects" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((el) => el.getAttribute("aria-label")),
    ).toEqual(["Move", "Stickers", "Pen", "Ink: violet", "Clear the canvas"]);
    expect(button("Move")).toHaveAttribute("aria-pressed", "true");
    expect(button("Move")).toHaveAttribute("data-on");
    expect(button("Stickers")).toHaveAttribute("aria-pressed", "false");
    expect(button("Pen")).toHaveAttribute("aria-pressed", "false");
    expect(button("Ink: violet")).not.toHaveAttribute("aria-pressed");
    expect(button("Clear the canvas")).toHaveAttribute("aria-disabled", "true");
    // At rest, each slot shows its own tool, Move pressed.
    expect(icons(bar)).toEqual(TOOLS);
    // Nothing of the tools loads until the toolbar is reached for.
    expect(container.querySelector(".pf-ink")).toBeNull();

    // Reached for, it wakes for good, and the same tools stay.
    fireEvent.pointerEnter(bar);
    expect(icons(bar)).toEqual(TOOLS);
    fireEvent.pointerLeave(bar);
    expect(bar).toHaveAttribute("data-awake");
  });

  it("wakes on keyboard focus too, and moves along one tab stop with the arrows, Home and End", () => {
    render(<CanvasMock ready={false} />);
    const bar = toolbar();
    const buttons = within(bar).getAllByRole("button");
    expect(buttons.map((el) => el.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    act(() => buttons[0]!.focus());
    expect(bar).toHaveAttribute("data-awake");
    fireEvent.keyDown(buttons[0]!, { key: "ArrowRight" });
    expect(buttons[1]).toHaveFocus();
    expect(buttons.map((el) => el.tabIndex)).toEqual([-1, 0, -1, -1, -1]);
    fireEvent.keyDown(buttons[1]!, { key: "End" });
    expect(buttons[4]).toHaveFocus();
    fireEvent.keyDown(buttons[4]!, { key: "ArrowRight" });
    expect(buttons[0]).toHaveFocus();
    fireEvent.keyDown(buttons[0]!, { key: "ArrowLeft" });
    expect(buttons[4]).toHaveFocus();
    fireEvent.keyDown(buttons[4]!, { key: "Home" });
    expect(buttons[0]).toHaveFocus();
  });

  it("switches tools, ends the named cursor's tour, and Esc puts any tool down", () => {
    const { container } = render(<CanvasMock ready />);
    const mock = container.querySelector(".pf-mock")!;
    const cursor = container.querySelector(".pf-mock__cursor")!;

    fireEvent.click(button("Pen"));
    expect(button("Pen")).toHaveAttribute("aria-pressed", "true");
    expect(button("Move")).toHaveAttribute("aria-pressed", "false");
    expect(mock).toHaveAttribute("data-tool", "pen");
    advance(5000);
    expect(cursor).toHaveAttribute("data-frame", "0");

    fireEvent.click(button("Stickers"));
    expect(button("Stickers")).toHaveAttribute("aria-pressed", "true");
    expect(button("Pen")).toHaveAttribute("aria-pressed", "false");
    expect(mock).toHaveAttribute("data-tool", "stickers");

    // Esc is a dialog's first, and another handler's.
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.append(dialog);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(mock).toHaveAttribute("data-tool", "stickers");
    dialog.remove();
    const taken = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });
    taken.preventDefault();
    act(() => {
      window.dispatchEvent(taken);
    });
    expect(mock).toHaveAttribute("data-tool", "stickers");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(button("Move")).toHaveAttribute("aria-pressed", "true");
    expect(mock).not.toHaveAttribute("data-tool");

    // The ink turns between violet and coral.
    fireEvent.click(button("Ink: violet"));
    expect(button("Ink: coral")).toBeInTheDocument();
  });

  it("is decoration on a touch screen and on a narrow one, as before", () => {
    for (const media of [
      { wide: true, fine: false },
      { wide: false, fine: true },
    ]) {
      stubMedia(media);
      const { container, unmount } = render(<CanvasMock ready={false} />);
      expect(screen.queryByRole("toolbar")).toBeNull();
      expect(container.querySelector(".pf-mock__tools")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      const group = screen.getByRole("group", { name: "Featured projects" });
      expect(within(group).queryAllByRole("button")).toHaveLength(0);
      unmount();
    }
  });

  it("stamps a sticker from the keyboard, says so, finds the trait, and Clear empties the canvas", async () => {
    vi.useRealTimers();
    store.award.mockClear();
    const { container } = render(<CanvasMock ready={false} />);
    const live = container.querySelector("[aria-live='polite']")!;
    // Stickers on, then pressed again: a sticker at a free spot.
    fireEvent.click(button("Stickers"));
    fireEvent.click(button("Stickers"));
    await vi.waitFor(() =>
      expect(container.querySelectorAll(".pf-sticker")).toHaveLength(1),
    );
    const layer = container.querySelector(".pf-mock__canvas > .pf-ink")!;
    expect(layer).toHaveAttribute("data-tool", "stickers");
    expect(live).toHaveTextContent("Sticker placed: ship it");
    await vi.waitFor(() =>
      expect(store.award).toHaveBeenCalledWith("headphones", "canvas"),
    );
    expect(button("Clear the canvas")).not.toHaveAttribute("aria-disabled");
    expect(button("Stickers").title).toBe("Stickers: press again to stamp one");

    fireEvent.click(button("Clear the canvas"));
    expect(container.querySelectorAll(".pf-sticker")).toHaveLength(0);
    expect(live).toHaveTextContent("Canvas cleared");
    expect(button("Clear the canvas")).toHaveAttribute("aria-disabled", "true");
    // Disabled, it does nothing.
    fireEvent.click(button("Clear the canvas"));
    expect(live.textContent).toBe("Canvas cleared");
  });
});
