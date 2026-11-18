import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import SharePanelHost from "@/components/bento/SharePanelHost";
import SharePill from "@/components/bento/SharePill";

/*
 * The layout's share panel host (Phase 6 cutover; review finding 1): the
 * panel a hero Share pill opens on the pages Phase 7 restyles. It sits last in
 * the page, fixed under the bar, so focus that leaves it for a place outside
 * the panel and the pill must close it, or it would cover what has focus
 * (WCAG 2.4.11). Escape returns focus to the pill only from the panel or the
 * pill, and print drops the panel.
 */

function renderPage() {
  return render(
    <ChromeProvider>
      <a href="#main">Skip to content</a>
      <main id="main">
        <p>Page body</p>
        <SharePill />
        <a href="/after">A link after the pill</a>
      </main>
      <SharePanelHost />
    </ChromeProvider>,
  );
}

const pill = () => screen.getByRole("button", { name: "Share" });
const panel = () => screen.queryByRole("region", { name: "Share this page" });
/** The panel's rows, in order: Copy link, X, LinkedIn, email. */
const rows = () => [
  ...panel()!.querySelectorAll<HTMLElement>("button, a[href]"),
];
const outside = () =>
  screen.getByRole("link", { name: "A link after the pill" });

function openShare() {
  fireEvent.pointerDown(pill());
  fireEvent.click(pill());
  expect(panel()).not.toBeNull();
}

afterEach(() => {
  (document.activeElement as HTMLElement | null)?.blur();
});

describe("SharePanelHost", () => {
  it("draws the panel in the chrome's scope, in English, and keeps it out of print", () => {
    renderPage();
    openShare();
    const host = panel()!.parentElement!;
    expect(host).toHaveAttribute("data-print-hide");
    expect(host).toHaveAttribute("lang", "en");
    expect(host).toHaveAttribute("data-design", "profile");
    expect(host.className).toMatch(/\bfixed\b/);
  });

  it("moves focus to the first row, and Escape from the panel returns it to the pill", () => {
    renderPage();
    pill().focus();
    openShare();
    expect(document.activeElement).toBe(rows()[0]);
    rows()[2]!.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(pill());
  });

  it("returns focus to the pill on Escape from the pill too", () => {
    renderPage();
    openShare();
    pill().focus();
    expect(panel()).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(pill());
  });

  it("closes on Escape with focus elsewhere, and leaves focus where it is", () => {
    renderPage();
    openShare();
    // Focus goes nowhere (a press on the panel's text, another window): the
    // panel stays open, and nothing in it or on the pill has focus.
    rows()[0]!.blur();
    expect(panel()).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it("closes when a row blurs to a place outside the panel and the pill", () => {
    renderPage();
    openShare();
    fireEvent.focusOut(rows()[0]!, { relatedTarget: outside() });
    expect(panel()).toBeNull();
  });

  it("closes when focus moves outside both, and leaves focus there", () => {
    renderPage();
    openShare();
    // A real focus move (the panel's state changes outside React's events).
    act(() => outside().focus());
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(outside());
  });

  it("stays open while focus moves between its rows, back to the pill, or nowhere", () => {
    renderPage();
    openShare();
    rows()[1]!.focus();
    expect(panel()).not.toBeNull();
    pill().focus();
    expect(panel()).not.toBeNull();
    rows()[0]!.focus();
    // Focus going nowhere: another window, or the share sheet.
    fireEvent.focusOut(rows()[0]!, { relatedTarget: null });
    expect(panel()).not.toBeNull();
    fireEvent.focusOut(pill(), { relatedTarget: null });
    expect(panel()).not.toBeNull();
  });

  it("closes when focus comes back onto the page outside both, as Tab past its last row does in a browser", () => {
    renderPage();
    openShare();
    // Tab past the last row leaves the page for the browser's own UI...
    const last = rows().at(-1)!;
    last.focus();
    fireEvent.focusOut(last, { relatedTarget: null });
    expect(panel()).not.toBeNull();
    // ...and the next Tab lands on the skip link, with no related target.
    fireEvent.focusIn(screen.getByRole("link", { name: "Skip to content" }));
    expect(panel()).toBeNull();
  });

  it("closes on a press outside, but not on a press inside it or on the pill", () => {
    renderPage();
    openShare();
    fireEvent.pointerDown(rows()[0]!);
    expect(panel()).not.toBeNull();
    fireEvent.pointerDown(pill());
    expect(panel()).not.toBeNull();
    fireEvent.pointerDown(screen.getByText("Page body"));
    expect(panel()).toBeNull();
  });
});
