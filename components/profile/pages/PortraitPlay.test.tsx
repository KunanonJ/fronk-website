import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const saveEdition = vi.hoisted(() =>
  vi.fn((..._args: unknown[]) => Promise.resolve("saved")),
);
vi.mock("@/components/profile/pages/portraitEdition", () => ({
  saveEdition,
}));

import {
  holoAllowed,
  PortraitPlay,
} from "@/components/profile/pages/PortraitPlay";
import { PORTRAIT_COLOURS } from "@/lib/brand/pixelPortrait";

/*
 * The /about pixel portrait (owner, 20-11-26): "Try a trait" (or a press on
 * the portrait) puts on the next trait and remembers it; all six found turn
 * the outline gold; the pill dissolves to the photo and back (a cut under
 * reduced motion, as here).
 */
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  saveEdition.mockClear();
});

const tryTrait = () =>
  screen.getByRole("button", { name: /^(Try a trait|Gold edition)/ });
const portrait = () => document.querySelector(".pf-about-page__pixels")!;
const gold = (svg: Element) =>
  svg.querySelectorAll('path[fill="#e3b341"]').length;

describe("PortraitPlay", () => {
  it("starts with no trait found", () => {
    render(<PortraitPlay />);
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 0/6");
  });

  it("puts on the next trait, says so, and remembers it", () => {
    const { unmount } = render(<PortraitPlay />);
    act(() => fireEvent.click(tryTrait()));
    expect(
      screen.getByText("Shades. 1 of 6 traits found."),
    ).toBeInTheDocument();
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 1/6");
    expect(JSON.parse(localStorage.getItem("pf-portrait-found")!)).toEqual([
      "shades",
    ]);
    unmount();
    render(<PortraitPlay />);
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 1/6");
    // A press on the portrait does the same, for a pointer.
    act(() => fireEvent.click(portrait()));
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 2/6");
  });

  it("turns gold once all six are found", () => {
    const { container } = render(<PortraitPlay />);
    const before = gold(container.querySelector("svg")!);
    for (let i = 0; i < 6; i += 1) act(() => fireEvent.click(tryTrait()));
    expect(tryTrait()).toHaveAccessibleName("Gold edition · 6/6");
    expect(
      screen.getByText("All six traits found: the gold edition."),
    ).toBeInTheDocument();
    expect(gold(container.querySelector("svg")!)).toBeGreaterThan(before);
  });

  it("shows the photo and the pixels again", () => {
    render(<PortraitPlay />);
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the photo" })),
    );
    expect(portrait()).toHaveAttribute("hidden");
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the pixels" })),
    );
    expect(portrait()).not.toHaveAttribute("hidden");
  });
});

/** The media the page reports: which of these queries match. */
function setMedia(matching: readonly string[]) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

const MOUSE = "(hover: hover) and (pointer: fine)";
const TOUCH = "(pointer: coarse)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const FORCED = "(forced-colors: active)";

/** The portrait's card, as AboutPage wraps it. */
const card = () =>
  document.querySelector<HTMLElement>(".pf-about-page__portrait")!;
const inCard = (
  <div className="pf-about-page__portrait">
    <PortraitPlay />
  </div>
);

describe("PortraitPlay: Save my edition (Phase 6)", () => {
  const save = () => screen.queryByRole("button", { name: "Save my edition" });

  it("is not there at rest, and comes once a trait is found", () => {
    render(<PortraitPlay />);
    expect(save()).toBeNull();
    act(() => fireEvent.click(tryTrait()));
    expect(save()).toBeInTheDocument();
  });

  it("saves the portrait as worn, stamped with the count, and says so", async () => {
    render(<PortraitPlay />);
    act(() => fireEvent.click(tryTrait()));
    await act(async () => {
      fireEvent.click(save()!);
    });
    expect(saveEdition).toHaveBeenCalledOnce();
    const [edition, share] = saveEdition.mock.calls[0]! as [
      { rows: string[]; colours: unknown; background: string; stamp: string },
      boolean,
    ];
    expect(edition.rows).toHaveLength(24);
    // Shades, the first trait, are worn: their lenses are drawn.
    expect(edition.rows.join("")).toContain("q");
    expect(edition.colours).toBe(PORTRAIT_COLOURS);
    expect(edition.stamp).toBe("KunanonJ · edition 1/6");
    expect(share).toBe(false);
    await waitFor(() =>
      expect(
        screen.getByText("Saved your edition, 1 of 6, as a PNG."),
      ).toBeInTheDocument(),
    );
  });

  it("offers Share instead on a touch device that can share files", () => {
    setMedia([TOUCH]);
    Object.assign(navigator, { canShare: () => true });
    try {
      render(<PortraitPlay />);
      act(() => fireEvent.click(tryTrait()));
      expect(save()).toBeNull();
      expect(
        screen.getByRole("button", { name: "Share my edition" }),
      ).toBeInTheDocument();
    } finally {
      delete (navigator as { canShare?: unknown }).canShare;
    }
  });
});

describe("PortraitPlay: the holo card (Phase 6)", () => {
  /** The mouse comes over the card: its first move there. */
  const enter = () =>
    fireEvent.pointerMove(card(), {
      pointerType: "mouse",
      clientX: 200,
      clientY: 200,
    });
  const move = (clientX: number, clientY: number) =>
    fireEvent.pointerMove(card(), { pointerType: "mouse", clientX, clientY });

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 400,
      right: 400,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  it("is allowed only for a hovering mouse, with motion and real colours", () => {
    setMedia([MOUSE]);
    expect(holoAllowed()).toBe(true);
    setMedia([MOUSE, REDUCED]);
    expect(holoAllowed()).toBe(false);
    setMedia([MOUSE, FORCED]);
    expect(holoAllowed()).toBe(false);
    setMedia([TOUCH]);
    expect(holoAllowed()).toBe(false);
  });

  it("loads on the first mouse over the card, then tilts toward the pointer", async () => {
    setMedia([MOUSE]);
    render(inCard);
    expect(document.querySelector(".pf-holo")).toBeNull();
    act(() => {
      enter();
    });
    await waitFor(() =>
      expect(document.querySelector(".pf-holo")).toBeInTheDocument(),
    );
    act(() => {
      move(400, 0);
    });
    expect(card().dataset.holo).toBe("on");
    expect(card().style.getPropertyValue("--holo-x")).toBe("100.0%");
    expect(card().style.getPropertyValue("--holo-ry")).toBe("6.00deg");
    expect(card().style.getPropertyValue("--holo-rx")).toBe("6.00deg");
    // The sheen is hidden from assistive tech and comes before the controls,
    // which paint over it.
    const sheen = document.querySelector(".pf-holo")!;
    expect(sheen).toHaveAttribute("aria-hidden", "true");
    const bar = document.querySelector(".pf-about-page__portrait-bar")!;
    expect(
      sheen.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    act(() => {
      fireEvent.pointerLeave(card(), { pointerType: "mouse" });
    });
    expect(card().dataset.holo).toBe("off");
    expect(card().style.getPropertyValue("--holo-ry")).toBe("0deg");
    // The trait button and the toggle still work.
    act(() => fireEvent.click(tryTrait()));
    expect(tryTrait()).toHaveAccessibleName("Try a trait · 1/6");
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Show the photo" })),
    );
    expect(
      screen.getByRole("button", { name: "Show the pixels" }),
    ).toBeInTheDocument();
  });

  it("stays flat under reduced motion and on touch", async () => {
    for (const matching of [[MOUSE, REDUCED], [TOUCH]]) {
      setMedia(matching);
      const { unmount } = render(inCard);
      act(() => {
        enter();
        move(400, 0);
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(document.querySelector(".pf-holo")).toBeNull();
      expect(card().dataset.holo).toBeUndefined();
      expect(card().style.getPropertyValue("--holo-ry")).toBe("");
      unmount();
    }
  });
});
