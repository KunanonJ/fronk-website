import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTENT_SECURITY_POLICY,
  CSP_HEADER,
  CSP_REPORT_PATH,
  REPORTING_ENDPOINTS,
  SECURITY_HEADERS,
  SERVER_FN_PATH,
  SHARE_MEDIA_CACHE,
  shareMediaNotModified,
  methodNotAllowed,
  readBodyText,
  withByteRanges,
  withSecurityHeaders,
  withServerFnNoStore,
} from "./http";

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("https://kunanonj.com/api/csp-report", {
    method: "POST",
    headers,
    body,
  });

describe("withSecurityHeaders", () => {
  it("adds every header and keeps status, body and existing values", async () => {
    const res = withSecurityHeaders(
      new Response("hi", {
        status: 404,
        headers: { "X-Frame-Options": "DENY", "Content-Type": "text/plain" },
      }),
    );
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("hi");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("content-type")).toBe("text/plain");
    for (const name of Object.keys(SECURITY_HEADERS).filter(
      (n) => n !== "X-Frame-Options",
    )) {
      expect(res.headers.get(name)).toBe(SECURITY_HEADERS[name]);
    }
  });

  it("works on redirects, whose headers are immutable when fetched", () => {
    const res = withSecurityHeaders(
      Response.redirect("https://kunanonj.com/about", 308),
    );
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://kunanonj.com/about");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("the Content Security Policy (enforced)", () => {
  it("rides on every Worker response, /studio's included", () => {
    const page = withSecurityHeaders(new Response("ok"));
    expect(CSP_HEADER).toBe("Content-Security-Policy");
    expect(page.headers.get(CSP_HEADER)).toBe(CONTENT_SECURITY_POLICY);
    expect(page.headers.get("content-security-policy-report-only")).toBeNull();
    expect(page.headers.get("cross-origin-opener-policy")).toBe("same-origin");
  });

  it("blocks plug-ins and foreign bases, forms and frames", () => {
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ]) {
      expect(CONTENT_SECURITY_POLICY).toContain(directive);
    }
  });

  it("sends its reports to the Worker's report endpoint", () => {
    // Blocks are reported (Safari also drops a report-only policy without).
    expect(CSP_REPORT_PATH).toBe("/api/csp-report");
    expect(CONTENT_SECURITY_POLICY).toContain(`report-uri ${CSP_REPORT_PATH}`);
    expect(CONTENT_SECURITY_POLICY).toContain("report-to csp");
    expect(REPORTING_ENDPOINTS).toBe(`csp="${CSP_REPORT_PATH}"`);
    const page = withSecurityHeaders(new Response("ok"));
    expect(page.headers.get("reporting-endpoints")).toBe(REPORTING_ENDPOINTS);
  });

  it("is the same in public/_headers, with no path detached from it", () => {
    const headers = readFileSync(
      join(process.cwd(), "public/_headers"),
      "utf8",
    );
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(headers).toContain(`  ${name}: ${value}\n`);
    }
    expect(headers).not.toContain(`! ${CSP_HEADER}`);
  });
});

describe("withServerFnNoStore", () => {
  const at = (path: string) => new Request(`https://kunanonj.com${path}`);

  it("keeps a server function's answer out of every cache", async () => {
    const res = withServerFnNoStore(
      at("/_serverFn/17bb0f50?payload=x"),
      new Response('{"t":2}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(await res.text()).toBe('{"t":2}');
  });

  it("keeps a Cache-Control the function set itself", () => {
    const own = new Response("{}", {
      headers: { "Cache-Control": "private, max-age=60" },
    });
    expect(
      withServerFnNoStore(at("/_serverFn/17bb0f50"), own).headers.get(
        "cache-control",
      ),
    ).toBe("private, max-age=60");
  });

  it("keeps an edge lifetime the function set itself, adding nothing", () => {
    for (const name of ["CDN-Cache-Control", "Cloudflare-CDN-Cache-Control"]) {
      const own = new Response("{}", {
        headers: { [name]: "public, max-age=60" },
      });
      expect(withServerFnNoStore(at("/_serverFn/17bb0f50"), own), name).toBe(
        own,
      );
    }
  });

  it("leaves a WebSocket upgrade as it is: a 101 cannot be rebuilt", () => {
    // Node's Response refuses status 101, so this stands in for one.
    const upgrade = { status: 101, headers: new Headers() } as Response;
    expect(withServerFnNoStore(at("/_serverFn/17bb0f50"), upgrade)).toBe(
      upgrade,
    );
  });

  it("leaves every other response as it is", () => {
    const page = new Response("<html></html>");
    expect(withServerFnNoStore(at("/resume"), page)).toBe(page);
    expect(withServerFnNoStore(at("/_serverFnx/17bb0f50"), page)).toBe(page);
  });

  it("pins the server-function path (the browser test shows it is the framework's)", () => {
    // TanStack Start answers server functions under /_serverFn/ unless the
    // app sets another base; this repo does not. The browser test in
    // tests/e2e/smoke.spec.ts shows the built site uses it.
    expect(SERVER_FN_PATH).toBe("/_serverFn/");
  });
});

describe("readBodyText", () => {
  it("returns the body under the limit", async () => {
    expect(await readBodyText(post('{"a":"ก"}'), 100)).toBe('{"a":"ก"}');
  });

  it("returns null when the declared length is over the limit", async () => {
    expect(
      await readBodyText(post("x", { "content-length": "500" }), 100),
    ).toBeNull();
  });

  it("returns null when the streamed body is over the limit despite a small Content-Length", async () => {
    expect(
      await readBodyText(
        post("x".repeat(500), { "content-length": "10" }),
        100,
      ),
    ).toBeNull();
  });

  it("returns an empty string with no body", async () => {
    expect(await readBodyText(post(null), 100)).toBe("");
  });
});

describe("methodNotAllowed", () => {
  it("answers 405 with Allow", () => {
    const res = methodNotAllowed("POST");
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });
});

describe("withByteRanges (the share videos, public/og)", () => {
  const BYTES = Uint8Array.from({ length: 100 }, (_, i) => i);
  /** ASSETS' answer for the whole file. */
  const file = () =>
    new Response(BYTES, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": "100",
        ETag: '"abc"',
      },
    });
  const ask = (headers: Record<string, string> = {}, method = "GET") =>
    withByteRanges(
      new Request("https://kunanonj.com/og/home-0123abcd.mp4", {
        method,
        headers,
      }),
      file(),
      SHARE_MEDIA_CACHE,
    );
  const body = async (res: Response) =>
    Array.from(new Uint8Array(await res.arrayBuffer()));

  it("sends the whole file, ranges offered and kept a year, with no Range", async () => {
    const res = await ask();
    expect(res.status).toBe(200);
    expect(res.headers.get("accept-ranges")).toBe("bytes");
    expect(res.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(res.headers.get("content-type")).toBe("video/mp4");
    expect(await body(res)).toHaveLength(100);
  });

  it("answers Apple's first probe, bytes=0-1, with a 206 of two bytes", async () => {
    const res = await ask({ Range: "bytes=0-1" });
    expect(res.status).toBe(206);
    expect(res.headers.get("content-range")).toBe("bytes 0-1/100");
    expect(res.headers.get("content-length")).toBe("2");
    expect(res.headers.get("content-type")).toBe("video/mp4");
    expect(await body(res)).toEqual([0, 1]);
  });

  it("answers open and suffix ranges, and clips an end past the file", async () => {
    const open = await ask({ Range: "bytes=95-" });
    expect(open.headers.get("content-range")).toBe("bytes 95-99/100");
    expect(await body(open)).toEqual([95, 96, 97, 98, 99]);
    const suffix = await ask({ Range: "bytes=-3" });
    expect(suffix.headers.get("content-range")).toBe("bytes 97-99/100");
    expect(await body(suffix)).toEqual([97, 98, 99]);
    const past = await ask({ Range: "bytes=98-500" });
    expect(past.status).toBe(206);
    expect(await body(past)).toEqual([98, 99]);
  });

  it("answers a range past the end with 416 and the file's size", async () => {
    const res = await ask({ Range: "bytes=100-" });
    expect(res.status).toBe(416);
    expect(res.headers.get("content-range")).toBe("bytes */100");
    expect(await body(res)).toEqual([]);
  });

  it("sends the whole file for several ranges, another unit or a stale If-Range", async () => {
    for (const headers of [
      { Range: "bytes=0-1, 5-6" } as Record<string, string>,
      { Range: "items=0-1" },
      { Range: "bytes=5-1" },
      { Range: "bytes=0-1", "If-Range": '"old"' },
    ]) {
      const res = await ask(headers);
      expect(res.status, JSON.stringify(headers)).toBe(200);
      expect(await body(res)).toHaveLength(100);
    }
    const current = await ask({ Range: "bytes=0-1", "If-Range": '"abc"' });
    expect(current.status).toBe(206);
  });

  it("answers HEAD with the headers and no body", async () => {
    const res = await ask({ Range: "bytes=0-1" }, "HEAD");
    expect(res.status).toBe(206);
    expect(res.headers.get("content-length")).toBe("2");
    expect(res.body).toBeNull();
  });
});

describe("shareMediaNotModified", () => {
  it("keeps the share video's year-long lifetime on a 304", () => {
    const fromAssets = new Response(null, {
      status: 304,
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        ETag: '"abc"',
      },
    });
    const answer = shareMediaNotModified(fromAssets);
    expect(answer.status).toBe(304);
    expect(answer.headers.get("Cache-Control")).toBe(SHARE_MEDIA_CACHE);
    expect(answer.headers.get("Accept-Ranges")).toBe("bytes");
    expect(answer.headers.get("ETag")).toBe('"abc"');
  });
});
