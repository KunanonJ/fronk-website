import Link from "@/components/navigation/Link";
import {
  CARD,
  Kicker,
  LibraryHero,
  MONO_LABEL,
  TEXT_LINK,
} from "@/components/landing/library/parts";
import {
  EXAMPLE_PERSONAS,
  examplesByPersona,
  examplesPage,
} from "@/lib/content/examples";
import type { ExamplePersonaId } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/** The persona picker: a tile per persona, the pressed one in ink. */
function PersonaPicker({
  persona,
  onChange,
}: {
  persona: ExamplePersonaId;
  onChange: (next: ExamplePersonaId) => void;
}) {
  const current = EXAMPLE_PERSONAS.find((p) => p.id === persona);
  const count = examplesByPersona[persona].length;

  return (
    <article aria-labelledby="card-persona" className={cn(CARD, "gap-4")}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Kicker id="card-persona">Show examples for</Kicker>
        <p aria-live="polite" className={MONO_LABEL}>
          {count} examples for {current?.label}
        </p>
      </div>
      <div
        role="group"
        aria-label="Show examples for"
        className="flex flex-wrap gap-2.5"
      >
        {EXAMPLE_PERSONAS.map((option, i) => {
          const on = option.id === persona;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex min-h-[104px] min-w-0 flex-[1_1_180px] flex-col items-start justify-between gap-[18px] rounded-well border px-4 pt-3.5 pb-4 text-left",
                on
                  ? "border-cta bg-cta text-on-cta"
                  : "border-hairline-strong bg-page text-ink",
              )}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-mono text-xs opacity-80">
                  {pad2(i + 1)} · {examplesByPersona[option.id].length} examples
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 shrink-0",
                    on ? "bg-mark" : "border border-hairline-strong",
                  )}
                />
              </span>
              <span className="text-[22px] leading-tight font-semibold tracking-[-0.02em]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

/**
 * Examples (bento redesign, phase 7f; design spec 4.11): the persona picker
 * card, then that persona's examples as cards in a wrapping row (three, two
 * or one per row by their 260 px basis). The persona is the `?persona=`
 * search param, owned by the route.
 */
export default function ExamplesPage({
  persona,
  onPersonaChange,
}: {
  persona: ExamplePersonaId;
  onPersonaChange: (next: ExamplePersonaId) => void;
}) {
  const label =
    EXAMPLE_PERSONAS.find((p) => p.id === persona)?.label ?? persona;

  return (
    <>
      <LibraryHero
        eyebrow={examplesPage.eyebrow}
        headline={examplesPage.headline}
        lede={examplesPage.lede}
      />
      <section aria-label="Examples by persona" className="flex flex-col gap-5">
        <PersonaPicker persona={persona} onChange={onPersonaChange} />
        <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
          {examplesByPersona[persona].map((card, i) => {
            const id = `example-${persona}-${i + 1}`;
            return (
              <li key={card.title} className="flex min-w-0 flex-[1_1_260px]">
                <article
                  aria-labelledby={id}
                  className={cn(CARD, "min-h-[320px] flex-auto gap-3 pb-4")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Kicker as="p">{label}</Kicker>
                    <span aria-hidden className="font-mono text-xs text-ink-2">
                      {pad2(i + 1)}
                    </span>
                  </div>
                  <h2
                    id={id}
                    className="m-0 mt-auto text-[22px] leading-[1.22] font-semibold tracking-[-0.02em]"
                  >
                    {card.title}
                  </h2>
                  <p className="m-0 text-card leading-[1.55] text-ink-2">
                    {card.body}
                  </p>
                  <div className="flex flex-col border-t border-hairline pt-3">
                    <span className="font-mono text-xs [overflow-wrap:anywhere] text-ink-2">
                      {card.href}
                    </span>
                    <Link href={card.href} className={TEXT_LINK}>
                      {card.ctaLabel} →
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
