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
