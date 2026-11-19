import { ChromeProvider } from "@/components/bento/ChromeContext";
import SharePanelHost from "@/components/bento/SharePanelHost";
import { NavProgress } from "@/components/profile/site/NavProgress";
import SiteFooter from "@/components/profile/site/SiteFooter";
import SiteNav from "@/components/profile/site/SiteNav";

/**
 * Public site shell (profile redesign, Phase 6 cutover; design spec 7 and
 * 13 items 25 and 32): the skip link above the fixed pill nav, the page, and
 * the footer, on every public page and the 404. The nav and the footer carry
 * the redesign's token scope themselves, so they look the same around the
 * pages Phase 7 has not restyled yet; those pages keep the old tokens and get
 * the bar's height as a top offset (src/styles/profile/cutover.css). Pages
 * render their own <main id="main">. `data-site-chrome` on the header and the
 * footer lets print drop them, so the printed résumé (`pnpm pdf`) starts at
 * the top. ChromeProvider and the share panel serve the hero Share pills of
 * the pages Phase 7 restyles. NavProgress draws the line at the top while a
 * navigation loads.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChromeProvider>
      <div className="landing-root min-h-[100svh] bg-page text-ink antialiased">
        {/* Fixed and moved off screen, so print would draw it: the print
            rule in globals.css drops [data-print-hide]. */}
        <a href="#main" className="ds-skip" lang="en" data-print-hide>
          Skip to content
        </a>
        <SiteNav />
        <NavProgress />
        {children}
        <SiteFooter />
        <SharePanelHost />
      </div>
    </ChromeProvider>
  );
}
