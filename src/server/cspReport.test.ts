import { afterEach, describe, expect, it, vi } from "vitest";
import { cspViolations, handleCspReport } from "./cspReport";

/* Report bodies as the browsers sent them in a probe (Nov 2026), trimmed. */
const reportUri = {
  "csp-report": {
    "document-uri": "https://kunanonj.com/about?ref=x",
    referrer: "https://example.com/private?id=1",
    "violated-directive": "img-src",
    "effective-directive": "img-src",
    "original-policy": "default-src 'self'",
    disposition: "report",
    "blocked-uri": "https://tracker.example/pixel.gif?uid=123",
    "line-number": 12,
    "source-file": "https://kunanonj.com/assets/main.js?v=2",
    "status-code": 200,
  },
};
const reportingApi = [
  {
    type: "csp-violation",
    age: 10,
    url: "https://kunanonj.com/contact",
    user_agent: "Mozilla/5.0",
    body: {
      documentURL: "https://kunanonj.com/contact",
      blockedURL: "inline",
      effectiveDirective: "script-src-elem",
      disposition: "report",
      lineNumber: 3,
      sourceFile: "https://kunanonj.com/contact",
    },
  },
  { type: "deprecation", url: "https://kunanonj.com/", body: { id: "x" } },
];
const safariReportTo = {
  type: "csp-violation",
  url: "https://kunanonj.com/skills",
  body: {
    documentURL: "https://kunanonj.com/skills",
    blockedURL: "data:image/png;base64,AAAA",
    effectiveDirective: "font-src",
  },
};

const post = (body: string, type = "application/csp-report") =>
  new Request("https://kunanonj.com/api/csp-report", {
    method: "POST",
    headers: { "Content-Type": type },
    body,
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cspViolations", () => {
  it("reads report-uri's shape, without queries or the referrer", () => {
    expect(cspViolations(reportUri)).toEqual([
      {
        page: "/about",
        directive: "img-src",
        blocked: "https://tracker.example/pixel.gif",
        source: "https://kunanonj.com/assets/main.js:12",
      },
    ]);
  });

  it("reads the Reporting API's batches and skips other report types", () => {
    expect(cspViolations(reportingApi)).toEqual([
      {
        page: "/contact",
        directive: "script-src-elem",
        blocked: "inline",
        source: "https://kunanonj.com/contact:3",
      },
    ]);
  });

  it("reads Safari's single report-to object, naming only a data URL's scheme", () => {
    expect(cspViolations(safariReportTo)).toEqual([
      { page: "/skills", directive: "font-src", blocked: "data:" },
    ]);
  });

  it("takes an older browser's whole violated directive by its name", () => {
    const old = {
      "csp-report": {
        "document-uri": "https://kunanonj.com/",
        "violated-directive": "style-src 'self'",
        "blocked-uri": "inline",
      },
    };
    expect(cspViolations(old)).toEqual([
      { page: "/", directive: "style-src", blocked: "inline" },
    ]);
  });

  it("drops what is not a violation report", () => {
    for (const body of [
      null,
      "text",
      42,
      {},
      { "csp-report": { "document-uri": "not a url" } },
      { "csp-report": { "document-uri": "https://kunanonj.com/" } },
      {
        "csp-report": {
          "document-uri": "https://kunanonj.com/",
          "effective-directive": "<script>",
        },
      },
      [{ type: "csp-violation", body: "x" }],
    ]) {
      expect(cspViolations(body), JSON.stringify(body)).toEqual([]);
    }
  });
});

describe("handleCspReport", () => {
  it("logs each violation as one JSON line and answers 204", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await handleCspReport(
      post(JSON.stringify(reportingApi), "application/reports+json"),
    );
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(warn.mock.calls[0][0]))).toEqual({
      event: "csp-violation",
      page: "/contact",
      directive: "script-src-elem",
      blocked: "inline",
      source: "https://kunanonj.com/contact:3",
    });
  });

  it("logs at most twenty violations from one request", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const many = Array.from({ length: 50 }, () => safariReportTo);
    const res = await handleCspReport(post(JSON.stringify(many)));
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(20);
  });

  it("refuses other methods, content types, large bodies and bad JSON", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const get = await handleCspReport(
      new Request("https://kunanonj.com/api/csp-report"),
    );
    expect(get.status).toBe(405);
    expect(get.headers.get("allow")).toBe("POST");
    expect((await handleCspReport(post("{}", "text/plain"))).status).toBe(415);
    expect(
      (
        await handleCspReport(
          post(
            "x".repeat(64 * 1024 + 1),
            "application/csp-report; charset=utf-8",
          ),
        )
      ).status,
    ).toBe(413);
    expect((await handleCspReport(post("{not json"))).status).toBe(400);
    expect(warn).not.toHaveBeenCalled();
  });
});
