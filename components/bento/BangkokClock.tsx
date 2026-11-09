import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

/** "h:mm AM" in Bangkok (no DST, so this always matches GMT+7). */
export function formatBangkokTime(ms: number, timeZone = "Asia/Bangkok") {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}

/** Ticks on each minute boundary, so the shown time is never a minute stale. */
function subscribe(onTick: () => void): () => void {
  let interval: number | undefined;
  const timeout = window.setTimeout(
    () => {
      onTick();
      interval = window.setInterval(onTick, MINUTE);
    },
    MINUTE - (Date.now() % MINUTE),
  );
  return () => {
    window.clearTimeout(timeout);
    window.clearInterval(interval);
  };
}

/** The current minute: stable between renders until the next tick. */
const getMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;
const getServerMinute = () => null;

/**
 * The live Bangkok clock. The HTML is edge-cached, so the server renders an
 * empty fixed-width slot and the time appears after hydration. No
 * aria-live: a ticking clock must not announce.
 */
export default function BangkokClock({ timeZone }: { timeZone: string }) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  return (
    <time
      dateTime={minute === null ? undefined : new Date(minute).toISOString()}
      className="inline-block min-w-[8ch] tabular-nums"
    >
      {minute === null ? "" : formatBangkokTime(minute, timeZone)}
    </time>
  );
}
