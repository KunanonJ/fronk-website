import { useSyncExternalStore, type ReactNode } from "react";

/*
 * The time in a place, to the minute (the footer's "Now" line, premium
 * interactions item 7). Client only: the server and the first client render
 * draw nothing, so no time is baked into cached HTML, and it never mismatches
 * on hydration. Then it moves on at each minute. Not a live region: screen
 * readers read it where it is, and are not told each minute. `children` is
 * drawn after it, given the hour there, and moves on with it: the footer's
 * guess (living status), which has no timer of its own.
 */

const MINUTE = 60_000;

/** Calls back at the start of every minute. */
function subscribe(onMinute: () => void): () => void {
  let timer = 0;
  const schedule = () => {
    timer = window.setTimeout(
      () => {
        onMinute();
        schedule();
      },
      MINUTE - (Date.now() % MINUTE) + 20,
    );
  };
  schedule();
  return () => window.clearTimeout(timer);
}

const minuteNow = () => Math.floor(Date.now() / MINUTE);
const noMinute = () => null;

export function LocalTime({
  timeZone,
  className,
  children,
}: {
  timeZone: string;
  className?: string;
  /** Drawn after the time, given the hour there (0 to 23). */
  children?: (hour: number) => ReactNode;
}) {
  const minute = useSyncExternalStore(subscribe, minuteNow, noMinute);
  if (minute === null) return null;
  const at = new Date(minute * MINUTE);
  const text = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).format(at);
  return (
    <>
      <time dateTime={at.toISOString()} className={className} data-clock="">
        {text}
      </time>
      {children?.(+text.slice(0, 2))}
    </>
  );
}
