import { cn } from "@/lib/utils/cn";
import { brand } from "@/lib/brand/tokens";

interface LogoProps {
  className?: string;
  /** @deprecated FogLAMP cursor blink — ignored; kept for call-site compat. */
  blink?: boolean;
}

/**
 * KunanonJ wordmark — cream-forward brand mark for residual shell chrome.
 * Landing primary nav uses its own wordmark string; this keeps shared Logo
 * callers aligned with CI (no mint terminal cursor).
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium leading-none tracking-wide text-primary",
        className,
      )}
    >
      {brand.wordmark}
    </span>
  );
}
