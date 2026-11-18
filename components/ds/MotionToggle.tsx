import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/*
 * Motion toggle (profile redesign, design spec 6.11; WCAG 2.2.2). Pauses
 * anything that moves for more than 5 s. Its label names what a press will
 * do, with no aria-pressed (both together announce a contradiction). Under
 * reduced motion nothing moves, so it does not render.
 */
export function MotionToggle({
  playing,
  onToggle,
  labels = { pause: "Pause motion", play: "Play motion" },
}: {
  playing: boolean;
  onToggle: (playing: boolean) => void;
  labels?: { pause: string; play: string };
}) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  const Icon = playing ? Pause : Play;
  return (
    <button
      type="button"
      className="ds-motion-toggle"
      aria-label={playing ? labels.pause : labels.play}
      onClick={() => onToggle(!playing)}
    >
      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
