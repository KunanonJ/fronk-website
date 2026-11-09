"use client";

import { useEffect, useState } from "react";
import {
  GITHUB_CONTRIBUTIONS_LOGIN,
  activityLevelClass,
  emptyContributionCalendar,
  type ContributionCalendar,
} from "@/lib/github/contributions";

function dayTitle(date: string, count: number): string {
  if (!date) return "No data";
  const noun = count === 1 ? "contribution" : "contributions";
  return `${date} · ${count} ${noun}`;
}

export default function ContributionActivity() {
  const [calendar, setCalendar] = useState<ContributionCalendar>(() =>
    emptyContributionCalendar(),
  );
  const [loaded, setLoaded] = useState(false);

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

  return (
    <section
      id="activity"
      aria-labelledby="about-activity-heading"
      className="mt-16 border-t border-hairline pt-16 sm:mt-20 sm:pt-20"
    >
      <p className="mb-3 font-mono text-label uppercase text-ink-2">Activity</p>
      <h2
        id="about-activity-heading"
        className="mb-3 font-display text-h2 text-ink"
      >
        GitHub year
      </h2>
      <p className="mb-6 text-small text-ink-2">
        {loaded
          ? `${calendar.total.toLocaleString()} contributions · @${GITHUB_CONTRIBUTIONS_LOGIN}`
          : `Loading @${GITHUB_CONTRIBUTIONS_LOGIN}…`}
      </p>

      {/* role="img": aria-label is prohibited on a role-less div, and with no
          data (API down, no GITHUB_TOKEN) every day cell is aria-hidden, so the
          label must sit on a role that takes a name. */}
      <div
        role="img"
        className="activity-scroll overflow-x-auto pb-2"
        aria-label="GitHub contribution activity for the past year"
      >
        <div className="inline-flex gap-1">
          {calendar.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.days.map((day, di) => {
                const tip = day.date ? dayTitle(day.date, day.count) : undefined;
                return (
                  <span
                    key={`${wi}-${di}`}
                    className={`activity-day block h-[11px] w-[11px] rounded-[3px] ${activityLevelClass(day.level)}`}
                    title={tip}
                    data-tooltip={tip}
                    aria-hidden={!day.date}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-2">
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`inline-block h-2.5 w-2.5 rounded-[2px] ${activityLevelClass(level)}`}
              aria-hidden
            />
          ))}
          <span>More</span>
        </div>
        <a
          href={`https://github.com/${GITHUB_CONTRIBUTIONS_LOGIN}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center text-link underline-offset-4 hover:underline"
        >
          github.com/{GITHUB_CONTRIBUTIONS_LOGIN}
        </a>
      </div>
    </section>
  );
}
