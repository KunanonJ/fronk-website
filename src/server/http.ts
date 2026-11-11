/*
 * Small request/response helpers shared by the Worker entry and the API routes.
 */

/** Headers every Worker response carries; public/_headers sets the same on static files. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
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

/** Copy of `response` with SECURITY_HEADERS added where the response has not set them. */
export function withSecurityHeaders(response: Response): Response {
  // A WebSocket upgrade (101) cannot be rebuilt; the site has none, but be safe.
  if (response.status === 101) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
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
