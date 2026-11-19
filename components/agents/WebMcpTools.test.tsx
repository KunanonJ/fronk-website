import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebMcpTools } from "@/components/agents/WebMcpTools";

const navigate = vi.fn(async () => {});
const setTheme = vi.fn();
vi.mock("@tanstack/react-router", () => ({ useRouter: () => ({ navigate }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme }) }));

type Registered = {
  tool: { name: string; execute: (input?: object) => Promise<unknown> };
  signal?: AbortSignal;
};

function fakeContext(on: "document" | "navigator") {
  const registered: Registered[] = [];
  const context = {
    registerTool: vi.fn(
      async (tool: Registered["tool"], options?: { signal?: AbortSignal }) => {
        registered.push({ tool, signal: options?.signal });
      },
    ),
  };
  Object.defineProperty(
    on === "document" ? document : navigator,
    "modelContext",
    {
      value: context,
      configurable: true,
    },
  );
  return registered;
}

afterEach(() => {
  for (const target of [document, navigator]) {
    delete (target as unknown as { modelContext?: unknown }).modelContext;
  }
  vi.clearAllMocks();
});

describe("WebMcpTools", () => {
  it("registers the site's tools where the browser offers document.modelContext", async () => {
    const registered = fakeContext("document");
    render(<WebMcpTools />);
    await waitFor(() => expect(registered).toHaveLength(8));
    expect(registered.map((r) => r.tool.name)).toContain("get_site_overview");
  });

  it("also takes Chrome's earlier navigator.modelContext", async () => {
    const registered = fakeContext("navigator");
    render(<WebMcpTools />);
    await waitFor(() => expect(registered).toHaveLength(8));
  });

  it("does nothing where WebMCP is missing", () => {
    expect(() => render(<WebMcpTools />)).not.toThrow();
  });

  it("registers nothing when it unmounts before the tools load", async () => {
    const registered = fakeContext("document");
    const { unmount } = render(<WebMcpTools />);
    unmount();
    await new Promise((done) => setTimeout(done, 50));
    expect(registered).toHaveLength(0);
  });

  it("unregisters every tool when it unmounts", async () => {
    const registered = fakeContext("document");
    const { unmount } = render(<WebMcpTools />);
    await waitFor(() => expect(registered).toHaveLength(8));
    expect(registered.every((r) => r.signal && !r.signal.aborted)).toBe(true);
    unmount();
    expect(registered.every((r) => r.signal?.aborted)).toBe(true);
  });

  it("turns a failing tool into an error result instead of throwing", async () => {
    const registered = fakeContext("document");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 503 })),
    );
    render(<WebMcpTools />);
    await waitFor(() => expect(registered).toHaveLength(8));
    const overview = registered.find(
      (r) => r.tool.name === "get_site_overview",
    )!;
    await expect(overview.tool.execute()).resolves.toMatchObject({
      isError: true,
    });
    vi.unstubAllGlobals();
  });

  it("opens pages through the router", async () => {
    const registered = fakeContext("document");
    render(<WebMcpTools />);
    await waitFor(() => expect(registered).toHaveLength(8));
    const open = registered.find((r) => r.tool.name === "open_page")!;
    await open.tool.execute({ path: "/about" });
    expect(navigate).toHaveBeenCalledWith({ href: "/about" });
  });
});
