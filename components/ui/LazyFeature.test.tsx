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
 * the page stays; a real error in a loaded feature still reaches the
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
}: {
  feature: (props: { name: string }) => ReactNode;
  fallback?: ReactNode;
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
          <FeatureBoundary fallback={fallback}>
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

  it("stays out quietly on later mounts, and asks for nothing more", async () => {
    const load = vi.fn((): Promise<Module> => Promise.reject(missing()));
    render(<Page feature={lazyFeature(load)} />);
    await waitFor(() => expect(logged).toHaveBeenCalled());
    for (let open = 0; open < 2; open += 1) {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
      await act(() => new Promise((done) => setTimeout(done, 0)));
      expect(screen.queryByText(/Hello/)).toBeNull();
      pageStays();
    }
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("a real error in a loaded feature reaches the route's boundary", async () => {
    function Broken({ name }: { name: string }): ReactNode {
      throw new Error(`A bug for ${name}`);
    }
    const Feature = lazyFeature(async () => ({ default: Broken }));
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
