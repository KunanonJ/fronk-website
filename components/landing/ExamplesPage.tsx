import { useState } from "react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import { LibraryLinkCard } from "@/components/landing/LibraryLinkCard";
import { cn } from "@/lib/utils/cn";
import {
  EXAMPLE_PERSONAS,
  examplesByPersona,
  examplesPage,
  type ExamplePersona,
} from "@/lib/content/examples";

/**
 * Examples by persona (visual-redesign Phase 5). The persona switch is a
 * filter, so it is a group of toggle buttons (`aria-pressed`) rather than an
 * ARIA tablist without arrow-key support; a polite live region reports the
 * new result count.
 */
export default function ExamplesPage() {
  const [persona, setPersona] = useState<ExamplePersona>("Builders");
  const cards = examplesByPersona[persona];

  return (
    <LibraryPageShell
      eyebrow={examplesPage.eyebrow}
      title={examplesPage.title}
      description={examplesPage.description}
    >
      <div
        role="group"
        aria-label="Show examples for"
        className="mb-10 flex flex-wrap gap-2"
      >
        {EXAMPLE_PERSONAS.map((item) => {
          const active = item === persona;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 ease-smooth",
                active
                  ? "border-ink bg-ink text-page"
                  : "border-hairline-strong bg-surface text-ink-2 hover:border-ink/40 hover:text-ink",
              )}
              onClick={() => setPersona(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {`${cards.length} examples for ${persona}`}
      </p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.title}>
            <LibraryLinkCard
              href={card.href}
              title={card.title}
              description={card.body}
              cta={card.ctaLabel}
              headingAs="h2"
            />
          </li>
        ))}
      </ul>
    </LibraryPageShell>
  );
}
