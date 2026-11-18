import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SayHello } from "@/components/profile/site/SayHello";

/*
 * Say hello (design spec 7.4). Server HTML already has the popover, its
 * address and three links; the copy action appears once script runs.
 */

function fireToggle(panel: HTMLElement, newState: "open" | "closed") {
  const event = new Event("toggle");
  Object.assign(event, { newState });
  act(() => {
    panel.dispatchEvent(event);
  });
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
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

describe("SayHello, server HTML", () => {
  it("opens natively: a popover named by a button, with the address and links", () => {
    const html = renderToString(<SayHello id="say-test" placement="nav" />);

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('popover="auto"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Email Kunanon Jarat"');
    expect(html).toContain("fronk.kunanon@gmail.com");
    expect(html).toContain("Compose in Gmail");
    expect(html).toContain('href="mailto:fronk.kunanon@gmail.com"');
    expect(html).toContain('href="/contact"');
    // Copy email needs script, so the server HTML has no copy button.
    expect(html).not.toContain("Copy email");
  });
});

describe("SayHello, in the page", () => {
  it("copies the address and says so in the live region", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);
    render(<SayHello id="say-copy" placement="nav" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    );
    expect(writeText).toHaveBeenCalledWith("fronk.kunanon@gmail.com");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Copied", hidden: true }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Copied", { selector: "[aria-live]" }),
    ).toBeInTheDocument();
  });

  it("keeps the address when the clipboard refuses", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<SayHello id="say-refused" placement="nav" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    );
    await Promise.resolve();
    expect(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("fronk.kunanon@gmail.com")).toBeInTheDocument();
  });

  it("moves focus to the first row on open, and back to the trigger on Escape", () => {
    (HTMLElement.prototype as { showPopover?: unknown }).showPopover = () => {};
    unshow = showPopovers();
    render(<SayHello id="say-focus" placement="footer" />);
    const trigger = screen.getByRole("button", { name: /Say hello/ });
    const panel = document.getElementById("say-focus")!;

    fireToggle(panel, "open");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    );

    screen
      .getByRole("link", { name: /Open your mail app/, hidden: true })
      .focus();
    fireToggle(panel, "closed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(trigger);
  });

  it("forgets a copied state once the popover closes", async () => {
    stubClipboard(() => Promise.resolve());
    (HTMLElement.prototype as { showPopover?: unknown }).showPopover = () => {};
    unshow = showPopovers();
    render(<SayHello id="say-reset" placement="nav" />);
    const panel = document.getElementById("say-reset")!;
    fireToggle(panel, "open");
    fireEvent.click(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    );
    await waitFor(() =>
      screen.getByRole("button", { name: "Copied", hidden: true }),
    );

    fireToggle(panel, "closed");
    expect(
      screen.getByRole("button", { name: "Copy email", hidden: true }),
    ).toBeInTheDocument();
  });
});
