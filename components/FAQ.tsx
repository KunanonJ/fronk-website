import type { FaqItem } from "@/lib/seo/jsonLd";

interface FAQProps {
  items: readonly FaqItem[];
  heading?: string;
}

/**
 * Visible FAQ in terminal dress: a mono eyebrow over a hairline-ruled stack of
 * question/answer pairs. Purely presentational — it renders only the Q&A passed
 * in, so the on-page copy and any FAQPage JSON-LD stay in lockstep (AEO rewards
 * visible parity). Pair with `buildFaqJsonLd(items)`.
 */
export function FAQ({ items, heading = "FAQ" }: FAQProps) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading}>
      <p className="label-mono text-subtle">{heading}</p>
      <dl className="mt-6 divide-y divide-border border-t border-border">
        {items.map((item) => (
          <div key={item.question} className="py-6">
            <dt className="font-display text-lg font-semibold tracking-tight">
              {item.question}
            </dt>
            <dd className="mt-2 max-w-2xl leading-relaxed text-muted">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
