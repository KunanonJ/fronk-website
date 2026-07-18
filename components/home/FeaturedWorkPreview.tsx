import Link from "next/link";
import { HOME_MARKETING } from "@/lib/content/homeMarketing";
import type { Venture } from "@/lib/content/ventures";

/** Featured tiles deep-link to the internal case page when one exists. */
function caseHref(venture: Venture): string {
  return venture.caseStudy ? `/ventures/${venture.slug}` : venture.url;
}

interface FeaturedWorkPreviewProps {
  ventures: readonly Venture[];
}

/**
 * Product-preview panel under the hero — real featured ventures only.
 */
export function FeaturedWorkPreview({ ventures }: FeaturedWorkPreviewProps) {
  if (ventures.length === 0) return null;

  const primary = ventures[0]!;
  const rest = ventures.slice(1, 3);

  return (
    <section
      aria-label="Featured work preview"
      className="mx-auto w-full max-w-5xl px-5 pb-8 sm:px-8"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="ml-2 text-xs text-muted">
            {HOME_MARKETING.previewLabel}
          </span>
        </div>
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <Link
            href={caseHref(primary)}
            className="block space-y-3 p-6 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {primary.year} · {primary.role}
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {primary.name}
            </h2>
            <p className="max-w-md text-sm text-muted sm:text-base">
              {primary.description}
            </p>
            {primary.metrics ? (
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4">
                {primary.metrics.slice(0, 3).map((m) => (
                  <div key={m.label}>
                    <dt className="text-xs text-muted">{m.label}</dt>
                    <dd className="mt-1 font-display text-lg font-semibold text-fg">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Link>
          <ul className="divide-y divide-border border-t border-border md:border-t-0 md:border-l">
            {rest.map((v) => (
              <li key={v.slug}>
                <Link
                  href={caseHref(v)}
                  className="block space-y-1 p-5 transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-6"
                >
                  <p className="font-display text-lg font-semibold text-fg">
                    {v.name}
                  </p>
                  <p className="text-sm text-muted">{v.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
