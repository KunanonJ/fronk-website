import { footerAgents, socials } from "@/lib/content/landing";

/**
 * 44 px tall, and at least 24 px wide: padding taken back by an equal negative
 * margin widens the tap area without moving the text (the X link's label is
 * one letter). With the rows' 18 px gaps, neighbouring areas stay 1 px apart.
 */
const LINK =
  "-mx-[8.5px] inline-flex min-h-11 min-w-6 items-center justify-center px-[8.5px]";

/**
 * Site footer (bento canvas, design spec 3.9): copyright and socials, plus
 * the owner's compact mono "For agents" row (09-11-26) linking the machine-
 * readable surfaces. Links take the link colour from the `.kj` scope.
 */
export default function SiteFooter() {
  return (
    <footer
      data-site-chrome
      className="kj flex flex-col gap-1 border-t border-hairline pt-6 text-meta text-ink-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Static pages bake the build year; a visit after New Year shows the new one. */}
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} Kunanon Jarat · Bangkok
        </span>
        <span className="flex flex-wrap gap-x-[18px] gap-y-1">
          {socials.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              {item.label}
            </a>
          ))}
        </span>
      </div>
      <nav
        aria-label={footerAgents.label}
        className="flex flex-wrap items-center gap-x-[18px] font-mono text-xs"
      >
        <span className="uppercase tracking-[0.06em]">
          {footerAgents.label}
        </span>
        {footerAgents.links.map((item) => (
          <a key={item.href} href={item.href} className={LINK}>
            {item.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
