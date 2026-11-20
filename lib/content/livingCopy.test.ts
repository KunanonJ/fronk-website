import { describe, expect, it } from "vitest";
import { hourGuess } from "./livingCopy";

/*
 * The guess beside the footer's Bangkok clock (now-building-and-genz
 * Phase 5): one for every hour, each worded as a guess, none a claim about
 * when he answers or whether he is free.
 */

describe("hourGuess", () => {
  it("guesses by the hour in Bangkok", () => {
    const at = (hours: number[]) => hours.map(hourGuess);
    const all = (guess: string, hours: number[]) =>
      expect(at(hours), guess).toEqual(hours.map(() => guess));
    all("probably asleep", [23, 0, 1, 2, 3, 4, 5]);
    all("probably having coffee", [6, 7, 8]);
    all("probably shipping", [9, 10, 11, 13, 14, 15, 16, 17]);
    all("probably at lunch", [12]);
    all("probably still shipping", [18, 19, 20, 21, 22]);
  });

  it("is a guess at every hour, and never says when he replies or that he is free", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const guess = hourGuess(hour);
      expect(guess, String(hour)).toMatch(/^probably /);
      expect(guess).not.toMatch(
        /repl|respond|answer|available|free|open to|online|reach/i,
      );
    }
  });
});
