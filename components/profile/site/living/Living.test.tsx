import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Living from "@/components/profile/site/living/Living";

/*
 * The footer's living status (now-building-and-genz Phase 5): the guess for
 * the hour it is handed, and the ship log, asked for only once the footer's
 * card is near the screen, and absent when it cannot be read.
 */

const SHA = "0123456789abcdef0123456789abcdef01234567";
const SHIPPED = {
  subject: "feat(hero): the Layers panel selects its frame (#157)",
  date: "2026-11-20T09:00:00.000Z",
  url: `https://github.com/KunanonJ/fronk-website/commit/${SHA}`,
};

/** A stand-in IntersectionObserver the test drives by hand. */
class Observer {
  static all: Observer[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    Observer.all.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  /** Says whether the card is in view. */
  fire(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function card() {
  const el = document.createElement("div");
  el.className = "pf-footer__card";
  document.body.append(el);
  return el;
}

beforeEach(() => {
  Observer.all = [];
  vi.stubGlobal("IntersectionObserver", Observer);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("Living, the hour's guess", () => {
  it("draws the guess for the hour it is handed, and asks for nothing", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container, rerender } = render(<Living hour={10} />);
    expect(container.querySelector(".pf-footer__guess")).toHaveTextContent(
      "probably shipping",
    );
    rerender(<Living hour={23} />);
    expect(container.querySelector(".pf-footer__guess")).toHaveTextContent(
      "probably asleep",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(Observer.all).toHaveLength(0);
  });
});

describe("Living, the ship log", () => {
  it("asks only once the footer's card is near, then shows the commit", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-20T12:30:00Z"));
    const fetchMock = vi.fn().mockResolvedValue(Response.json(SHIPPED));
    vi.stubGlobal("fetch", fetchMock);
    const target = card();
    const { container } = render(<Living />);

    const [observer] = Observer.all;
    expect(observer?.observed).toEqual([target]);
    expect(observer?.options?.rootMargin).toMatch(/%|px/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();

    // Not yet in view: still nothing.
    act(() => observer!.fire(false));
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => observer!.fire(true));
    expect(observer!.disconnected).toBe(true);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/github/shipped");

    const log = await screen.findByText(/^Shipped/, {
      selector: ".pf-footer__shipped > span",
    });
    expect(log.textContent).toMatch(
      /^Shipped 3\s?h.* ago: feat\(hero\): the Layers panel selects its frame \(#157\)/,
    );
    expect(log.querySelector("time")).toHaveAttribute("datetime", SHIPPED.date);
    const link = screen.getByRole("link", {
      name: /^feat\(hero\): the Layers panel .*opens in a new tab/,
    });
    expect(link).toHaveAttribute("href", SHIPPED.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("shows nothing when the endpoint fails or answers something else", async () => {
    for (const respond of [
      () => Promise.resolve(Response.json(null, { status: 503 })),
      // A 503 that carries the commit still shows nothing.
      () => Promise.resolve(Response.json(SHIPPED, { status: 503 })),
      () =>
        Promise.resolve(
          new Response("<html>Bad gateway</html>", { status: 502 }),
        ),
      () =>
        Promise.resolve(
          Response.json({ ...SHIPPED, url: "https://evil.test" }),
        ),
      () => Promise.reject(new Error("offline")),
    ]) {
      Observer.all = [];
      const fetchMock = vi.fn().mockImplementation(respond);
      vi.stubGlobal("fetch", fetchMock);
      card();
      const { container, unmount } = render(<Living />);
      await act(async () => Observer.all[0]!.fire(true));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it("reads a failed answer's body, so the request ends and the page can go idle", async () => {
    const failed = Response.json(null, { status: 503 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(failed));
    card();
    render(<Living />);
    await act(async () => Observer.all[0]!.fire(true));
    expect(failed.bodyUsed).toBe(true);
  });

  it("stops watching when it goes", () => {
    card();
    const { unmount } = render(<Living />);
    unmount();
    expect(Observer.all[0]!.disconnected).toBe(true);
  });
});
