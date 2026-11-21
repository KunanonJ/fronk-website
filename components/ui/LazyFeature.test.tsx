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
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";

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

let logged: MockInstance<typeof console.error>;

beforeEach(() => {
  // React logs each error a boundary catches; the tests read the page.
  logged = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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
    const link = (rel: string, href: string) => {
      const element = document.createElement("link");
      element.rel = rel;
      element.href = href;
      document.head.append(element);
      element.dispatchEvent(new Event("error"));
      return element;
    };
    link("modulepreload", "/assets/Hello-x1.js");
    const sheet = link("stylesheet", "/assets/Hello-x1.css");
    link("stylesheet", "https://elsewhere.example/assets/font.css");
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => ({ default: Hello }));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    expect(fetched).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
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

  it("leaves React's precedence stylesheets to React when it asks again", async () => {
    const fetched = vi.fn(async () => new Response(""));
    vi.stubGlobal("fetch", fetched);
    // A feature's own stylesheet, as React links it (`precedence`).
    const own = document.createElement("link");
    own.rel = "stylesheet";
    own.href = "/assets/Search-x1.css";
    own.setAttribute("data-precedence", "pf-search");
    document.head.append(own);
    own.dispatchEvent(new Event("error"));
    const load = vi
      .fn((): Promise<Module> => Promise.reject(missing()))
      .mockImplementationOnce(() => Promise.reject(missing()))
      .mockImplementationOnce(async () => ({ default: Hello }));
    const failed = vi.fn();
    render(<Page feature={lazyFeature(load)} onFail={failed} />);
    await waitFor(() => expect(failed).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(await screen.findByText("Hello Ada")).toBeInTheDocument();
    // Asked for past the caches, but the same element stays where it was.
    expect(fetched).toHaveBeenCalledWith(
      `${location.origin}/assets/Search-x1.css`,
      { cache: "reload" },
    );
    expect(own.isConnected).toBe(true);
    expect(
      document.head.querySelectorAll('link[href$="/assets/Search-x1.css"]'),
    ).toHaveLength(1);
    own.remove();
    pageStays();
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
