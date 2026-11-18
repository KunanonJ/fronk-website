import {
  BlockHead,
  FilterBar,
  countLabel,
  type FilterOption,
} from "@/components/profile/pages/library/parts";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import {
  BUILD_VENTURES,
  buildBoard,
  buildColumns,
  buildPage,
  type BuildCard,
  type BuildColumn,
} from "@/lib/content/buildBoard";
import type { BuildFilter } from "@/lib/library/search";

/*
 * /build (profile redesign, Phase 7 lane D1, plan step 7d): the hero, the
 * venture filter, then the board's three columns (Next, In progress,
 * Shipped) as tiles of tickets; a column the filter empties says so. The
 * venture is the `?venture=` search param, owned by the route; the
 * prerendered page shows the whole board.
 */

/** Column markers (decorative; the column name carries the meaning). */
const MARKER: Record<BuildColumn, string> = {
  next: "pf-read-marker--line",
  inProgress: "pf-read-marker--accent",
  shipped: "pf-read-marker--ink",
};

const ALL_TICKETS: readonly BuildCard[] = buildColumns.flatMap(
  (column) => buildBoard[column.id],
);

const VENTURE_LABEL = Object.fromEntries(
  BUILD_VENTURES.map((venture) => [venture.id, venture.label]),
) as Record<BuildCard["venture"], string>;

const FILTERS: readonly FilterOption<BuildFilter>[] = [
  { id: "all", label: "All", count: ALL_TICKETS.length },
  ...BUILD_VENTURES.map((venture) => ({
    id: venture.id,
    label: venture.label,
    count: ALL_TICKETS.filter((ticket) => ticket.venture === venture.id).length,
  })),
];

function Ticket({ ticket }: { ticket: BuildCard }) {
  return (
    <li className="pf-read-ticket">
      <p className="t-meta pf-read-meta">
        <span>{ticket.id}</span>
        <span className="ds-chip">{VENTURE_LABEL[ticket.venture]}</span>
      </p>
      <h3 className="t-meta-value">{ticket.title}</h3>
      <p className="t-small text-ink-2">{ticket.body}</p>
    </li>
  );
}

export default function BuildPage({
  venture,
  onVentureChange,
}: {
  venture: BuildFilter;
  onVentureChange: (next: BuildFilter) => void;
}) {
  const shows = (ticket: BuildCard) =>
    venture === "all" || ticket.venture === venture;
  const shown = ALL_TICKETS.filter(shows).length;
  const picked = FILTERS.find((f) => f.id === venture) ?? FILTERS[0];
  const result =
    venture === "all"
      ? `${shown} tickets on the board`
      : `${shown} of ${ALL_TICKETS.length} tickets · ${picked.label}`;
  const { headline } = buildPage;

  return (
    <>
      <ReadingHero
        eyebrow={buildPage.eyebrow}
        title={
          <SegmentHeadline
            lines={[...headline.lines, [headline.accent]]}
            joiner=" "
          />
        }
        lead={buildPage.description}
      />
      <section aria-label="Board" className="ds-wrap pf-read-body">
        <div>
          <FilterBar
            label="Filter tickets by venture"
            options={FILTERS}
            value={venture}
            onChange={onVentureChange}
            result={result}
          />
          <div className="pf-read-board pf-read-board--build">
            {buildColumns.map((column) => {
              const tickets = buildBoard[column.id].filter(shows);
              const id = `col-${column.id}`;
              return (
                <article
                  key={column.id}
                  aria-labelledby={id}
                  className="ds-tile pf-read-tile"
                >
                  <BlockHead
                    id={id}
                    title={column.label}
                    marker={MARKER[column.id]}
                    note={countLabel(tickets.length, "ticket", "tickets")}
                  />
                  <ul className="pf-read-tickets">
                    {tickets.map((ticket) => (
                      <Ticket key={ticket.id} ticket={ticket} />
                    ))}
                    {tickets.length === 0 ? (
                      <li className="pf-read-ticket pf-read-ticket--empty t-small">
                        Nothing here for this filter.
                      </li>
                    ) : null}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
