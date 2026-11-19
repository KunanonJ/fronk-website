import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BentoCard, CardTitle } from "@/components/bento/Bento";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import {
  GITHUB_CONTRIBUTIONS_LOGIN,
  activityLevelClass,
  emptyContributionCalendar,
  type ContributionCalendar,
} from "@/lib/github/contributions";

const LEVELS = [0, 1, 2, 3, 4] as const;

function dayTitle(date: string, count: number): string {
  const noun = count === 1 ? "contribution" : "contributions";
  return `${date} · ${count} ${noun}`;
}

/**
 * About "Activity" card (bento canvas, design spec 4.2): the last year of
 * real GitHub contributions from /api/github/contributions, never the
 * canvas's illustrative grid. Square cells in the accent colour at four
 * strengths fill the tile's width (8 px at least, so the grid scrolls
 * sideways in a focusable region on phones; about 19 px at most). Until
 * the data arrives (or if GitHub is down) it shows an empty year.
 *
 * With motion allowed, the year fills in week by week, left to right: when
 * the data arrives in view, or, for a card still below the fold, once it
 * comes into view (`data-wait` holds the cells empty until then, as Reveal
 * holds its blocks). Under reduced motion, or without
 * IntersectionObserver, the cells are simply there. Styles:
 * `.pf-activity*` in src/styles/profile/cutover.css.
 */
export default function ContributionActivity() {
  const [calendar, setCalendar] = useState<ContributionCalendar>(() =>
    emptyContributionCalendar(),
  );
  const [loaded, setLoaded] = useState(false);
  const grid = useRef<HTMLDivElement>(null);

  // The fill-in waits for the card to come into view (see above). An
  // attribute, not state, as Reveal does: nothing renders again.
  useEffect(() => {
    const el = grid.current;
    if (
      !el ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined" ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }
    el.setAttribute("data-wait", "");
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        el.removeAttribute("data-wait");
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.removeAttribute("data-wait");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/github/contributions");
        if (!res.ok) throw new Error("unavailable");
        const data = (await res.json()) as ContributionCalendar;
        if (!cancelled && Array.isArray(data.weeks)) {
          setCalendar(data);
        }
      } catch {
        if (!cancelled) setCalendar(emptyContributionCalendar());
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = `@${GITHUB_CONTRIBUTIONS_LOGIN}`;

  return (
    <BentoCard
      id="activity"
      headingId="card-activity"
      title="Activity"
      span={2}
      minHeight={false}
      className="scroll-mt-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
        <CardTitle>GitHub year</CardTitle>
        <p className="m-0 font-mono text-meta text-ink-2">
          {loaded && calendar.total > 0
            ? `${calendar.total.toLocaleString("en-US")} contributions · ${login}`
            : login}
        </p>
      </div>

      <div
        role="region"
        aria-label="Contribution grid, scrolls sideways"
        tabIndex={0}
        className="flex min-h-[104px] flex-1 items-center overflow-x-auto rounded-well border border-hairline bg-page px-3.5 py-[18px]"
      >
        {/* role="img": with no data every cell is unnamed, so the label sits
            on a role that takes a name. Days carry a native tooltip. */}
        <div
          ref={grid}
          role="img"
          aria-label={`GitHub contribution activity for the past year, ${login}`}
          className="pf-activity__grid"
        >
          {calendar.weeks.map((week, wi) => (
            <span
              key={wi}
              className="pf-activity__week"
              // The week's place in the fill-in (cutover.css).
              style={{ "--w": wi } as CSSProperties}
            >
              {week.days.map((day, di) => (
                <span
                  key={`${wi}-${di}`}
                  title={day.date ? dayTitle(day.date, day.count) : undefined}
                  className={`pf-activity__day ${activityLevelClass(day.level)}`}
                />
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
        <p className="m-0 flex items-center gap-[5px] text-xs text-ink-2">
          <span className="mr-[3px]">Less</span>
          {LEVELS.map((level) => (
            <span
              key={level}
              aria-hidden
              className={`size-2 rounded-[2px] ${activityLevelClass(level)}`}
            />
          ))}
          <span className="ml-[3px]">More</span>
        </p>
        <a
          href={`https://github.com/${GITHUB_CONTRIBUTIONS_LOGIN}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-medium no-underline"
        >
          github.com/{GITHUB_CONTRIBUTIONS_LOGIN} →
        </a>
      </div>
    </BentoCard>
  );
}
