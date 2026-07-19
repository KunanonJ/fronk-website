"use client";

import { useEffect, useState } from "react";
import {
  GITHUB_CONTRIBUTIONS_LOGIN,
  creamFillForLevel,
  emptyContributionCalendar,
  type ContributionCalendar,
} from "@/lib/github/contributions";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

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
      className="mt-16 border-t border-white/10 pt-16 sm:mt-20 sm:pt-20"
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/55 sm:text-xs">
        Activity
      </p>
      <h2
        id="about-activity-heading"
        className="mb-3 text-3xl font-medium tracking-tight text-primary sm:text-4xl"
        style={serif}
      >
        GitHub year
      </h2>
      <p className="mb-6 text-sm text-primary/60">
        {loaded
          ? `${calendar.total.toLocaleString()} contributions · @${GITHUB_CONTRIBUTIONS_LOGIN}`
          : `Loading @${GITHUB_CONTRIBUTIONS_LOGIN}…`}
      </p>

      <div
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
                    className="activity-day block h-[11px] w-[11px] rounded-[3px]"
                    style={{ backgroundColor: creamFillForLevel(day.level) }}
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-primary/50">
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="inline-block h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: creamFillForLevel(level) }}
              aria-hidden
            />
          ))}
          <span>More</span>
        </div>
        <a
          href={`https://github.com/${GITHUB_CONTRIBUTIONS_LOGIN}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          github.com/{GITHUB_CONTRIBUTIONS_LOGIN}
        </a>
      </div>
    </section>
  );
}
