// The parts of "cloudflare:workers" the Start server code uses. Bindings and
// secrets come from wrangler.jsonc and are narrowed where used.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
