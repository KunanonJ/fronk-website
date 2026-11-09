/*
 * `next/server` in the Start build (tanstack-migration): the NextResponse
 * helpers the shared route handlers use. Plain Fetch API underneath.
 */
export class NextResponse extends Response {
  static json(body: unknown, init?: ResponseInit): Response {
    return Response.json(body, init);
  }

  static redirect(url: string | URL, init?: number | ResponseInit): Response {
    return Response.redirect(String(url), typeof init === "number" ? init : (init?.status ?? 307));
  }
}

export type NextRequest = Request;
