import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollspy } from "@/components/profile/site/scrollspy";

/*
 * The scrollspy hook with a fake observer. The fake delivers entries the way a
 * browser does: each one carries the section's position when it changed, which
 * can be long out of date by the next callback. The hook must not compare those
 * positions; it must report the topmost visible section in page order.
 */

type Callback = (entries: IntersectionObserverEntry[]) => void;

let callback: Callback | undefined;
const observed: Element[] = [];
const disconnect = vi.fn();

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe(el: Element) {
    observed.push(el);
  }
  unobserve() {}
  disconnect() {
    disconnect();
  }
  takeRecords() {
    return [];
  }
}

function entry(
  target: Element,
  isIntersecting: boolean,
  top: number,
): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    boundingClientRect: { top } as DOMRectReadOnly,
  } as unknown as IntersectionObserverEntry;
}

function Spy({
  onSection,
  active = true,
}: {
  onSection: (section: string | undefined) => void;
  active?: boolean;
}) {
  useScrollspy(active, ["work", "about"], onSection);
  return null;
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  document.body.replaceChildren(
    ...["work", "about"].map((id) => {
      const section = document.createElement("section");
      section.id = id;
      return section;
    }),
  );
  callback = undefined;
  observed.length = 0;
  disconnect.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollspy", () => {
  it("reports the topmost visible section in page order, not the one with the smaller stale position", () => {
    const onSection = vi.fn();
    render(<Spy onSection={onSection} />);
    const work = document.getElementById("work")!;
    const about = document.getElementById("about")!;
    expect(observed).toEqual([work, about]);

    // About entered the band first, at 100 px. Work entered later at 300 px, so
    // by position About is the smaller number, but Work is still the topmost.
    act(() => callback!([entry(about, true, 100)]));
    expect(onSection).toHaveBeenLastCalledWith("about");
    act(() => callback!([entry(work, true, 300)]));
    expect(onSection).toHaveBeenLastCalledWith("work");

    act(() => callback!([entry(work, false, 0)]));
    expect(onSection).toHaveBeenLastCalledWith("about");
    act(() => callback!([entry(about, false, 0)]));
    expect(onSection).toHaveBeenLastCalledWith(undefined);
  });

  it("disconnects its observer when it unmounts", () => {
    const onSection = vi.fn();
    const { unmount } = render(<Spy onSection={onSection} />);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("does nothing off Home", () => {
    const onSection = vi.fn();
    render(<Spy onSection={onSection} active={false} />);
    expect(observed).toHaveLength(0);
    expect(onSection).not.toHaveBeenCalled();
  });
});
