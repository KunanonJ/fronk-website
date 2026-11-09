import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import {
  contact,
  footerLibrary,
  footerResources,
  footerWork,
  socials,
} from "@/lib/content/landing";

const LINK =
  "inline-flex min-h-8 min-w-8 items-center text-sm text-ink-2 underline-offset-4 transition-colors hover:text-ink hover:underline";

function FooterColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <MonoLabel className="mb-3">
        {label}
      </MonoLabel>
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  );
}

/**
 * Global landing footer (visual-redesign Phase 1): a contact block, three link
 * columns (Work, Library, Elsewhere) and an oversized name wordmark. Mounted
 * from the landing layout so every public page shares it. `id="contact"`
 * stays: older links point at `/#contact`.
 */
export default function LandingSiteFooter() {
  return (
    <footer
      id="contact"
      className="scroll-mt-28 overflow-hidden border-t border-hairline bg-page text-ink"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <MonoLabel>{contact.label}</MonoLabel>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-flex min-h-11 items-center break-all text-h3 text-ink underline-offset-4 hover:underline"
            >
              {contact.email}
            </a>
            <p className="mt-3 max-w-sm text-small text-ink-2">{contact.tagline}</p>
            <Link
              href={contact.ctaHref}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-page transition-opacity hover:opacity-90"
            >
              {contact.ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7"
          >
            <FooterColumn label="Work">
              {footerWork.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>
            <FooterColumn label="Library">
              {footerLibrary.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>
            <FooterColumn label="Elsewhere">
              {socials.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noreferrer" className={LINK}>
                    {item.label}
                  </a>
                </li>
              ))}
              {footerResources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`${LINK} font-mono`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>
          </nav>
        </div>

        {/* Decorative: the name is already in the page text and the head. */}
        <p
          aria-hidden
          className="mt-16 select-none font-display text-[clamp(4.5rem,18vw,15rem)] leading-[0.8] font-semibold tracking-[-0.06em] text-ink md:mt-24"
        >
          Kunanon
        </p>

        <div className="flex flex-col gap-2 border-t border-hairline py-6 text-small text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Kunanon Jarat. Bangkok, Thailand.</p>
          <p className="font-mono text-label uppercase">Built in Bangkok</p>
        </div>
      </div>
    </footer>
  );
}
