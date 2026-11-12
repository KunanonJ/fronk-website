import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { cn } from "@/lib/utils/cn";

/*
 * Buttons (bento canvas, design spec 3.7). Primary is ink (owner decision
 * 09-11-26): --cta / --oncta, Ink on day and Glaze on night. `btn-cta` gets
 * the hover lift in globals.css. Signal stays for links and markers.
 */

const CTA_BASE =
  "btn-cta inline-flex h-14 items-center justify-center rounded-full font-semibold no-underline";

const CTA_VARIANT = {
  primary: "bg-cta text-on-cta",
  secondary: "border border-hairline-strong bg-surface text-ink",
} as const;

/** lg: hero actions (17 px); md: form submit and card CTAs (16 px); sm: paired card buttons (15 px). */
const CTA_SIZE = {
  lg: "gap-2.5 px-[30px] text-[17px] max-sm:px-4",
  md: "gap-2 px-[30px] text-base",
  sm: "gap-1.5 px-4 text-card",
} as const;

export type CtaVariant = keyof typeof CTA_VARIANT;
export type CtaSize = keyof typeof CTA_SIZE;

/** Classes for a CTA, for the few that are <button>s (the contact submit). */
export function ctaClasses(
  variant: CtaVariant = "primary",
  size: CtaSize = "lg",
): string {
  return cn(CTA_BASE, CTA_VARIANT[variant], CTA_SIZE[size]);
}

export function CtaLink({
  href,
  variant = "primary",
  size = "lg",
  download,
  className,
  children,
}: {
  href: string;
  variant?: CtaVariant;
  size?: CtaSize;
  /** For a file link: the name the browser saves it under. */
  download?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      download={download}
      className={cn(ctaClasses(variant, size), className)}
    >
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
