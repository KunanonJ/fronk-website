import { describe, expect, it } from "vitest";
import { resolveGscVerification } from "./searchConsole";

describe("resolveGscVerification", () => {
  it("accepts a normal GSC meta token", () => {
    expect(resolveGscVerification("AbCdEfGh1234567890_-xy")).toBe(
      "AbCdEfGh1234567890_-xy",
    );
  });

  it("rejects missing, short, or unsafe tokens", () => {
    expect(resolveGscVerification(undefined)).toBeNull();
    expect(resolveGscVerification("short")).toBeNull();
    expect(resolveGscVerification(`"><script>`)).toBeNull();
  });
});
