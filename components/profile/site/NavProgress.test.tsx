import { act, render } from "@testing-library/react";
import {
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavProgress } from "@/components/profile/site/NavProgress";

/*
 * The progress line (polish pass, F5): hidden decoration that the router's
 * pending state marks; the 150 ms delay and the growth are CSS.
 */

const ROUTER = vi.hoisted(() => ({ pending: false }));

vi.mock("@/lib/router/navigation", () => ({
  useNavigationPending: () => ROUTER.pending,
}));

afterEach(() => {
  ROUTER.pending = false;
});

const line = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".pf-progress")!;

describe("NavProgress", () => {
  it("is idle and hidden from screen readers when nothing loads", () => {
    const { container } = render(<NavProgress />);
    expect(line(container)).toHaveAttribute("aria-hidden", "true");
    expect(line(container)).not.toHaveAttribute("data-pending");
  });

  it("marks a pending navigation", () => {
    ROUTER.pending = true;
    const { container } = render(<NavProgress />);
    expect(line(container)).toHaveAttribute("data-pending", "");
  });

  it("draws it idle on the server even while pending, so hydration matches", () => {
    ROUTER.pending = true;
    const html = renderToString(<NavProgress />);
    expect(html).toContain('class="pf-progress"');
    expect(html).not.toContain("data-pending");
  });

  it("stops marking it when the navigation ends", () => {
    ROUTER.pending = true;
    const { container, rerender } = render(<NavProgress />);
    ROUTER.pending = false;
    rerender(<NavProgress />);
    expect(line(container)).not.toHaveAttribute("data-pending");
  });
});

describe("useNavigationPending", () => {
  it("follows the router's status", async () => {
    // The real hook, not the setup file's stand-in.
    const { useNavigationPending } = await vi.importActual<
      typeof import("@/lib/router/navigation")
    >("@/lib/router/navigation");
    const router = createRouter({ routeTree: createRootRoute() });
    function Probe() {
      return <p>{useNavigationPending() ? "pending" : "idle"}</p>;
    }
    const { container } = render(
      <RouterContextProvider router={router}>
        <Probe />
      </RouterContextProvider>,
    );
    expect(container).toHaveTextContent("idle");
    act(() => router.stores.status.set("pending"));
    expect(container).toHaveTextContent("pending");
    act(() => router.stores.status.set("idle"));
    expect(container).toHaveTextContent("idle");
  });
});
