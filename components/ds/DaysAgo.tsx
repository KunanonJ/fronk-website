import { useSyncExternalStore } from "react";
import { dayNumber, formatDay, relativeDay } from "@/lib/utils/relativeDay";

/*
 * A day as "5 days ago" (/open-source and Home's open-source strip,
 * 21-11-26). The server and the first client render show the date, so no
 * relative time is baked into prerendered or cached HTML and hydration
 * never mismatches (as LocalTime). Then the visitor's clock picks the
 * words; a day after the visitor's stays a date. Once words show, the date
 * is the title.
 */

const noUpdates = () => () => {};
const today = () => dayNumber(Date.now());
const onServer = () => null;

export function DaysAgo({ iso }: { iso: string }) {
  const day = useSyncExternalStore(noUpdates, today, onServer);
  const date = formatDay(iso);
  const words = day === null ? null : relativeDay(iso, day);
  return (
    <time dateTime={iso.slice(0, 10)} title={words ? date : undefined}>
      {words ?? date}
    </time>
  );
}
