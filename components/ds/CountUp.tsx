import { useRef } from "react";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { cn } from "@/lib/utils/cn";

/*
 * A figure that counts up once as it comes into view (lib/hooks/useCountUp.ts):
 * the venture figures on a case page and the metric tiles on /proof. The
 * element holds the real figure as its only text, so it keeps its width and
 * is what screen readers and search read; the frames are drawn over it from
 * `data-shown` (`.ds-count` in globals.css), with empty alt text so they are
 * never read. Without that CSS the real figure simply shows.
 */

function drawText(el: HTMLElement, frame: string | null): void {
  if (frame === null) el.removeAttribute("data-shown");
  else el.setAttribute("data-shown", frame);
}

export function CountUp({
  as: Tag = "span",
  value,
  className,
}: {
  as?: "span" | "dd";
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useCountUp(ref, value, drawText);
  return (
    <Tag ref={ref} className={cn("ds-count", className)}>
      {value}
    </Tag>
  );
}
