import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatBangkokTime } from "@/components/bento/BangkokClock";
import PlaceCard from "@/components/bento/PlaceCard";
import { read } from "@/lib/design/sourceScan";

describe("formatBangkokTime", () => {
  it("formats GMT+7 as h:mm AM/PM", () => {
    expect(formatBangkokTime(Date.UTC(2026, 10, 9, 3, 30))).toBe("10:30 AM");
    expect(formatBangkokTime(Date.UTC(2026, 10, 9, 17, 5))).toBe("12:05 AM");
  });
});

describe("PlaceCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "setInterval"] });
    vi.setSystemTime(new Date(Date.UTC(2026, 10, 9, 3, 30, 10)));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads 'Based in Bangkok' and hides the art", () => {
    const { container } = render(<PlaceCard />);
    expect(
      screen.getByRole("article", { name: "Based in Bangkok" }),
    ).toBeInTheDocument();
    for (const art of container.querySelectorAll(
      ".kj-place-art, .kj-place-blur, .kj-place-scrim",
    ))
      expect(art).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Say hello" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("shows the Bangkok time and ticks on the minute", () => {
    render(<PlaceCard />);
    expect(screen.getByText("10:30 AM")).toBeInTheDocument();
    expect(screen.getByText("Local time in Bangkok:")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(50_000);
    });
    expect(screen.getByText("10:31 AM")).toBeInTheDocument();
  });

  it("draws the temple once and repeats it with <use>", () => {
    const { container } = render(<PlaceCard />);
    expect(container.querySelectorAll("#kjp-temple")).toHaveLength(1);
    expect(container.querySelectorAll('use[href="#kjp-temple"]')).toHaveLength(
      5,
    );
    expect(read("components/bento/BangkokScene.tsx")).not.toMatch(
      /#[0-9a-fA-F]{6}\b/,
    );
  });
});
