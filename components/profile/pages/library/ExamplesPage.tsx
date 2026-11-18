import {
  ArrowLink,
  FilterBar,
  type FilterOption,
} from "@/components/profile/pages/library/parts";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import {
  EXAMPLE_PERSONAS,
  examplesByPersona,
  examplesPage,
} from "@/lib/content/examples";
import type { ExamplePersonaId } from "@/lib/library/search";
import { pad2 } from "@/lib/utils/pad2";

/*
 * /examples (profile redesign, Phase 7 lane D1, plan step 7d): the hero, the
 * persona filter, then that persona's examples as tiles in a wrapping row.
 * The persona is the `?persona=` search param, owned by the route: the
 * prerendered page shows the default and the param applies after hydration.
 */

const PERSONAS: readonly FilterOption<ExamplePersonaId>[] =
  EXAMPLE_PERSONAS.map((persona) => ({
    id: persona.id,
    label: persona.label,
    count: examplesByPersona[persona.id].length,
  }));

export default function ExamplesPage({
  persona,
  onPersonaChange,
}: {
  persona: ExamplePersonaId;
  onPersonaChange: (next: ExamplePersonaId) => void;
}) {
  const label =
    EXAMPLE_PERSONAS.find((p) => p.id === persona)?.label ?? persona;
  const cards = examplesByPersona[persona];
  const { headline } = examplesPage;

  return (
    <>
      <ReadingHero
        eyebrow={examplesPage.eyebrow}
        title={
          <SegmentHeadline
            lines={[...headline.lines, [headline.accent]]}
            joiner=" "
          />
        }
        lead={examplesPage.lede}
      />
      <section
        aria-label="Examples by persona"
        className="ds-wrap pf-read-body"
      >
        <div>
          <FilterBar
            label="Show examples for"
            options={PERSONAS}
            value={persona}
            onChange={onPersonaChange}
            result={`${cards.length} examples for ${label}`}
          />
          <ul className="pf-read-flex">
            {cards.map((card, i) => {
              const id = `example-${persona}-${i + 1}`;
              return (
                <li key={card.title} className="pf-read-item">
                  <article
                    aria-labelledby={id}
                    className="ds-tile pf-read-tile"
                  >
                    <p className="t-meta pf-read-meta">
                      <span>{label}</span>
                      <span aria-hidden="true">{pad2(i + 1)}</span>
                    </p>
                    <h2 id={id} className="t-lift-title pf-read-title">
                      {card.title}
                    </h2>
                    <p className="t-small pf-read-text">{card.body}</p>
                    <div className="pf-read-foot">
                      <span className="t-meta pf-read-path">{card.href}</span>
                      <ArrowLink href={card.href}>{card.ctaLabel}</ArrowLink>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
