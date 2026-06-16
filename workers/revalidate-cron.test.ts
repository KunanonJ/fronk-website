import { describe, expect, it, vi } from "vitest";
import { triggerRevalidation } from "./revalidate-cron";

describe("triggerRevalidation", () => {
  it("cron__given_missing_endpoint_or_secret__then_does_not_call_fetch", async () => {
    const fetcher = vi.fn();

    const result = await triggerRevalidation({}, fetcher);

    expect(result).toEqual({ ok: false, status: 0, error: "missing_config" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("cron__given_valid_config__then_calls_app_endpoint_with_bearer_secret", async () => {
    const fetcher = vi.fn(async () => new Response("ok", { status: 200 }));

    const result = await triggerRevalidation(
      {
        CRON_ENDPOINT_URL: "https://example.com/api/cron/revalidate",
        CRON_SECRET: "secret",
      },
      fetcher,
    );

    expect(result).toEqual({ ok: true, status: 200 });
    expect(fetcher).toHaveBeenCalledWith(
      "https://example.com/api/cron/revalidate",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer secret",
        },
      },
    );
  });
});
