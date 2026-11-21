import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DaysAgo } from "@/components/ds/DaysAgo";

/*
 * "Updated" on the open-source cards: the date from the server (no relative
 * time in cached HTML), the visitor's words in the browser, with the date as
 * the title.
 */
afterEach(() => {
  vi.useRealTimers();
});

const COMMIT = "2026-11-16T21:37:52Z";

describe("DaysAgo", () => {
  it("draws the date on the server", () => {
    expect(renderToString(<DaysAgo iso={COMMIT} />)).toBe(
      '<time dateTime="2026-11-16">16 Nov 2026</time>',
    );
  });

  it("says how long ago in the browser, with the date as its title", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-21T09:00:00Z"));
    const { container } = render(<DaysAgo iso={COMMIT} />);
    const time = container.querySelector("time")!;
    expect(time).toHaveTextContent("5 days ago");
    expect(time).toHaveAttribute("title", "16 Nov 2026");
    expect(time).toHaveAttribute("datetime", "2026-11-16");
  });

  it("adds a note to the title, and only once the words show", () => {
    const note = "GitHub as of 21 Nov 2026";
    expect(renderToString(<DaysAgo iso={COMMIT} note={note} />)).toBe(
      '<time dateTime="2026-11-16">16 Nov 2026</time>',
    );
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-21T09:00:00Z"));
    const { container } = render(<DaysAgo iso={COMMIT} note={note} />);
    expect(container.querySelector("time")).toHaveAttribute(
      "title",
      "16 Nov 2026 (GitHub as of 21 Nov 2026)",
    );
  });

  it("keeps the date, untitled, when the visitor's clock is behind it", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-09T03:30:00Z"));
    const { container } = render(<DaysAgo iso={COMMIT} />);
    const time = container.querySelector("time")!;
    expect(time).toHaveTextContent("16 Nov 2026");
    expect(time).not.toHaveAttribute("title");
  });
});
