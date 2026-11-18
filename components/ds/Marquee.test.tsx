import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Marquee } from "@/components/ds/Marquee";

/*
 * The marquee may only move while its pause control exists (WCAG 2.2.2):
 * never in the server HTML, never under reduced motion.
 */

const NAMES = ["Alpha", "Beta"] as const;

function marquee() {
  return (
    <Marquee
      label="Sample wordmarks"
      items={NAMES}
      getKey={(name) => name}
      renderItem={(name) => name}
    />
  );
}

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Marquee", () => {
  it("stays still in the server HTML, which has no pause control", () => {
    const html = renderToString(marquee());
    expect(html).not.toContain("data-running");
    expect(html).not.toContain("Pause motion");
    expect(html).toContain('aria-label="Sample wordmarks"');
  });

  it("runs after hydration and pauses from its toggle", () => {
    stubMotion(false);
    const { container } = render(marquee());
    const box = container.querySelector(".ds-marquee");
    expect(box).toHaveAttribute("data-running");
    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
    expect(box).toHaveClass("ds-marquee--paused");
    expect(screen.getByRole("button", { name: "Play motion" })).toBeVisible();
  });

  it("never runs under reduced motion", () => {
    stubMotion(true);
    const { container } = render(marquee());
    expect(container.querySelector(".ds-marquee")).not.toHaveAttribute(
      "data-running",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("follows a parent that owns the play state, and reports its toggle to it", () => {
    stubMotion(false);
    const onPlayingChange = vi.fn();
    const props = {
      label: "Sample wordmarks",
      items: NAMES,
      getKey: (name: string) => name,
      renderItem: (name: string) => name,
      onPlayingChange,
    };
    const { container, rerender } = render(
      <Marquee {...props} playing={false} />,
    );
    const box = container.querySelector(".ds-marquee");
    expect(box).toHaveClass("ds-marquee--paused");

    fireEvent.click(screen.getByRole("button", { name: "Play motion" }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // The parent decides: until it passes the new state, nothing changes.
    expect(box).toHaveClass("ds-marquee--paused");

    rerender(<Marquee {...props} playing />);
    expect(box).not.toHaveClass("ds-marquee--paused");
    expect(screen.getByRole("button", { name: "Pause motion" })).toBeVisible();
  });

  it("names one list and hides the copy from assistive technology", () => {
    stubMotion(false);
    render(marquee());
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(
      screen.getByRole("list", { name: "Sample wordmarks" }),
    ).toBeVisible();
  });
});
