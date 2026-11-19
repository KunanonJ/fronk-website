import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";

/**
 * One structured-data script. Every page's JSON-LD goes through here, so
 * serializeJsonLd's escaping, which keeps content from closing the tag, is
 * never skipped.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
