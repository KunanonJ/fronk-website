import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import IntroLoader from "@/components/landing/IntroLoader";
import Hero from "@/components/profile/home/Hero";
import {
  IntroPendingScript,
  useIntroDone,
} from "@/components/profile/home/IntroGate";
import {
  INTRO_SESSION_KEY,
  introExitStartMs,
} from "@/lib/content/introGreetings";
import {
  INTRO_PENDING_SCRIPT,
  introPending,
  markIntroDone,
} from "@/lib/motion/introSignal";
import { withRouter } from "@/tests/routerContext";

/*
 * The intro hand-over (design spec 5.6): the inline script marks a first
 * visit before the hero paints, IntroLoader marks a visit made in the app,
 * IntroLoader marks the end, and the hero's timed motion waits in between.
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

function runScript() {
  // The script is a static string from the source, never page input.
  new Function(INTRO_PENDING_SCRIPT)();
}

function Probe() {
  return <p>{useIntroDone() ? "ready" : "waiting"}</p>;
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.documentElement.removeAttribute("data-intro");
});

describe("the pre-paint script", () => {
  it("marks a first visit with motion allowed as pending", () => {
    stubMotion(false);
    runScript();
    expect(document.documentElement.getAttribute("data-intro")).toBe("pending");
    expect(introPending()).toBe(true);
  });

  it("leaves a returning visit and reduced motion alone, as IntroLoader does", () => {
    stubMotion(false);
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    runScript();
    expect(document.documentElement.hasAttribute("data-intro")).toBe(false);

    sessionStorage.clear();
    stubMotion(true);
    runScript();
    expect(document.documentElement.hasAttribute("data-intro")).toBe(false);
  });

  it("treats blocked storage as unseen, as IntroLoader does", () => {
    stubMotion(false);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    runScript();
    expect(introPending()).toBe(true);
  });

  it("renders only on the server: the client has nothing to hydrate there", () => {
    const { container } = render(withRouter(<IntroPendingScript />));
    expect(container.innerHTML).toBe("");
  });
});

describe("a first visit made in the app", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks the intro pending before the hero can move, so the cursor waits for the intro's end", async () => {
    // Motion allowed, and the canvas wide enough for its tour. No inline
    // script ran: the hero mounts in the client, beside IntroLoader.
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("min-width"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
    const { container } = render(
      withRouter(
        <>
          <IntroLoader />
          <Hero />
        </>,
      ),
    );
    expect(document.documentElement.getAttribute("data-intro")).toBe("pending");
    const cursor = () =>
      container.querySelector(".pf-mock__cursor")?.getAttribute("data-frame");
    // The intro starts on the next frame; its timers count from then.
    act(() => {
      vi.advanceTimersByTime(20);
    });
    // Under the overlay: well past the tour's first stop (0.9 s), no tour.
    act(() => {
      vi.advanceTimersByTime(introExitStartMs() - 100);
    });
    expect(screen.getByTestId("intro-overlay")).toBeInTheDocument();
    expect(cursor()).toBe("0");

    // The intro's exit (one frame after mount, plus its timing) marks the
    // end; the MutationObserver reports on a microtask; the tour starts
    // 0.9 s later.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.documentElement.getAttribute("data-intro")).toBe("done");
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(cursor()).toBe("2");
  });
});

describe("useIntroDone", () => {
  it("is ready at once when no intro is pending", () => {
    render(<Probe />);
    expect(screen.getByText("ready")).toBeInTheDocument();
  });

  it("waits while the intro covers the page, and follows its end", async () => {
    document.documentElement.setAttribute("data-intro", "pending");
    render(<Probe />);
    expect(screen.getByText("waiting")).toBeInTheDocument();

    await act(async () => {
      markIntroDone();
      // The MutationObserver reports on a microtask.
      await Promise.resolve();
    });
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-intro")).toBe("done");
  });
});
