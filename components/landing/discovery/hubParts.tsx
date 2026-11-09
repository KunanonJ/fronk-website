import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Type classes for the discovery hubs (visual-redesign Phase 5). Thai needs
 * room for marks above and below the line and no negative tracking, so Thai
 * pages relax the display line-height and letter-spacing; the eyebrow uses
 * the sans stack there, because Geist Mono has no Thai glyphs.
 */
export function hubType(th: boolean) {
  return {
    eyebrow: cn(
      "mb-3 text-label uppercase text-ink-2",
      th ? "font-sans" : "font-mono",
    ),
    h1: cn(
      "font-display text-h1 text-ink",
      th && "leading-[1.3] tracking-normal",
    ),
    h2: cn(
      "font-display text-h3 text-ink",
      th && "leading-[1.45] tracking-normal",
    ),
    lead: cn("text-lead", th && "tracking-normal"),
  };
}

/** A hub section under a hairline, with a Geist h2. */
export function HubSection({
  title,
  id,
  th = false,
  children,
}: {
  title: string;
  id?: string;
  th?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className="mt-16 border-t border-hairline pt-12"
      aria-labelledby={id}
    >
      <h2 id={id} className={cn("mb-6", hubType(th).h2)}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Internal links as full-width rows (48 px targets) with a trailing arrow. */
export function HubLinkList({
  links,
}: {
  links: readonly { label: string; href: string }[];
}) {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group flex min-h-12 items-center justify-between gap-4 py-3 text-body text-ink transition-colors hover:text-link"
          >
            {link.label}
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-ink-2 transition-colors group-hover:text-link"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
