import { NARRATIVE } from "@/lib/content/homeMarketing";

/**
 * Short founder-ops narrative before the work list.
 */
export function NarrativeBlock() {
  return (
    <section
      aria-labelledby="narrative-heading"
      className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
        <h2 id="narrative-heading" className="sr-only">
          Why this work matters
        </h2>
        <ol className="relative space-y-8 border-l border-border pl-6">
          {NARRATIVE.beats.map((beat) => (
            <li key={beat.label} className="relative">
              <span
                className={`absolute top-1.5 -left-[1.9rem] h-2.5 w-2.5 rounded-full ${
                  "alert" in beat && beat.alert ? "bg-neg" : "bg-fg"
                }`}
                aria-hidden
              />
              <p
                className={`text-xs uppercase tracking-[0.2em] ${
                  "alert" in beat && beat.alert ? "text-neg" : "text-muted"
                }`}
              >
                {beat.label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                {beat.text}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-xl text-muted">{NARRATIVE.closing}</p>
      </div>
    </section>
  );
}
