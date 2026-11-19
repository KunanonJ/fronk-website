import { methodNotAllowed, readBodyText } from "./http";

/*
 * POST /api/csp-report (CSP_REPORT_PATH): where browsers send the
 * Content Security Policy's violations (CONTENT_SECURITY_POLICY in ./http.ts).
 * Each violation becomes one line in the Worker's logs (wrangler.jsonc
 * `observability`), so the owner sees what the enforced policy blocks on
 * live pages. Nothing is stored. Only what places a violation
 * is logged: the page's path, the directive, and where the blocked thing
 * came from, without query strings, referrers or user agents.
 */

/** One browser's batch is a few KB; a body past this is not a browser's. */
const MAX_BYTES = 64 * 1024;
/**
 * Log lines per request at most, after repeats are dropped: a browser's batch
 * holds a few distinct violations, and the endpoint is public, so one request
 * must not fill the logs.
 */
const MAX_VIOLATIONS = 5;
/** Characters kept of any one logged value. */
const MAX_FIELD = 200;

/**
 * The content types browsers send reports with: report-uri's, and Safari's
 * report-to reports too; the Reporting API's (Chromium); plain JSON. None is
 * a type a form on another site can post, and another site's fetch with one
 * needs a CORS preflight this endpoint never grants.
 */
const REPORT_TYPES = [
  "application/csp-report",
  "application/reports+json",
  "application/json",
];

export interface CspViolation {
  /** The page's path, for example /about. */
  page: string;
  /** The directive it broke, for example img-src. */
  directive: string;
  /** "inline", "eval" and the like, or the blocked URL without its query. */
  blocked: string;
  /** Where on the page it happened (file and line), when the browser says. */
  source?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A web URL's origin and path; another scheme's name; a keyword as it is. */
function placeOf(value: unknown): string {
  if (typeof value !== "string") return "";
  let place = value;
  try {
    const url = new URL(value);
    place = /^https?:$/.test(url.protocol)
      ? `${url.origin}${url.pathname}`
      : url.protocol;
  } catch {
    // "inline", "eval", "wasm-eval": not URLs.
  }
  return place.slice(0, MAX_FIELD);
}

function pathOf(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    return new URL(value).pathname.slice(0, MAX_FIELD);
  } catch {
    return "";
  }
}

/** "img-src", also from an older browser's whole "img-src 'self'". */
function directiveOf(value: unknown): string {
  const name = typeof value === "string" ? value.split(" ")[0] : "";
  return /^[a-z-]{1,40}$/.test(name) ? name : "";
}

function violation(
  documentUrl: unknown,
  directive: unknown,
  blocked: unknown,
  sourceFile: unknown,
  line: unknown,
): CspViolation | null {
  const found: CspViolation = {
    page: pathOf(documentUrl),
    directive: directiveOf(directive),
    blocked: placeOf(blocked),
  };
  if (!found.page || !found.directive) return null;
  const source = placeOf(sourceFile);
  if (source) {
    found.source =
      typeof line === "number" && line > 0 ? `${source}:${line}` : source;
  }
  return found;
}

function violationOf(report: unknown): CspViolation | null {
  if (!isRecord(report)) return null;
  // report-uri: {"csp-report": {...}}, with dashed names.
  const legacy = report["csp-report"];
  if (isRecord(legacy)) {
    return violation(
      legacy["document-uri"],
      legacy["effective-directive"] ?? legacy["violated-directive"],
      legacy["blocked-uri"],
      legacy["source-file"],
      legacy["line-number"],
    );
  }
  // report-to: {"type": "csp-violation", "url", "body": {...}}, camelCase.
  if (report.type === "csp-violation" && isRecord(report.body)) {
    const body = report.body;
    return violation(
      body.documentURL ?? report.url,
      body.effectiveDirective,
      body.blockedURL,
      body.sourceFile,
      body.lineNumber,
    );
  }
  return null;
}

/**
 * The violations in a report body, in each shape browsers send: report-uri's
 * object, the Reporting API's array (Chromium), and Safari's single report-to
 * object. Other report types and malformed entries are left out.
 */
export function cspViolations(body: unknown): CspViolation[] {
  const reports = Array.isArray(body) ? body : [body];
  return reports.flatMap((report) => {
    const found = violationOf(report);
    return found ? [found] : [];
  });
}

/** Logs each distinct violation in the body (up to MAX_VIOLATIONS) and answers 204. */
export async function handleCspReport(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed("POST");
  const type = (request.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!REPORT_TYPES.includes(type)) return new Response(null, { status: 415 });
  const text = await readBodyText(request, MAX_BYTES);
  if (text === null) return new Response(null, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const lines = new Set(
    cspViolations(body).map((found) =>
      JSON.stringify({ event: "csp-violation", ...found }),
    ),
  );
  for (const line of [...lines].slice(0, MAX_VIOLATIONS)) console.warn(line);
  return new Response(null, { status: 204 });
}
