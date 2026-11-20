import { describe, expect, it } from "vitest";
import {
  INTRO_GREETINGS,
  INTRO_MAX_MS,
  INTRO_TIMING,
  introExitStartMs,
  introTotalMs,
} from "@/lib/content/introGreetings";

describe("intro timing", () => {
  it("finishes within the 3.2 s ceiling, the hand-over included", () => {
    expect(INTRO_MAX_MS).toBe(3200);
    expect(introTotalMs()).toBeLessThanOrEqual(INTRO_MAX_MS);
  });

  it("keeps the owner's chosen length (20-11-26): five greetings, 2.9 s", () => {
    expect(INTRO_GREETINGS).toHaveLength(5);
    expect(introTotalMs()).toBe(2900);
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

  it("fits the welcome's burst inside the last hold", () => {
    expect(INTRO_TIMING.burstMs).toBeLessThanOrEqual(INTRO_TIMING.lastHoldMs);
  });
});
