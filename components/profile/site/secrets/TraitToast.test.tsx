import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { ProfileLink } from "@/components/profile/site/ProfileLink";
import TraitToast, {
  TOAST_MS,
} from "@/components/profile/site/secrets/TraitToast";
import { PORTRAIT_SMALL } from "@/lib/brand/pixelPortrait";
import type { TraitNews } from "@/lib/brand/traitEvents";

/*
 * The found-trait toast (now-building-and-genz Phase 3): a polite line with
 * the count, a link to /about's portrait, gone after 5 s unless the pointer
 * or focus holds it, closed by its button or Esc, and held back while a
 * modal dialog is open.
 */

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  localStorage.setItem("pf-portrait-found", JSON.stringify(["cap", "shades"]));
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

function show(news: TraitNews = { id: "shades", isNew: true }) {
  const onClose = vi.fn();
  const view = render(
    <TraitToast
      news={news}
      base={PORTRAIT_SMALL}
      Portrait={PixelPortrait}
      Link={ProfileLink}
      onClose={onClose}
    />,
  );
  // The words land a frame after the region.
  act(() => {
    vi.advanceTimersToNextFrame();
  });
  return { onClose, ...view };
}

describe("TraitToast", () => {
  it("says what was found and how many, politely, with the way to the portrait", () => {
    show();
    expect(screen.getByRole("status")).toHaveTextContent(
      "You found Shades · 2/6",
    );
    expect(
      screen.getByRole("link", { name: "See your portrait" }),
    ).toHaveAttribute("href", "/about#portrait");
    // The portrait wears it: the shades' lenses are drawn.
    expect(
      document.querySelector('.pf-toast__portrait path[fill="#2a2440"]'),
    ).not.toBeNull();
  });

  it("says a trait put on again by the party", () => {
    show({ id: "shades", isNew: false });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Pixel party · Shades on",
    );
  });

  it("goes by itself after 5 s", () => {
    // show() has run one frame (16 ms) of the 5 s.
    const { onClose } = show();
    act(() => {
      vi.advanceTimersByTime(TOAST_MS - 100);
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("waits while the pointer or focus is on it", () => {
    const { onClose } = show();
    const toast = screen.getByTestId("trait-toast");
    fireEvent.pointerEnter(toast);
    act(() => {
      vi.advanceTimersByTime(TOAST_MS * 3);
    });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerLeave(toast);
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).focus();
    });
    act(() => {
      vi.advanceTimersByTime(TOAST_MS * 3);
    });
    expect(onClose).not.toHaveBeenCalled();
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).blur();
    });
    act(() => {
      vi.advanceTimersByTime(TOAST_MS);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes with its button and with Esc", () => {
    const first = show();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(first.onClose).toHaveBeenCalledTimes(1);
    first.unmount();

    const second = show();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(second.onClose).toHaveBeenCalledTimes(1);
  });

  describe("where it stands (UX sweep 21-11-26)", () => {
    /** The page's rects: the toast's by its place, a link's as given. */
    function layout(link: HTMLElement, linkBox: [number, number]) {
      const style = document.createElement("style");
      // What secrets.css gives it, so it is placed.
      style.textContent = ".pf-toast { position: fixed; }";
      document.head.append(style);
      const rect = (top: number, height: number) =>
        ({
          x: 16,
          y: top,
          left: 16,
          top,
          right: 360,
          bottom: top + height,
          width: 344,
          height,
        }) as DOMRect;
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function (this: Element) {
          if (this === link) return rect(...linkBox);
          if (this.matches(".pf-toast"))
            return (this as HTMLElement).dataset.place === "low"
              ? rect(760, 66)
              : rect(92, 66);
          return rect(0, 0);
        },
      );
      return () => style.remove();
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("stands under the bar when nothing to press lies there", () => {
      const link = Object.assign(document.createElement("a"), {
        href: "/stack",
        textContent: "Stack",
      });
      document.body.append(link);
      // The link is at the foot of the screen, under the toast's other place.
      const undo = layout(link, [780, 28]);
      show();
      expect(screen.getByTestId("trait-toast")).not.toHaveAttribute(
        "data-place",
      );
      undo();
    });

    it("goes to the foot when the top lies over a link and the foot does not", () => {
      const link = Object.assign(document.createElement("a"), {
        href: "/stack",
        textContent: "Stack",
      });
      document.body.append(link);
      const undo = layout(link, [110, 28]);
      show();
      expect(screen.getByTestId("trait-toast")).toHaveAttribute(
        "data-place",
        "low",
      );
      // Its own link and button never count.
      expect(
        screen.getByRole("link", { name: "See your portrait" }),
      ).toBeVisible();
      undo();
    });

    it("moves to its other place when focus or the page brings the focused link under it", () => {
      const link = Object.assign(document.createElement("a"), {
        href: "/stack",
        textContent: "Stack",
      });
      document.body.append(link);
      const box: [number, number] = [110, 28];
      const undo = layout(link, box);
      const { onClose } = show();
      const toast = screen.getByTestId("trait-toast");
      expect(toast).toHaveAttribute("data-place", "low");

      // Tabbed to and scrolled in at the foot of the screen, under it.
      box[0] = 780;
      act(() => {
        link.focus();
        vi.advanceTimersToNextFrame();
      });
      expect(toast).not.toHaveAttribute("data-place");

      // The page scrolls it under the top: back to the foot.
      box[0] = 100;
      act(() => {
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersToNextFrame();
      });
      expect(toast).toHaveAttribute("data-place", "low");
      expect(onClose).not.toHaveBeenCalled();
      undo();
    });

    it("goes when both its places lie over the focused control", () => {
      const button = Object.assign(document.createElement("button"), {
        textContent: "Tall",
      });
      document.body.append(button);
      const undo = layout(button, [0, 900]);
      const { onClose } = show();
      act(() => {
        button.focus();
        vi.advanceTimersToNextFrame();
      });
      expect(onClose).toHaveBeenCalledTimes(1);
      undo();
    });

    it("stays put when focus lands under it on what is not a link or control", () => {
      const main = Object.assign(document.createElement("main"), {
        tabIndex: -1,
      });
      document.body.append(main);
      const undo = layout(main, [0, 900]);
      const { onClose } = show();
      const toast = screen.getByTestId("trait-toast");
      act(() => {
        main.focus();
        vi.advanceTimersToNextFrame();
      });
      expect(toast).not.toHaveAttribute("data-place");
      expect(onClose).not.toHaveBeenCalled();
      undo();
    });
  });

  it("waits for an open dialog to close, and leaves Esc to it", () => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.append(dialog);
    const { onClose } = show();
    expect(screen.queryByTestId("trait-toast")).toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();

    dialog.removeAttribute("open");
    act(() => {
      dialog.dispatchEvent(new Event("close"));
    });
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    expect(screen.getByRole("status")).toHaveTextContent("You found Shades");
  });
});
