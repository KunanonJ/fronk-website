import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * ⌘K and the keys typed right after it (UX hunt 22-11-26): the dialog's code
 * loads on first use, and the first letters typed while it did were lost.
 * They are kept for its field; Enter is held from the page, Escape gives the
 * opening up, and a press elsewhere hands the keys back to the page.
 */

vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  useRouter: () => ({ navigate: vi.fn() }),
}));

/**
 * SearchTrigger as a page first has it: its dialog's code not loaded yet,
 * so the first open waits for it, as in a browser.
 */
async function freshTrigger() {
  vi.resetModules();
  const { SearchTrigger } =
    await import("@/components/profile/site/search/SearchTrigger");
  return SearchTrigger;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify([]))),
  );
  // jsdom has no modal dialogs: open (focus in) and close as browsers do.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
    this.querySelector<HTMLElement>("input")?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Presses a key where focus is, as a reader would; false once prevented. */
function press(key: string, init: KeyboardEventInit = {}) {
  return fireEvent.keyDown(document.activeElement ?? document.body, {
    key,
    ...init,
  });
}

/**
 * The dialog's field, once it shows. React holds the dialog until its own
 * stylesheet's preload has loaded, which jsdom never does: it loads here.
 */
const field = () =>
  waitFor(() => {
    for (const link of document.head.querySelectorAll("link"))
      link.dispatchEvent(new Event("load"));
    return screen.getByRole("combobox", { name: "Search the site" });
  });

describe("SearchTrigger, the keys typed while the dialog loads", () => {
  it("keeps them from the page and starts the field with them", async () => {
    const SearchTrigger = await freshTrigger();
    render(<SearchTrigger />);
    expect(press("k", { metaKey: true })).toBe(false);
    for (const key of ["v", "e", "r", "x"]) expect(press(key)).toBe(false);
    expect(press("Backspace")).toBe(false);
    expect(press("B", { shiftKey: true })).toBe(false);
    // A shortcut chord is not typing; it is left to the page.
    expect(press("c", { metaKey: true })).toBe(true);
    const input = await field();
    expect(input).toHaveValue("verB");
    expect(input).toHaveFocus();
    // From here on the keys are the field's own.
    expect(press("z")).toBe(true);
  });

  it("holds Enter from what has focus on the page", async () => {
    const SearchTrigger = await freshTrigger();
    render(
      <>
        <a href="/elsewhere">A link</a>
        <SearchTrigger />
      </>,
    );
    screen.getByRole("link", { name: "A link" }).focus();
    press("k", { ctrlKey: true });
    expect(press("Enter")).toBe(false);
    expect(await field()).toHaveValue("");
  });

  it("gives the opening up on Escape", async () => {
    const SearchTrigger = await freshTrigger();
    render(<SearchTrigger />);
    press("k", { metaKey: true });
    expect(press("Escape")).toBe(false);
    // The code arrives, and nothing opens.
    await import("@/components/profile/site/search/SearchDialog");
    await new Promise((done) => setTimeout(done, 50));
    expect(document.querySelector("dialog")).toBeNull();
    // The next ⌘K opens it.
    press("k", { metaKey: true });
    expect(await field()).toBeInTheDocument();
  });

  it("hands the keys back to the page after a press elsewhere", async () => {
    const SearchTrigger = await freshTrigger();
    render(<SearchTrigger />);
    press("k", { metaKey: true });
    expect(press("a")).toBe(false);
    fireEvent.pointerDown(document.body);
    expect(press("b")).toBe(true);
    expect(await field()).toHaveValue("a");
  });

  it("keeps nothing once the dialog is open, and a second ⌘K opens no other", async () => {
    const SearchTrigger = await freshTrigger();
    render(<SearchTrigger />);
    fireEvent.click(screen.getByRole("button", { name: "Search the site" }));
    expect(await field()).toHaveFocus();
    expect(press("z")).toBe(true);
    press("k", { metaKey: true });
    expect(press("y")).toBe(true);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });
});
