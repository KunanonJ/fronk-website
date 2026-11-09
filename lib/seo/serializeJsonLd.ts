/**
 * JSON for a <script type="application/ld+json"> body. `<` is escaped as
 * \u003c so content (for example a CMS post title containing "</script>")
 * can never close the tag; JSON parsers read the escape as the same character.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
