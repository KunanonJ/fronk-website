import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { cn } from "@/lib/utils/cn";

/*
 * Buttons (bento canvas, design spec 3.7). Primary is ink (owner decision
 * 09-11-26): --cta / --oncta, Ink on day and Glaze on night. `btn-cta` gets
 * the hover lift in globals.css. Signal stays for links and markers.
 */

const CTA_BASE =
  "btn-cta inline-flex h-14 items-center justify-center rounded-full px-[30px] text-[17px] font-semibold no-underline";

const CTA_VARIANT = {
  primary: "bg-cta text-on-cta",
  secondary: "border border-hairline-strong bg-surface text-ink",
} as const;

export function CtaLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof CTA_VARIANT;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(CTA_BASE, CTA_VARIANT[variant], className)}>
      {children}
    </Link>
  );
}

/** Glass button for text on the Bangkok scene. */
export function GlassLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "kj-glass inline-flex min-h-11 items-center justify-center rounded-full border border-glass-2 bg-glass px-[26px] text-card font-medium text-on-photo no-underline backdrop-blur-[10px]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
