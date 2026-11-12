import { describe, expect, it } from "vitest";
import {
  INTRO_GREETINGS,
  INTRO_MAX_MS,
  INTRO_TIMING,
  introExitStartMs,
  introTotalMs,
} from "@/lib/content/introGreetings";

describe("intro timing", () => {
  it("finishes within the 5.5 s ceiling, exit included", () => {
    expect(INTRO_MAX_MS).toBe(5500);
    expect(introTotalMs()).toBeLessThanOrEqual(INTRO_MAX_MS);
  });

  it("keeps the owner's chosen length: five greetings, 5.2 s", () => {
    expect(INTRO_GREETINGS).toHaveLength(5);
    expect(introTotalMs()).toBe(5200);
  });

  it("starts the exit after every greeting has been shown", () => {
    const n = INTRO_GREETINGS.length;
    expect(introExitStartMs()).toBe(
      (n - 1) * INTRO_TIMING.wordMs + INTRO_TIMING.lastHoldMs,
    );
    expect(introTotalMs()).toBe(introExitStartMs() + INTRO_TIMING.exitMs);
  });

  it("keeps the Thai greeting and ends on the site welcome", () => {
    expect(INTRO_GREETINGS).toContain("สวัสดี");
    expect(INTRO_GREETINGS.at(-1)).toBe("Welcome to KunanonJ");
  });

  it("fits the arrival burst inside the last hold and the exit fade", () => {
    expect(INTRO_TIMING.burstMs).toBeLessThanOrEqual(
      INTRO_TIMING.lastHoldMs + INTRO_TIMING.exitMs,
    );
  });
});
