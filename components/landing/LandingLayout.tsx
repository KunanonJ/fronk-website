import { ChromeProvider } from "@/components/bento/ChromeContext";
import SiteFooter from "@/components/bento/SiteFooter";
import SiteHeader from "@/components/bento/SiteHeader";

/** The canvas page column: 1000 px, 24 px gutters (16 px at <=380px). */
const COLUMN = "mx-auto w-full max-w-[1000px] px-6 max-[381px]:px-4";

/**
 * Public site shell (bento canvas): skip link, the header and footer around
 * every page on the 1000 px column the page bodies use. Pages render their
 * own <main id="main">. Also wraps the 404 page.
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChromeProvider>
      <div className="landing-root min-h-[100svh] bg-page font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-chip focus:bg-ink focus:px-3 focus:py-2 focus:text-page"
        >
          Skip to content
        </a>
        {/* data-site-chrome: print drops the header and footer with their
            padding, so the printed résumé (`pnpm pdf`) starts at the top. */}
        <div data-site-chrome className={`${COLUMN} pt-10`}>
          <SiteHeader />
        </div>
        {children}
        <div data-site-chrome className={`${COLUMN} pb-24`}>
          <SiteFooter />
        </div>
      </div>
    </ChromeProvider>
  );
}
