import { ChromeProvider } from "@/components/bento/ChromeContext";
import SiteFooter from "@/components/bento/SiteFooter";
import SiteHeader from "@/components/bento/SiteHeader";

/** The canvas page column: 1000 px, 24 px gutters (16 px at <=380px). */
const COLUMN = "mx-auto w-full max-w-[1000px] px-6 max-[381px]:px-4";

/**
 * Public site shell (bento redesign, phase 7a): skip link, the canvas header
 * and footer around every page. Pages render their own <main id="main">;
 * redesigned pages use the same 1000 px column, older ones keep their width
 * until their sub-phase restyles them. Also wraps the 404 page.
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
        <div className={`${COLUMN} pt-10`}>
          <SiteHeader />
        </div>
        {children}
        <div className={`${COLUMN} pb-24`}>
          <SiteFooter />
        </div>
      </div>
    </ChromeProvider>
  );
}
