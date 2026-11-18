import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePopover } from "@/components/profile/site/popover";

/*
 * The popover script (design spec 7.4 to 7.6). jsdom has no Popover API, so
 * the native branch is driven by a stubbed showPopover and hand-made `toggle`
 * events, and the fallback branch by its absence.
 */

/** `native` gives the panel the popover attribute, as an engine with popovers reads it. */
function Fixture({
  onClose,
  native = true,
}: {
  onClose?: () => void;
  native?: boolean;
}) {
  usePopover("panel-under-test", {
    names: { open: "Close it", closed: "Open it" },
    onClose,
  });
  const popover = native ? { popover: "auto" as const } : {};
  return (
    <>
      <button
        type="button"
        popoverTarget="panel-under-test"
        aria-expanded="false"
      >
        Open it
      </button>
      <div id="panel-under-test" {...popover}>
        <button type="button">First</button>
        <a href="/x">Second</a>
      </div>
    </>
  );
}

function fireToggle(panel: HTMLElement, newState: "open" | "closed") {
  const event = new Event("toggle");
  Object.assign(event, { newState });
  act(() => {
    panel.dispatchEvent(event);
  });
}

/** jsdom hides closed popovers and will not focus inside them; an open popover is shown. */
function showPopovers(): () => void {
  const style = document.createElement("style");
  style.textContent = "[popover] { display: block !important; }";
  document.head.append(style);
  return () => style.remove();
}

let unshow: () => void = () => {};

afterEach(() => {
  unshow();
  delete (HTMLElement.prototype as { showPopover?: unknown }).showPopover;
  vi.restoreAllMocks();
});

describe("usePopover, native branch", () => {
  function stubNative() {
    (HTMLElement.prototype as { showPopover?: unknown }).showPopover = () => {};
    unshow = showPopovers();
  }

  it("mirrors the open state onto the invoker and moves focus in on open", () => {
    stubNative();
    render(<Fixture />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    expect(invoker).toHaveAttribute("aria-expanded", "false");

    fireToggle(panel, "open");
    expect(invoker).toHaveAttribute("aria-expanded", "true");
    expect(invoker).toHaveAttribute("aria-label", "Close it");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First", hidden: true }),
    );
  });

  it("returns focus to the invoker when focus was inside and the popover closes", () => {
    stubNative();
    const onClose = vi.fn();
    render(<Fixture onClose={onClose} />);
    const panel = document.getElementById("panel-under-test")!;
    fireToggle(panel, "open");
    screen.getByRole("link", { name: "Second", hidden: true }).focus();

    fireToggle(panel, "closed");
    expect(screen.getByRole("button", { name: "Open it" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open it" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves focus where an outside click put it when the popover closes", () => {
    stubNative();
    render(
      <>
        <Fixture />
        <input aria-label="Elsewhere" />
      </>,
    );
    const panel = document.getElementById("panel-under-test")!;
    fireToggle(panel, "open");
    screen.getByRole("textbox", { name: "Elsewhere" }).focus();
    fireToggle(panel, "closed");
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Elsewhere" }),
    );
  });
});

describe("usePopover, fallback branch", () => {
  it("hides the panel until the invoker opens it, then closes on Escape and returns focus", () => {
    render(<Fixture native={false} />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    expect(panel.hidden).toBe(true);

    fireEvent.click(invoker);
    expect(panel.hidden).toBe(false);
    expect(invoker).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" }),
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(invoker);
  });

  it("closes on a pointer down outside, and stays open for one inside", () => {
    render(
      <>
        <Fixture native={false} />
        <p>Outside</p>
      </>,
    );
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    fireEvent.click(invoker);

    fireEvent.pointerDown(screen.getByRole("button", { name: "First" }));
    expect(panel.hidden).toBe(false);
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(panel.hidden).toBe(true);
  });
});
