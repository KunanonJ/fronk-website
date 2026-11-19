/**
 * A copy of `response` with its headers changed by `edit`. A response's own
 * headers can be immutable (one from fetch or ASSETS), so the copy is a new
 * Response around the same body, status and status text. `body` replaces
 * the body: null answers a HEAD.
 */
export function withHeaders(
  response: Response,
  edit: (headers: Headers) => void,
  body: BodyInit | null = response.body,
): Response {
  const headers = new Headers(response.headers);
  edit(headers);
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
