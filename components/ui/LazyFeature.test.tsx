import { Component, useState, type ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import {
  FeatureBoundary,
  lazyFeature,
  retryFailedSheets,
} from "@/components/ui/LazyFeature";

/*
 * A feature loaded on first use whose code fails to load is left out and
 * the page stays, and its next mount asks for the code again; a real error
 * in a loaded feature, or in a module as it initialises, still reaches the
 * route's error boundary.
 */

function Hello({ name }: { name: string }) {
  return <p>Hello {name}</p>;
}

type Module = { default: typeof Hello };

/** A missing chunk, as Chromium words it. */
const missing = () =>
  new TypeError(
    "Failed to fetch dynamically imported module: /assets/Hello-x1.js",
  );

/** Vite's preload helper, when the feature's stylesheet fails to load. */
const cssMissing = () =>
  new Error("Unable to preload CSS for /assets/Hello-x1.css");

/** Lets a test settle the load when it chooses. */
function deferred() {
  let settle!: { resolve: (m: Module) => void; reject: (e: Error) => void };
  const promise = new Promise<Module>((resolve, reject) => {
    settle = { resolve, reject };
  });
  return { promise, ...settle };
}

/** Stands in for the route's error boundary (RouteError). */
class RouteBoundary extends Component<
  { children: ReactNode },
  { error: unknown }
> {
  override state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  override render() {
    return this.state.error ? (
      <h1>Something went wrong</h1>
    ) : (
      this.props.children
    );
  }
}

/** A page with a trigger that mounts and unmounts the feature. */
function Page({
  feature: Feature,
  fallback,
  onFail,
}: {
  feature: (props: { name: string }) => ReactNode;
  fallback?: ReactNode;
  onFail?: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <RouteBoundary>
      <main>
        <h1>The page</h1>
        <button type="button" onClick={() => setOpen((was) => !was)}>
          toggle
        </button>
        {open ? (
          <FeatureBoundary fallback={fallback} onFail={onFail}>
            <Feature name="Ada" />
          </FeatureBoundary>
        ) : null}
      </main>
    </RouteBoundary>
  );
}

const pageStays = () => {
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "The page",
  );
  expect(screen.queryByText("Something went wrong")).toBeNull();
};

/** Closes the feature and mounts it again. */
const toggle = () => {
  fireEvent.click(screen.getByRole("button", { name: "toggle" }));
  fireEvent.click(screen.getByRole("button", { name: "toggle" }));
};

/** A <link> in <head> whose file fails to load. */
const failLink = (rel: string, href: string) => {
  const element = document.createElement("link");
  element.rel = rel;
  element.href = href;
  document.head.append(element);
  element.dispatchEvent(new Event("error"));
  return element;
};

let logged: MockInstance<typeof console.error>;

beforeEach(() => {
  // React logs each error a boundary catches; the tests read the page.
  logged = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * Fakes the timers LazyFeature sets (its 3 s wait) and no others: React
 * keeps the setTimeout it found as it loaded, so its own timers stay real.
 */
const fakeTheWait = () =>
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

/** Moves the faked clock on by `ms`, and lets React act on what settled. */
const pass = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

/** A request that never answers: a stalled network. */
const stalled = () => new Promise<Response>(() => undefined);

describe("lazyFeature in a FeatureBoundary", () => {
  it("shows the fallback while the code loads, then the feature", async () => {
    const load = deferred();
    render(
      <Page
        feature={lazyFeature(() => load.promise)}
        fallback={<p>Loading</p>}
      />,
    );
    expect(screen.getByText("Loading")).toBeInTheDocument();
    await act(async () => load.resolve({ default: Hello }));
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    expect(screen.queryByText("Loading")).toBeNull();
    pageStays();
  });

  it("code that fails to load: the feature is left out and the page stays", async () => {
    const load = deferred();
    render(<Page feature={lazyFeature(() => load.promise)} />);
    await act(async () => load.reject(missing()));
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(screen.queryByText(/Hello/)).toBeNull();
    pageStays();
  });

  it("keeps the fallback in the feature's place when its code never loads", async () => {
    const load = deferred();
    render(
      <Page
        feature={lazyFeature(() => load.promise)}
        fallback={<p>The still drawing</p>}
      />,
    );
    await act(async () => load.reject(missing()));
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(screen.getByText("The still drawing")).toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).toBeNull();
    pageStays();
  });

  it("a stylesheet that fails to preload is a failed load too", async () => {
    const load = deferred();
    render(<Page feature={lazyFeature(() => load.promise)} />);
    await act(async () => load.reject(cssMissing()));
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(screen.queryByText(/Hello/)).toBeNull();
    pageStays();
  });

  it("an import that resolves empty is a failed load, and quiet", async () => {
    // Vite's preload helper resolves undefined once a vite:preloadError
    // listener cancels the event (src/lib/staleChunk.ts, while a
    // navigation loads).
    const load = vi.fn(async () => undefined as unknown as Module);
    const failed = vi.fn();
    render(
      <Page
        feature={lazyFeature(load)}
        fallback={<p>The still</p>}
        onFail={failed}
      />,
    );
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(screen.getByText("The still")).toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).toBeNull();
    pageStays();
    expect(logged).not.toHaveBeenCalled();
  });

  it("a later mount asks for the code again, and shows it once it loads", async () => {
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => undefined as unknown as Module)
      .mockImplementationOnce(async () => ({ default: Hello }));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(load).toHaveBeenCalledTimes(1);
    // Again: an empty import, then the code.
    for (const tries of [2, 3]) {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      await waitFor(() => expect(load).toHaveBeenCalledTimes(tries));
      pageStays();
      if (tries === 2) {
        await waitFor(() => expect(failed).toHaveBeenCalledTimes(2));
      }
    }
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    expect(failed).toHaveBeenCalledTimes(2);
    pageStays();
  });

  it("a chunk that keeps failing is asked for once per mount", async () => {
    const load = vi.fn((): Promise<Module> => Promise.reject(missing()));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(load).toHaveBeenCalledTimes(1);
    for (let open = 2; open <= 3; open += 1) {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      await waitFor(() => expect(failed).toHaveBeenCalledTimes(open));
      expect(screen.queryByText(/Hello/)).toBeNull();
      pageStays();
      expect(load).toHaveBeenCalledTimes(open);
    }
  });

  it("asks again for the files whose links failed, past the caches, before the code", async () => {
    // WebKit gives a failed file's answer to the next import without asking
    // the server; Vite's preload helper links each stylesheet once.
    const fetched = vi.fn(async () => new Response(""));
    vi.stubGlobal("fetch", fetched);
    failLink("modulepreload", "/assets/Hello-x1.js");
    const sheet = failLink("stylesheet", "/assets/Hello-x1.css");
    failLink("stylesheet", "https://elsewhere.example/assets/font.css");
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => ({ default: Hello }));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(fetched).not.toHaveBeenCalled();

    toggle();
    await waitFor(() => expect(fetched).toHaveBeenCalledTimes(2));
    expect(fetched.mock.calls).toEqual([
      [`${location.origin}/assets/Hello-x1.js`, { cache: "reload" }],
      [`${location.origin}/assets/Hello-x1.css`, { cache: "reload" }],
    ]);
    // The stylesheet is linked anew, and the code asked for once it loads.
    const fresh = await waitFor(() => {
      const found = document.head.querySelector<HTMLLinkElement>(
        'link[rel="stylesheet"][href$="/assets/Hello-x1.css"]',
      );
      expect(found).not.toBeNull();
      expect(found).not.toBe(sheet);
      return found!;
    });
    expect(sheet.isConnected).toBe(false);
    expect(load).toHaveBeenCalledTimes(1);
    act(() => {
      fresh.dispatchEvent(new Event("load"));
    });
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    pageStays();
  });

  it("waits 3 s at most for those files: a request that stalls goes on without it", async () => {
    vi.stubGlobal("fetch", vi.fn(stalled));
    failLink("modulepreload", "/assets/Hello-x2.js");
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => ({ default: Hello }));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));

    fakeTheWait();
    toggle();
    expect(fetch).toHaveBeenCalledOnce();
    await pass(2999);
    expect(load).toHaveBeenCalledTimes(1);
    await pass(1);
    vi.useRealTimers();
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    pageStays();
  });

  it("tells onFail, so what opened it can open it again", async () => {
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => ({ default: Hello }));
    const Feature = lazyFeature(load);
    const failed = vi.fn();
    /** As SearchTrigger holds the search dialog. */
    function Opener() {
      const [open, setOpen] = useState(false);
      return (
        <RouteBoundary>
          <h1>The page</h1>
          <button type="button" onClick={() => setOpen(true)}>
            open
          </button>
          {open ? (
            <FeatureBoundary
              onFail={() => {
                failed();
                setOpen(false);
              }}
            >
              <Feature name="Ada" />
            </FeatureBoundary>
          ) : null}
        </RouteBoundary>
      );
    }
    render(<Opener />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Hello/)).toBeNull();
    pageStays();
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(failed).toHaveBeenCalledTimes(1);
    pageStays();
  });

  it("tells onFail once, however often the page re-renders while it fails", async () => {
    const Feature = lazyFeature((): Promise<Module> =>
      Promise.reject(missing()),
    );
    const failed = vi.fn();
    /** A parent that re-renders, and hands a new onFail every time. */
    function Busy() {
      const [count, setCount] = useState(0);
      return (
        <RouteBoundary>
          <h1>The page</h1>
          <button type="button" onClick={() => setCount(count + 1)}>
            render {count}
          </button>
          <FeatureBoundary onFail={() => failed()}>
            <Feature name="Ada" />
          </FeatureBoundary>
        </RouteBoundary>
      );
    }
    render(<Busy />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    for (let i = 0; i < 3; i += 1)
      fireEvent.click(screen.getByRole("button", { name: /render/ }));
    await act(async () => new Promise((done) => setTimeout(done, 20)));
    expect(failed).toHaveBeenCalledTimes(1);
    pageStays();
  });

  describe("a feature's own stylesheet (React's `precedence`) that fails", () => {
    /** A feature that links its own stylesheet, as the site's do. */
    const styled = (href: string) =>
      lazyFeature(async () => ({
        default: ({ name }: { name: string }) => (
          <>
            <link rel="stylesheet" href={href} precedence="pf-styled" />
            <p>Styled {name}</p>
          </>
        ),
      }));

    /** The stylesheet links with this href, in document order. */
    const sheets = (href: string) => [
      ...document.head.querySelectorAll<HTMLLinkElement>(
        `link[rel="stylesheet"][href="${href}"]`,
      ),
    ];

    /**
     * Mounts the feature and fails the stylesheet React links for it (its
     * preload is let through: React holds the feature until it settles).
     * Returns React's element, once the feature shows without it.
     */
    async function mountFailing(
      href: string,
      Feature: ReturnType<typeof styled>,
    ) {
      const page = render(<Page feature={Feature} />);
      const own = await waitFor(() => {
        for (const preload of document.head.querySelectorAll(
          `link[rel="preload"][href="${href}"]`,
        ))
          preload.dispatchEvent(new Event("load"));
        const [found] = sheets(href);
        expect(found).toBeDefined();
        return found!;
      });
      // React keeps a promise on its element (react-dom's acquireResource)
      // that rejects with the error, and nothing waits on it here; a browser
      // reports it as uncaught. The run would fail on it.
      (own as { _p?: Promise<unknown> })._p?.catch(() => undefined);
      act(() => {
        own.dispatchEvent(new Event("error"));
      });
      expect(await screen.findByText("Styled Ada")).toBeInTheDocument();
      return { own, page };
    }

    it("its next mount asks for it past the caches, links it anew beside React's own, and shows the feature once it loads", async () => {
      const href = "/assets/Own-x1.css";
      const fetched = vi.fn(async () => new Response(""));
      vi.stubGlobal("fetch", fetched);
      const { own } = await mountFailing(href, styled(href));
      expect(fetched).not.toHaveBeenCalled();

      toggle();
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      expect(fetched).toHaveBeenCalledExactlyOnceWith(
        `${location.origin}${href}`,
        { cache: "reload" },
      );
      // React's element stays; the fresh one follows it, in its place in
      // the cascade, and the feature waits for it.
      const [first, fresh] = sheets(href);
      expect(first).toBe(own);
      expect(own.nextElementSibling).toBe(fresh);
      expect(fresh!.dataset.precedence).toBe("pf-styled");
      expect(screen.queryByText(/Styled/)).toBeNull();
      act(() => {
        fresh!.dispatchEvent(new Event("load"));
      });
      expect(await screen.findByText("Styled Ada")).toBeInTheDocument();

      // React neither removes the fresh link nor links its own again, as
      // the feature unmounts and mounts; nothing more is asked for.
      toggle();
      expect(await screen.findByText("Styled Ada")).toBeInTheDocument();
      expect(sheets(href)).toEqual([own, fresh]);
      expect(fetched).toHaveBeenCalledTimes(1);
      pageStays();
    });

    it("a request that stalls is waited for 3 s at most: the feature shows, and the fresh link goes in once it answers", async () => {
      const href = "/assets/Own-x4.css";
      let answer!: (response: Response) => void;
      const fetched = vi.fn(
        () =>
          new Promise<Response>((done) => {
            answer = done;
          }),
      );
      vi.stubGlobal("fetch", fetched);
      const { own } = await mountFailing(href, styled(href));

      fakeTheWait();
      toggle();
      expect(fetched).toHaveBeenCalledOnce();
      await pass(2999);
      expect(screen.queryByText(/Styled/)).toBeNull();
      await pass(1);
      vi.useRealTimers();
      expect(await screen.findByText("Styled Ada")).toBeInTheDocument();
      expect(sheets(href)).toEqual([own]);

      // The request answers late: the fresh link goes in then, beside
      // React's own, and nothing more is asked for.
      await act(async () => answer(new Response("")));
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      expect(sheets(href)[0]).toBe(own);
      expect(fetched).toHaveBeenCalledOnce();
      pageStays();
    });

    it("one that keeps failing is asked for once per mount, never on a re-render, linked anew in one place, and not waited for once its fresh link failed", async () => {
      const href = "/assets/Own-x2.css";
      const fetched = vi.fn(async () => new Response(""));
      vi.stubGlobal("fetch", fetched);
      const Feature = styled(href);
      const { own, page } = await mountFailing(href, Feature);

      toggle();
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      const [, fresh] = sheets(href);
      act(() => {
        fresh!.dispatchEvent(new Event("error"));
      });
      // It failed again: the feature shows without it, and stays so.
      expect(await screen.findByText("Styled Ada")).toBeInTheDocument();
      page.rerender(<Page feature={Feature} />);
      await act(() => new Promise((done) => setTimeout(done, 20)));
      expect(fetched).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();

      // The next mount asks once more, and no longer waits for it (a tab
      // left open across the deploy that took the file away): the feature
      // shows at once. Its link takes the failed one's place: React's, and
      // one of ours.
      toggle();
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();
      await waitFor(() => expect(fetched).toHaveBeenCalledTimes(2));
      const again = await waitFor(() => {
        const found = sheets(href);
        expect(found).toHaveLength(2);
        expect(found[1]).not.toBe(fresh);
        return found;
      });
      expect(again[0]).toBe(own);
      expect(fresh!.isConnected).toBe(false);
      act(() => {
        again[1]!.dispatchEvent(new Event("load"));
      });
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();
      pageStays();
    });

    it("any feature's mount asks for it: one that stays mounted gets its styles too", async () => {
      const href = "/assets/Own-x3.css";
      const fetched = vi.fn(async () => new Response(""));
      vi.stubGlobal("fetch", fetched);
      await mountFailing(href, styled(href));
      // Another feature (the search dialog, a preview card) mounts.
      const Other = lazyFeature(async () => ({ default: Hello }));
      render(
        <FeatureBoundary>
          <Other name="Grace" />
        </FeatureBoundary>,
      );
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      expect(fetched).toHaveBeenCalledExactlyOnceWith(
        `${location.origin}${href}`,
        { cache: "reload" },
      );
      act(() => {
        sheets(href)[1]!.dispatchEvent(new Event("load"));
      });
      expect(await screen.findByText("Hello Grace")).toBeInTheDocument();
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();
    });

    /*
     * A feature that stays mounted from page to page (the footer's living
     * status) has no next mount of its own: what holds it calls
     * retryFailedSheets on each navigation (UX hunt 22-11-26, U27).
     */
    it("retryFailedSheets asks for it as a mount does, and holds nothing: the feature stays and takes its styles", async () => {
      const href = "/assets/Own-x5.css";
      const fetched = vi.fn(async () => new Response(""));
      vi.stubGlobal("fetch", fetched);
      const { own } = await mountFailing(href, styled(href));

      act(() => retryFailedSheets());
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      expect(fetched).toHaveBeenCalledExactlyOnceWith(
        `${location.origin}${href}`,
        { cache: "reload" },
      );
      const [first, fresh] = sheets(href);
      expect(first).toBe(own);
      expect(own.nextElementSibling).toBe(fresh);
      expect(fresh!.dataset.precedence).toBe("pf-styled");
      // Nothing waits for it: the feature stays shown.
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();
      act(() => {
        fresh!.dispatchEvent(new Event("load"));
      });

      // Nothing has failed since: the next call asks for nothing.
      act(() => retryFailedSheets());
      await act(() => new Promise((done) => setTimeout(done, 20)));
      expect(fetched).toHaveBeenCalledTimes(1);
      expect(sheets(href)).toEqual([own, fresh]);
      pageStays();
    });

    it("retryFailedSheets: one that keeps failing is asked for once per call, never by itself, linked anew in one place", async () => {
      const href = "/assets/Own-x6.css";
      const fetched = vi.fn(async () => new Response(""));
      vi.stubGlobal("fetch", fetched);
      const { own } = await mountFailing(href, styled(href));

      act(() => retryFailedSheets());
      await waitFor(() => expect(sheets(href)).toHaveLength(2));
      const [, fresh] = sheets(href);
      act(() => {
        fresh!.dispatchEvent(new Event("error"));
      });
      // It failed again: nothing asks for it until the next call.
      await act(() => new Promise((done) => setTimeout(done, 20)));
      expect(fetched).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Styled Ada")).toBeInTheDocument();

      act(() => retryFailedSheets());
      await waitFor(() => expect(fetched).toHaveBeenCalledTimes(2));
      const again = await waitFor(() => {
        const found = sheets(href);
        expect(found).toHaveLength(2);
        expect(found[1]).not.toBe(fresh);
        return found;
      });
      expect(again[0]).toBe(own);
      expect(fresh!.isConnected).toBe(false);
      act(() => {
        again[1]!.dispatchEvent(new Event("load"));
      });
      pageStays();
    });
  });

  it("a real error in a loaded feature reaches the route's boundary", async () => {
    function Broken({ name }: { name: string }): ReactNode {
      throw new Error(`A bug for ${name}`);
    }
    const Feature = lazyFeature(async () => ({ default: Broken }));
    render(<Page feature={Feature} />);
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("so does an error a module throws as it initialises", async () => {
    const Feature = lazyFeature((): Promise<Module> =>
      Promise.reject(new ReferenceError("hello is not defined")),
    );
    render(<Page feature={Feature} />);
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("so does an error that only looks like a failed load", () => {
    function LookAlike(): ReactNode {
      throw missing();
    }
    render(<Page feature={LookAlike} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("lazyFeature's preload", () => {
  it("asks for the code ahead of use, and a failure stays quiet", async () => {
    const load = vi.fn((): Promise<Module> => Promise.reject(missing()));
    lazyFeature(load).preload();
    expect(load).toHaveBeenCalledTimes(1);
    // An unhandled rejection here would fail the run.
    await act(() => new Promise((done) => setTimeout(done, 0)));
  });
});
