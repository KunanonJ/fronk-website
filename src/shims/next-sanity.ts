/*
 * `next-sanity` in the Start build (tanstack-migration): the two exports
 * lib/sanity uses. next-sanity's createClient is @sanity/client's; its groq
 * tag only joins the template (same as the `groq` package).
 */
export { createClient, type SanityClient } from "@sanity/client";

export function groq(strings: TemplateStringsArray, ...keys: unknown[]): string {
  const last = strings.length - 1;
  return strings.slice(0, last).reduce((acc, str, i) => acc + str + String(keys[i]), "") + strings[last];
}
