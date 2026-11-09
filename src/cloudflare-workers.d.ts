// The Worker env, as the Start server code reads it (bindings and secrets
// from wrangler.start.jsonc). Narrowed where used.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
