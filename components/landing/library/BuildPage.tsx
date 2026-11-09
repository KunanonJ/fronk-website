import { Bento } from "@/components/bento/Bento";
import {
  CARD,
  FilterBar,
  Kicker,
  LibraryHero,
  MONO_LABEL,
  countLabel,
  type FilterOption,
} from "@/components/landing/library/parts";
import {
  BUILD_VENTURES,
  buildBoard,
  buildColumns,
  buildPage,
  type BuildCard,
  type BuildColumn,
} from "@/lib/content/buildBoard";
import type { BuildFilter } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";

/** Column markers (decorative; the column name carries the meaning). */
const MARKER: Record<BuildColumn, string> = {
  next: "box-border size-[7px] border border-ink-2",
  inProgress: "size-[7px] bg-mark",
  shipped: "size-[7px] bg-ink",
};

/**
 * Shipped takes the full row at two columns (641-1023 px), where Next and In
 * progress sit side by side; at three it is one column like the others.
 */
const SPAN: Record<BuildColumn, string> = {
  next: "",
  inProgress: "",
  shipped: "min-[641px]:col-span-2 lg:col-span-1",
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

function Ticket({
  ticket,
  inProgress,
}: {
  ticket: BuildCard;
  inProgress: boolean;
}) {
  return (
    <li className="flex min-w-0 flex-[1_1_240px] flex-col gap-2 rounded-[18px] border border-hairline bg-page p-4">
      <p className={cn(MONO_LABEL, "flex items-center justify-between gap-2")}>
        <span className="inline-flex items-center gap-2">
          {inProgress ? (
            <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
          ) : null}
          {ticket.id}
        </span>
        <span className="rounded-full border border-hairline-strong px-2 py-0.5">
          {VENTURE_LABEL[ticket.venture]}
        </span>
      </p>
      <h3 className="m-0 text-base font-medium tracking-[-0.01em]">
        {ticket.title}
      </h3>
      <p className="m-0 text-sm leading-[1.5] text-ink-2">{ticket.body}</p>
    </li>
  );
}

/**
 * Build (bento redesign, phase 7f; design spec 4.14): the venture filter,
 * then the board as three column cards (Next, In progress, Shipped) of
 * ticket wells; a column the filter empties says so. The venture is the
 * `?venture=` search param, owned by the route.
 */
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

  return (
    <>
      <LibraryHero
        eyebrow={buildPage.eyebrow}
        headline={buildPage.headline}
        lede={buildPage.description}
      />
      <section aria-label="Board" className="flex flex-col gap-5">
        <FilterBar
          label="Filter tickets by venture"
          options={FILTERS}
          value={venture}
          onChange={onVentureChange}
          result={result}
        />
        <Bento>
          {buildColumns.map((column) => {
            const tickets = buildBoard[column.id].filter(shows);
            const id = `col-${column.id}`;
            return (
              <article
                key={column.id}
                aria-labelledby={id}
                className={cn(CARD, "gap-3.5 px-4 pb-4", SPAN[column.id])}
              >
                <div className="flex items-center justify-between gap-3 px-1">
                  <Kicker id={id} marker={MARKER[column.id]}>
                    {column.label}
                  </Kicker>
                  <span className={cn(MONO_LABEL, "tabular-nums")}>
                    {countLabel(tickets.length, "ticket", "tickets")}
                  </span>
                </div>
                <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                  {tickets.map((ticket) => (
                    <Ticket
                      key={ticket.id}
                      ticket={ticket}
                      inProgress={column.id === "inProgress"}
                    />
                  ))}
                  {tickets.length === 0 ? (
                    <li className="flex-[1_1_240px] rounded-[18px] border border-dashed border-hairline-strong p-4 text-sm text-ink-2">
                      Nothing here for this filter.
                    </li>
                  ) : null}
                </ul>
              </article>
            );
          })}
        </Bento>
      </section>
    </>
  );
}
