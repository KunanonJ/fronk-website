import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({ buildClient: vi.fn() }));

import { buildClient } from "./client";
import { fetchResumeProfile } from "./fetch";

/*
 * The résumé's fallback (lib/content/resumeProfile.ts) starts from a failed
 * read being a thrown error. If a failed read came back as null instead, an
 * outage would look like "no résumé document": the repo's copy would be
 * drawn as a good read and kept at the edge for an hour.
 */

afterEach(() => vi.restoreAllMocks());

describe("fetchResumeProfile", () => {
  it("rethrows a failed read, and logs it", async () => {
    const failure = new Error("down");
    vi.mocked(buildClient).mockReturnValue({
      fetch: () => Promise.reject(failure),
    } as never);
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(fetchResumeProfile()).rejects.toBe(failure);
    expect(logged).toHaveBeenCalledWith(
      "[sanity] fetchResumeProfile failed",
      failure,
    );
  });

  it("answers null when Sanity holds no document, or is not configured", async () => {
    vi.mocked(buildClient).mockReturnValue({
      fetch: () => Promise.resolve(null),
    } as never);
    await expect(fetchResumeProfile()).resolves.toBeNull();
    vi.mocked(buildClient).mockReturnValue(null);
    await expect(fetchResumeProfile()).resolves.toBeNull();
  });
});
