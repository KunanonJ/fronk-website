/*
 * Small request/response helpers shared by the Worker entry and the API routes.
 */

/** Where browsers send the policy's violation reports (./cspReport.ts). */
export const CSP_REPORT_PATH = "/api/csp-report";

/**
 * The site's Content Security Policy (best-practices audit R21), sent
 * report-only: browsers block nothing and report what it would block to
 * CSP_REPORT_PATH, which logs each violation.
 * Scripts keep 'unsafe-inline': TanStack Start streams per-page hydration
 * scripts into the HTML, which no hash can cover, the prerendered pages
 * cannot carry a per-response nonce, and any hash would switch
 * 'unsafe-inline' off. Enforcing it (with nonces, every page rendered on
 * request) is a later decision for the owner. Sanity Studio, a separate app,
 * is left out.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Cloudflare Web Analytics, and Turnstile on /contact.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  // Sanity's image CDN; Unsplash for the hidden press and blog banners.
  "img-src 'self' data: https://cdn.sanity.io https://images.unsplash.com",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // Where reports go: report-to (its endpoint named in Reporting-Endpoints)
  // where the Reporting API is supported, report-uri elsewhere. Safari logs
  // an error for a report-only policy with neither, and drops the policy.
  `report-uri ${CSP_REPORT_PATH}`,
  "report-to csp",
].join("; ");

/** The Reporting-Endpoints header: the endpoint report-to's "csp" names. */
export const REPORTING_ENDPOINTS = `csp="${CSP_REPORT_PATH}"`;

/** The policy's header: report-only until the owner decides to enforce it. */
export const CSP_HEADER = "Content-Security-Policy-Report-Only";

/** Headers every Worker response carries; public/_headers sets the same on static files. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  [CSP_HEADER]: CONTENT_SECURITY_POLICY,
  "Reporting-Endpoints": REPORTING_ENDPOINTS,
};

/**
 * Where TanStack Start answers server-function calls: its default base,
 * which this repo does not change.
 */
export const SERVER_FN_PATH = "/_serverFn/";

/** The headers that set a lifetime at the edge or in browsers. */
const CACHE_HEADERS = [
  "Cache-Control",
  "CDN-Cache-Control",
  "Cloudflare-CDN-Cache-Control",
];

/**
 * A server function's answer (`GET /_serverFn/<id>`, fetched on a client-side
 * navigation) carries no cache header unless the function sets one, and the
 * Worker cache keeps a 200 that carries none for two hours: shared between
 * visitors, with no tag a purge could reach, and served without the
 * framework's cross-site check. So an answer that sets none of the cache
 * headers is kept nowhere. A function that sets any of them chose its own.
 */
export function withServerFnNoStore(
  request: Request,
  response: Response,
): Response {
  if (
    // A WebSocket upgrade (101) cannot be rebuilt; the site has none.
    response.status === 101 ||
    CACHE_HEADERS.some((name) => response.headers.has(name)) ||
    !new URL(request.url).pathname.startsWith(SERVER_FN_PATH)
  )
    return response;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Copy of `response` with SECURITY_HEADERS added where the response has not
 * set them. Sanity Studio (`/studio`) gets no Content Security Policy.
 */
export function withSecurityHeaders(
  response: Response,
  pathname = "/",
): Response {
  // A WebSocket upgrade (101) cannot be rebuilt; the site has none, but be safe.
  if (response.status === 101) return response;
  const headers = new Headers(response.headers);
  const studio = pathname === "/studio" || pathname.startsWith("/studio/");
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (studio && name === CSP_HEADER) continue;
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * The body as text, or null once it passes `maxBytes`. Reads the stream
 * itself, so a missing or false Content-Length cannot get a large body parsed.
 */
export async function readBodyText(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/** 405 for a route that only answers `allow`. */
export function methodNotAllowed(allow: string): Response {
  return new Response(null, { status: 405, headers: { Allow: allow } });
}

/**
 * True when a browser says the request came from another site. Browsers send
 * Sec-Fetch-Site and Origin on POSTs; non-browser clients may send neither,
 * which is allowed (CSRF needs a victim's browser).
 */
export function isCrossSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return true;
  const origin = request.headers.get("origin");
  return origin !== null && origin !== new URL(request.url).origin;
}
