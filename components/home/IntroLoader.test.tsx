import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { IntroLoader } from "./IntroLoader";
import { INTRO_SESSION_KEY } from "@/lib/content/introGreetings";

vi.mock("@/lib/motion/motionRuntime", () => ({
  prefersReducedMotion: vi.fn(() => false),
}));

import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

describe("IntroLoader", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(prefersReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("skips when prefers-reduced-motion", async () => {
    vi.mocked(prefersReducedMotion).mockReturnValue(true);
    const { container } = render(<IntroLoader />);
    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull();
    });
  });

  it("skips when session already seen", async () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    const { container } = render(<IntroLoader />);
    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull();
    });
  });

  it("shows a greeting on first visit", async () => {
    render(<IntroLoader />);
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
