import { ENGAGE_STEPS } from "@/lib/content/homeMarketing";

/**
 * How to start working together.
 */
export function ThreeStepEngage() {
  return (
    <section
      aria-labelledby="engage-heading"
      className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <h2
        id="engage-heading"
        className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
      >
        {ENGAGE_STEPS.heading}
      </h2>
      <p className="mt-3 max-w-xl text-muted">{ENGAGE_STEPS.subcopy}</p>
      <ol className="mt-12 grid gap-8 sm:grid-cols-3">
        {ENGAGE_STEPS.steps.map((step) => (
          <li key={step.n} className="space-y-3">
            <div className="flex h-28 items-end rounded-xl border border-border bg-surface p-4">
              <span className="font-display text-4xl font-semibold text-muted">
                {step.n}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-fg">
              {step.title}
            </h3>
            <p className="text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
