import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  POPOVER_IDS,
  closePopover,
  closePopoversForModal,
  isPopoverOpen,
  usePopover,
} from "@/components/profile/site/popover";

/*
 * The popover script (design spec 7.4 to 7.6). jsdom has no Popover API, so the
 * native branch is driven by stubs (showPopover, and matches for :popover-open)
 * and hand-made `toggle` events, and the fallback branch by its absence, where
 * the panel shows on `data-open`.
 */

function Fixture({
  onClose,
  native = true,
  id = "panel-under-test",
}: {
  onClose?: () => void;
  native?: boolean;
  id?: string;
}) {
  usePopover(id, {
    names: { open: "Close it", closed: "Open it" },
    onClose,
  });
  const popover = native ? { popover: "auto" as const } : {};
  return (
    <>
      <button type="button" popoverTarget={id}>
        Open it
      </button>
      <div id={id} {...popover}>
        <button type="button">First</button>
        <a href="/x">Second</a>
      </div>
    </>
  );
}

/** Stubs `:popover-open` on the panel, open until `hidePopover` runs. */
function openNatively(panel: HTMLElement) {
  let open = true;
  vi.spyOn(panel, "matches").mockImplementation(
    (selector: string) => open && selector === ":popover-open",
  );
  return vi.spyOn(panel, "hidePopover").mockImplementation(() => {
    open = false;
  });
}

function fireToggle(panel: HTMLElement, newState: "open" | "closed") {
  const event = new Event("toggle");
  Object.assign(event, { newState });
  act(() => {
    panel.dispatchEvent(event);
  });
}

/** jsdom hides closed popovers and will not focus inside them; an open one is shown. */
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
  delete (HTMLElement.prototype as { hidePopover?: unknown }).hidePopover;
  vi.restoreAllMocks();
});

function stubNative() {
  (HTMLElement.prototype as { showPopover?: unknown }).showPopover = () => {};
  (HTMLElement.prototype as { hidePopover?: unknown }).hidePopover = () => {};
  unshow = showPopovers();
}

describe("usePopover, native branch", () => {
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
    const invoker = screen.getByRole("button", { name: "Open it" });
    expect(invoker).toHaveAttribute("aria-expanded", "false");
    expect(invoker).toHaveAttribute("aria-label", "Open it");
    expect(document.activeElement).toBe(invoker);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves focus where an outside press put it when the popover closes", () => {
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

  it("closes when focus moves on to the page, and leaves focus there", () => {
    stubNative();
    render(
      <>
        <Fixture />
        <input aria-label="Elsewhere" />
      </>,
    );
    const panel = document.getElementById("panel-under-test")!;
    fireToggle(panel, "open");
    const hide = openNatively(panel);
    const elsewhere = screen.getByRole("textbox", { name: "Elsewhere" });
    elsewhere.focus();
    expect(hide).toHaveBeenCalledTimes(1);
    fireToggle(panel, "closed");
    expect(document.activeElement).toBe(elsewhere);
  });

  it("stays open while focus moves between the panel and its invoker", () => {
    stubNative();
    render(<Fixture />);
    const panel = document.getElementById("panel-under-test")!;
    fireToggle(panel, "open");
    const hide = openNatively(panel);
    screen.getByRole("link", { name: "Second", hidden: true }).focus();
    screen.getByRole("button", { name: "Close it" }).focus();
    screen.getByRole("button", { name: "First", hidden: true }).focus();
    expect(hide).not.toHaveBeenCalled();
  });

  it("closePopoversForModal sends focus from inside an open panel to its invoker, then closes it", () => {
    stubNative();
    render(<Fixture id={POPOVER_IDS.nav} />);
    const panel = document.getElementById(POPOVER_IDS.nav)!;
    fireToggle(panel, "open");
    const invoker = screen.getByRole("button", { name: "Close it" });
    const hide = openNatively(panel);
    // Where focus is as the panel closes: on the invoker already.
    hide.mockImplementation(() => {
      expect(document.activeElement).toBe(invoker);
    });
    act(() => closePopoversForModal());
    expect(hide).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(invoker);
  });

  it("closePopover hides an open native popover", () => {
    stubNative();
    render(<Fixture />);
    const panel = document.getElementById("panel-under-test")!;
    const hide = vi.spyOn(panel, "hidePopover");
    vi.spyOn(panel, "matches").mockImplementation(
      (selector: string) => selector === ":popover-open",
    );
    expect(isPopoverOpen(panel)).toBe(true);
    closePopover("panel-under-test");
    expect(hide).toHaveBeenCalledTimes(1);
  });
});

describe("usePopover, fallback branch (no Popover API)", () => {
  it("opens the panel from its invoker, names the state, and moves focus in", () => {
    render(<Fixture native={false} />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    expect(panel).not.toHaveAttribute("data-open");
    expect(invoker).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(invoker);
    expect(panel).toHaveAttribute("data-open");
    expect(isPopoverOpen(panel)).toBe(true);
    expect(invoker).toHaveAttribute("aria-expanded", "true");
    expect(invoker).toHaveAttribute("aria-label", "Close it");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" }),
    );
  });

  it("closes on Escape and returns focus to the invoker", () => {
    render(<Fixture native={false} />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    fireEvent.click(invoker);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel).not.toHaveAttribute("data-open");
    expect(invoker).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(invoker);
  });

  it("closes on a press outside, and stays open for a press inside", () => {
    render(
      <>
        <Fixture native={false} />
        <p>Outside</p>
      </>,
    );
    const panel = document.getElementById("panel-under-test")!;
    fireEvent.click(screen.getByRole("button", { name: "Open it" }));

    fireEvent.pointerDown(screen.getByRole("button", { name: "First" }));
    expect(panel).toHaveAttribute("data-open");
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(panel).not.toHaveAttribute("data-open");
  });

  it("closePopover closes the open panel the way a link does, with the same bookkeeping", () => {
    const onClose = vi.fn();
    render(<Fixture native={false} onClose={onClose} />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    fireEvent.click(invoker);
    screen.getByRole("link", { name: "Second" }).focus();

    act(() => closePopover("panel-under-test"));
    expect(panel).not.toHaveAttribute("data-open");
    expect(invoker).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(invoker);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves a closed panel alone", () => {
    const onClose = vi.fn();
    render(<Fixture native={false} onClose={onClose} />);
    act(() => closePopover("panel-under-test"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when focus moves on to the page, and keeps it open between panel and invoker", () => {
    render(
      <>
        <Fixture native={false} />
        <input aria-label="Elsewhere" />
      </>,
    );
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById("panel-under-test")!;
    fireEvent.click(invoker);
    act(() => invoker.focus());
    act(() => screen.getByRole("link", { name: "Second" }).focus());
    expect(panel).toHaveAttribute("data-open");

    const elsewhere = screen.getByRole("textbox", { name: "Elsewhere" });
    act(() => elsewhere.focus());
    expect(panel).not.toHaveAttribute("data-open");
    expect(invoker).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(elsewhere);
  });

  it("closePopoversForModal closes every open chrome panel, focus to its invoker, and the bookkeeping follows", () => {
    const onClose = vi.fn();
    render(<Fixture native={false} id={POPOVER_IDS.menu} onClose={onClose} />);
    const invoker = screen.getByRole("button", { name: "Open it" });
    const panel = document.getElementById(POPOVER_IDS.menu)!;
    fireEvent.click(invoker);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" }),
    );

    act(() => closePopoversForModal());
    expect(panel).not.toHaveAttribute("data-open");
    expect(invoker).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(invoker);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
