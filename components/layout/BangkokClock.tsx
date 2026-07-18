"use client";

import { useEffect, useState } from "react";

const TIME_ZONE = "Asia/Bangkok";

function formatBangkokTime(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

/** Live Bangkok clock — client-only to avoid hydration mismatch. */
export function BangkokClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatBangkokTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (time === null) {
    return (
      <span className="tabular-nums text-fg" aria-hidden>
        --:--:--
      </span>
    );
  }

  return (
    <time
      className="tabular-nums text-fg"
      aria-label={`Local time in Bangkok ${time}`}
    >
      {time}
    </time>
  );
}
