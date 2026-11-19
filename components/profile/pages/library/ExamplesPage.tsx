import { ArrowLink, BlockHead } from "@/components/profile/pages/library/parts";
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
 * /examples (profile redesign, Phase 7 lane D1, plan step 7d): the hero,
 * "Show examples for" with a pickable tile per persona (its number, its count
 * of examples, its name) and the polite result line, then that persona's
 * examples as tiles in a wrapping row. The persona is the `?persona=` search
 * param, owned by the route: the prerendered page shows the default and the
 * param applies after hydration.
 */

/** The persona picker: a tile per persona, the pressed one ringed. */
function PersonaPicker({
  persona,
  onChange,
  result,
}: {
  persona: ExamplePersonaId;
  onChange: (next: ExamplePersonaId) => void;
  result: string;
}) {
  return (
    <div>
      <BlockHead
        id="card-persona"
        title="Show examples for"
        note={result}
        live
      />
      <div role="group" aria-labelledby="card-persona" className="pf-read-flex">
        {EXAMPLE_PERSONAS.map((option, i) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === persona}
            onClick={() => onChange(option.id)}
            className="ds-tile pf-read-pick pf-read-pick--persona"
          >
            <span className="t-meta text-ink-2">
              {pad2(i + 1)} · {examplesByPersona[option.id].length} examples
            </span>
            <span className="t-lift-title">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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
          <PersonaPicker
            persona={persona}
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
