import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Notebook } from "@/components/profile/home/Notebook";
import { autoplayMs, wordCount } from "@/components/profile/home/notebookRules";
import { SAMPLE_NOTES } from "@/components/profile/preview/sampleNotes";
import { notesCopy } from "@/lib/content/testimonials";

/*
 * The notebook (design spec 8.7; plan step 4e and gate 3): previous, next and
 * pause by keyboard; the open page is the only one not inert; autoplay after
 * min(18 s, max(7 s, 2 s + 180 ms a word)), held on hover, on focus and by
 * the pause button; nothing turns on its own under reduced motion; the live
 * region speaks after a reader's turn only. The samples are the preview's
 * labelled ones.
 */

function stubMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
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

const wait = (index: number) =>
  autoplayMs(wordCount(SAMPLE_NOTES[index]!.quote));

/** The page a reader can see: the only article not hidden. */
const openPage = () => screen.getByRole("article").getAttribute("aria-label");

beforeEach(() => {
  vi.useFakeTimers();
  stubMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Notebook", () => {
  it("is a named carousel of pages, only the open one reachable", () => {
    const { container } = render(<Notebook entries={SAMPLE_NOTES} />);
    expect(
      screen.getByRole("group", { name: notesCopy.label }),
    ).toHaveAttribute("aria-roledescription", "carousel");
    expect(openPage()).toBe("Note 1 of 3");
    const pages = container.querySelectorAll("article");
    expect(pages).toHaveLength(3);
    expect(pages[0]).not.toHaveAttribute("inert");
    for (const page of [pages[1]!, pages[2]!]) {
      expect(page).toHaveAttribute("inert");
      expect(page).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getByText("3 notes")).toBeInTheDocument();
  });

  it("lists every note in the server HTML, none inert, with no controls", () => {
    const html = renderToString(<Notebook entries={SAMPLE_NOTES} />);
    for (const note of SAMPLE_NOTES) expect(html).toContain(note.initials);
    expect(html).not.toMatch(/\binert\b/);
    expect(html).not.toContain("data-ready");
    expect(html).not.toContain(notesCopy.next);
  });

  it("turns pages with the previous and next buttons, wrapping round", () => {
    render(<Notebook entries={SAMPLE_NOTES} />);
    fireEvent.click(screen.getByRole("button", { name: notesCopy.next }));
    expect(openPage()).toBe("Note 2 of 3");
    fireEvent.click(screen.getByRole("button", { name: notesCopy.previous }));
    fireEvent.click(screen.getByRole("button", { name: notesCopy.previous }));
    expect(openPage()).toBe("Note 3 of 3");
  });

  it("turns on its own after the page's wait, and again after the next one's", () => {
    render(<Notebook entries={SAMPLE_NOTES} />);
    advance(wait(0) - 1);
    expect(openPage()).toBe("Note 1 of 3");
    advance(1);
    expect(openPage()).toBe("Note 2 of 3");
    advance(wait(1));
    expect(openPage()).toBe("Note 3 of 3");
  });

  it("holds while the pointer is over it, and keeps what was left of the wait", () => {
    render(<Notebook entries={SAMPLE_NOTES} />);
    const book = screen.getByRole("group", { name: notesCopy.label });
    advance(3000);
    fireEvent.pointerEnter(book);
    advance(60_000);
    expect(openPage()).toBe("Note 1 of 3");
    fireEvent.pointerLeave(book);
    advance(wait(0) - 3000 - 1);
    expect(openPage()).toBe("Note 1 of 3");
    advance(1);
    expect(openPage()).toBe("Note 2 of 3");
  });

  it("holds while focus is inside", () => {
    render(<Notebook entries={SAMPLE_NOTES} />);
    act(() => screen.getByRole("button", { name: notesCopy.next }).focus());
    advance(60_000);
    expect(openPage()).toBe("Note 1 of 3");
  });

  it("pauses and plays by its button, which names what a press will do", () => {
    render(<Notebook entries={SAMPLE_NOTES} />);
    const pause = screen.getByRole("button", { name: notesCopy.pause });
    expect(pause).not.toHaveAttribute("aria-pressed");
    fireEvent.click(pause);
    // Focus left the button: only the pause holds the notebook now.
    act(() => pause.blur());
    expect(
      screen.getByRole("button", { name: notesCopy.play }),
    ).toBeInTheDocument();
    advance(60_000);
    expect(openPage()).toBe("Note 1 of 3");
    fireEvent.click(screen.getByRole("button", { name: notesCopy.play }));
    act(() => screen.getByRole("button", { name: notesCopy.pause }).blur());
    advance(wait(0));
    expect(openPage()).toBe("Note 2 of 3");
  });

  it("announces a reader's turn, and stays silent while it turns on its own", () => {
    const { container } = render(<Notebook entries={SAMPLE_NOTES} />);
    const live = container.querySelector("[aria-live='polite']")!;
    advance(wait(0));
    expect(openPage()).toBe("Note 2 of 3");
    expect(live).toHaveTextContent("");
    fireEvent.click(screen.getByRole("button", { name: notesCopy.next }));
    expect(live).toHaveTextContent(`Note 3 of 3: ${SAMPLE_NOTES[2]!.name}`);
  });

  it("never turns on its own under reduced motion, and has no pause button", () => {
    stubMotion(true);
    render(<Notebook entries={SAMPLE_NOTES} />);
    advance(60_000);
    expect(openPage()).toBe("Note 1 of 3");
    expect(screen.queryByRole("button", { name: notesCopy.pause })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: notesCopy.next }));
    expect(openPage()).toBe("Note 2 of 3");
  });

  it("renders nothing without entries", () => {
    const { container } = render(<Notebook entries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
