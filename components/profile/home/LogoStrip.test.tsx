import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoStrip } from "@/components/profile/home/LogoStrip";
import { logoStrip } from "@/lib/content/home";

/*
 * The logo strip (design spec 8.3, 12 item 15): one labelled list of
 * wordmarks, its moving copy hidden, and a toggle that reports to the hero.
 */

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LogoStrip", () => {
  it("labels one list of every wordmark with its eyebrow", () => {
    render(<LogoStrip playing onPlayingChange={() => {}} />);
    expect(screen.getByText("Where I’ve worked")).toHaveClass("t-meta");
    const list = screen.getByRole("list", { name: "Where I’ve worked" });
    expect(
      [...list.querySelectorAll("li")].map((item) => item.textContent),
    ).toEqual([...logoStrip.names]);
    expect(screen.getAllByRole("list")).toHaveLength(1);
  });

  it("hands its toggle to the hero, which owns the play state", () => {
    const onPlayingChange = vi.fn();
    render(<LogoStrip playing onPlayingChange={onPlayingChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
    expect(onPlayingChange).toHaveBeenCalledWith(false);
  });
});
