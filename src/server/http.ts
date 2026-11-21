import { withHeaders } from "@/src/lib/response";

/*
 * Small request/response helpers shared by the Worker entry and the API routes.
 */

/** Where browsers send the policy's violation reports (./cspReport.ts). */
export const CSP_REPORT_PATH = "/api/csp-report";

/**
 * The site's Content Security Policy (best-practices audit R21), enforced
 * since 19-11-26 after it ran report-only from #128 with no violation of its
 * own on any route: browsers block what it does not allow and report each
 * block to CSP_REPORT_PATH, which logs it.
 * Scripts keep 'unsafe-inline': TanStack Start streams per-page hydration
 * scripts into the HTML, which no hash can cover, the prerendered pages
 * cannot carry a per-response nonce, and any hash would switch
 * 'unsafe-inline' off. A nonce-based policy (every page rendered on request)
 * would tighten scripts further, at the cost of prerendering. /studio is a
 * static page linking to the hosted Studio, so it carries the policy too.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Cloudflare Web Analytics. Cloudflare's challenge scripts load from the
  // site's own /cdn-cgi/challenge-platform/, which 'self' covers.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  // Sanity's image CDN (the banners are self-hosted in public/banners).
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // Where reports go: report-to (its endpoint named in Reporting-Endpoints)
  // where the Reporting API is supported, report-uri elsewhere.
  `report-uri ${CSP_REPORT_PATH}`,
  "report-to csp",
].join("; ");

/** The Reporting-Endpoints header: the endpoint report-to's "csp" names. */
export const REPORTING_ENDPOINTS = `csp="${CSP_REPORT_PATH}"`;

/** The policy's header: enforced. */
export const CSP_HEADER = "Content-Security-Policy";

/** Headers every Worker response carries; public/_headers sets the same on static files. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  // No window this site opens, or that opens it, keeps a handle on the other.
  "Cross-Origin-Opener-Policy": "same-origin",
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
  return withHeaders(response, (headers) =>
    headers.set("Cache-Control", "no-store"),
  );
}

/** Copy of `response` with SECURITY_HEADERS added where the response has not set them. */
export function withSecurityHeaders(response: Response): Response {
  // A WebSocket upgrade (101) cannot be rebuilt; the site has none, but be safe.
  if (response.status === 101) return response;
  return withHeaders(response, (headers) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(name)) headers.set(name, value);
    }
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

/**
 * The share videos (public/og, made by scripts/og-video.mjs). Each is named
 * by its content, so a file never changes under its name and keeps for a
 * year; a new video is a new URL in the page's og:video.
 */
export const SHARE_MEDIA_PATH = "/og/";
export const SHARE_MEDIA_CACHE = "public, max-age=31536000, immutable";

/** A single `bytes=` range as [start, end], "unsatisfiable", or null to ignore. */
function parseRange(
  header: string,
  size: number,
): [number, number] | "unsatisfiable" | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  // Several ranges, another unit or a malformed one: the whole file, which
  // a server may always send instead (RFC 9110, 14.2).
  if (!match || (match[1] === "" && match[2] === "")) return null;
  if (match[1] === "") {
    const suffix = Number(match[2]);
    return suffix === 0 || size === 0
      ? "unsatisfiable"
      : [Math.max(0, size - suffix), size - 1];
  }
  const start = Number(match[1]);
  if (start >= size) return "unsatisfiable";
  const end = match[2] === "" ? size - 1 : Number(match[2]);
  if (end < start) return null;
  return [start, Math.min(end, size - 1)];
}

/**
 * A static file's whole answer (a 200 from ASSETS) as the request asked for
 * it: one byte range as a 206, an unsatisfiable range as a 416, and anything
 * else whole, each with `Accept-Ranges: bytes` and the `cacheControl` given.
 *
 * Players fetch video in pieces: Apple's (Messages' link previews, Safari)
 * ask for `Range: bytes=0-1` first and play only on a 206
 * (github.com/hubeiqiao/og-video-preview, "Server"), and static assets on
 * Workers answer a Range with the whole file as a 200 (seen on this site:
 * /resume.pdf and /profile.jpg, 21-11-26). In production the Worker cache
 * strips Range before the Worker runs and cuts the range from the whole 200
 * it keeps (developers.cloudflare.com/workers/cache/configuration/, "Range
 * requests"); this answers it wherever the Worker sees one itself: a cache
 * bypass, and `vite preview`.
 */
export async function withByteRanges(
  request: Request,
  file: Response,
  cacheControl: string,
): Promise<Response> {
  const head = request.method === "HEAD";
  const headers = new Headers(file.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", cacheControl);
  const range = request.headers.get("Range");
  const ifRange = request.headers.get("If-Range");
  // If-Range names the copy the client holds: a different one gets it whole.
  if (!range || (ifRange !== null && ifRange !== headers.get("ETag"))) {
    return new Response(head ? null : file.body, { status: 200, headers });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const size = bytes.byteLength;
  headers.set("Content-Length", String(size));
  const wanted = parseRange(range, size);
  if (wanted === null)
    return new Response(head ? null : bytes, { status: 200, headers });
  if (wanted === "unsatisfiable") {
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }
  const [start, end] = wanted;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(head ? null : bytes.subarray(start, end + 1), {
    status: 206,
    headers,
  });
}

/** 405 for a route that only answers `allow`. */
export function methodNotAllowed(allow: string): Response {
  return new Response(null, { status: 405, headers: { Allow: allow } });
}
