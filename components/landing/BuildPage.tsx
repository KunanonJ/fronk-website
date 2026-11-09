import LibraryPageShell from "@/components/landing/LibraryPageShell";
import {
  buildBoard,
  buildColumns,
  buildPage,
  type BuildColumn,
} from "@/lib/content/buildBoard";
import { cn } from "@/lib/utils/cn";

/** Decorative column marker; the column name carries the meaning. */
const MARKER: Record<BuildColumn, string> = {
  next: "border border-ink-2 bg-transparent",
  inProgress: "bg-signal",
  shipped: "bg-ink",
};

/**
 * Build board (visual-redesign Phase 5): three columns on the Mist well,
 * Paper cards with a 12 px mono ticket line.
 */
export default function BuildPage() {
  return (
    <LibraryPageShell
      eyebrow={buildPage.eyebrow}
      title={buildPage.title}
      description={buildPage.description}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {buildColumns.map((column) => {
          const cards = buildBoard[column.id];
          return (
            <section
              key={column.id}
              aria-labelledby={`build-${column.id}`}
              className="rounded-card border border-hairline bg-well p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-4">
                <h2
                  id={`build-${column.id}`}
                  className="inline-flex items-center gap-2.5 font-mono text-label uppercase text-ink"
                >
                  <span
                    aria-hidden
                    className={cn("size-2 shrink-0", MARKER[column.id])}
                  />
                  {column.label}
                </h2>
                <span className="font-mono text-label tabular-nums text-ink-2">
                  {cards.length}
                  <span className="sr-only">
                    {" "}
                    {cards.length === 1 ? "item" : "items"}
                  </span>
                </span>
              </div>
              <ul className="space-y-3">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    className="rounded-input border border-hairline bg-surface p-4 sm:p-5"
                  >
                    <p className="font-mono text-label uppercase text-ink-2">
                      {card.id}
                      {card.venture ? <> · {card.venture}</> : null}
                    </p>
                    <h3 className="mt-2 text-body font-medium text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-small text-ink-2">{card.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </LibraryPageShell>
  );
}
