import { afterEach, describe, expect, it, vi } from "vitest";
import { revealInRow } from "@/lib/utils/revealInRow";

/*
 * A sideways row's focused item comes wholly into view, ring and all; the
 * row moves, never the page (UX hunt 2, U12 and U22).
 */

/** A 300 px row from x = 10 with a 1 px border, and an item at `left`. */
function setUp(left: number, width = 100, padding = "8px") {
  const row = document.createElement("div");
  const item = document.createElement("button");
  row.append(item);
  document.body.append(row);
  row.style.scrollPaddingInline = padding;
  Object.defineProperty(row, "clientLeft", { value: 1 });
  Object.defineProperty(row, "clientWidth", { value: 300 });
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
    left: 10,
    width: 302,
  } as DOMRect);
  vi.spyOn(item, "getBoundingClientRect").mockReturnValue({
    left,
    right: left + width,
    width,
  } as DOMRect);
  const scrollBy = vi.fn();
  row.scrollBy = scrollBy;
  const pageScroll = vi.spyOn(window, "scrollBy").mockImplementation(() => {});
  return { row, item, scrollBy, pageScroll };
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("revealInRow", () => {
  it("leaves an item wholly inside, clear of the scroll padding", () => {
    const { row, item, scrollBy } = setUp(19);
    revealInRow(row, item);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("moves the row just far enough to clear the nearer edge by its scroll padding", () => {
    // The scrollport runs from 11 to 311: the item, at 280 to 380, is 69 px
    // past its end, and 8 px more leaves room for the ring.
    const end = setUp(280);
    revealInRow(end.row, end.item);
    expect(end.scrollBy).toHaveBeenCalledWith({ left: 77, behavior: "auto" });
    expect(end.pageScroll).not.toHaveBeenCalled();
    document.body.replaceChildren();
    vi.restoreAllMocks();
    // At -40 to 60, it is 51 px before the start, and 8 px more.
    const start = setUp(-40);
    revealInRow(start.row, start.item);
    expect(start.scrollBy).toHaveBeenCalledWith({
      left: -59,
      behavior: "auto",
    });
  });

  it("brings it to the middle when asked, as the pager does", () => {
    const { row, item, scrollBy } = setUp(280, 100, "0px");
    revealInRow(row, item, { centre: true, behavior: "smooth" });
    // The item's middle (330) to the scrollport's (161).
    expect(scrollBy).toHaveBeenCalledWith({ left: 169, behavior: "smooth" });
  });
});
