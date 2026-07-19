"use client";

import LibraryPageShell from "@/components/landing/LibraryPageShell";
import {
  buildBoard,
  buildColumns,
  buildPage,
} from "@/lib/content/buildBoard";

export default function BuildPage() {
  return (
    <LibraryPageShell
      eyebrow={buildPage.eyebrow}
      title={buildPage.title}
      description={buildPage.description}
      navId="build-mobile-nav"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {buildColumns.map((column) => {
          const cards = buildBoard[column.id];
          return (
            <section
              key={column.id}
              aria-labelledby={`build-${column.id}`}
              className="rounded-2xl border border-white/10 bg-[#101010]/80 p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2
                  id={`build-${column.id}`}
                  className="text-sm font-medium uppercase tracking-[0.14em] text-primary/60"
                >
                  {column.label}
                </h2>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-primary/45">
                  {cards.length}
                </span>
              </div>
              <ul className="space-y-3">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    className="rounded-xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="font-mono text-[10px] tracking-wide text-primary/40">
                      {card.id}
                      {card.venture ? (
                        <span className="ml-2 text-primary/30">
                          · {card.venture}
                        </span>
                      ) : null}
                    </p>
                    <h3 className="mt-2 text-sm font-medium text-primary">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-primary/65">
                      {card.body}
                    </p>
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
