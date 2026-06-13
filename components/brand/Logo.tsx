import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  /** Blink the cursor (default). Pass false for a solid, static cursor. */
  blink?: boolean;
}

/**
 * The Fronk logotype: a lowercase "fronk" wordmark closed by a mint terminal
 * cursor block — "I live in the terminal." Replaces the old "Fronk." dot. The
 * cursor is decorative (aria-hidden); the accessible name comes from the
 * surrounding link's aria-label, and the brand name stays "Fronk" everywhere
 * text matters. Reduced-motion users get a solid, non-blinking cursor (the
 * global prefers-reduced-motion block + `motion-reduce:animate-none`).
 */
export function Logo({ className, blink = true }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-display font-bold leading-none tracking-tight",
        className,
      )}
    >
      fronk
      <span
        data-cursor
        aria-hidden
        className={cn(
          "ml-[0.14em] inline-block h-[0.82em] w-[0.42em] translate-y-[0.03em] bg-accent",
          blink && "animate-cursor-blink motion-reduce:animate-none",
        )}
      />
    </span>
  );
}
