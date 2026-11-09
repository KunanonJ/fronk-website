import { describe, expect, it } from "vitest";
import { isValidEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("fronk@example.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["", "no-at", "a@b", "a@b.", "@x.com", "a b@x.com"]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });
});
