import { useState, type ReactNode } from "react";
import { MotionToggle } from "@/components/ds/MotionToggle";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/*
 * Marquee (profile redesign, design spec 8.3; WCAG 2.2.2). Two copies of the
 * list, the second hidden from assistive technology. It moves only once the
 * page has hydrated and motion is allowed, which is also when its pause
 * control exists: the server HTML, and a page without JavaScript, show a
 * still row. Under reduced motion the CSS shows one still, centred list and
 * the toggle does not render. A parent that moves other things too (the
 * Home hero's headline) can own the play state, so one toggle pauses both.
 */
export function Marquee<T>({
  label,
  items,
  getKey,
  renderItem,
  itemClassName,
  className,
  toggleLabels,
  playing: controlled,
  onPlayingChange,
}: {
  /** Accessible name of the visible list. */
  label: string;
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  itemClassName?: string;
  className?: string;
  /** What the toggle says; "Pause motion" and "Play motion" by default. */
  toggleLabels?: { pause: string; play: string };
  /** The play state, when the parent owns it; the toggle then reports to it. */
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}) {
  const reduced = useReducedMotion();
  const [own, setOwn] = useState(true);
  const playing = controlled ?? own;
  const setPlaying = (next: boolean) => {
    if (controlled === undefined) setOwn(next);
    onPlayingChange?.(next);
  };
  const list = (hidden: boolean) => (
    <ul
      className="ds-marquee__list"
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <li key={getKey(item)} className={itemClassName}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={["flex items-center gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          playing
            ? "ds-marquee min-w-0 flex-1"
            : "ds-marquee ds-marquee--paused min-w-0 flex-1"
        }
        data-running={reduced ? undefined : ""}
      >
        <div className="ds-marquee__track">
          {list(false)}
          {list(true)}
        </div>
      </div>
      <MotionToggle
        playing={playing}
        onToggle={setPlaying}
        labels={toggleLabels}
      />
    </div>
  );
}
