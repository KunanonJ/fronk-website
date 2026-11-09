import { ChromeProvider } from "@/components/bento/ChromeContext";
import { usePathname } from "@/lib/router/navigation";
import { cn } from "@/lib/utils/cn";
import SiteFooter from "@/components/bento/SiteFooter";
import SiteHeader from "@/components/bento/SiteHeader";

/**
 * Routes already rebuilt on the canvas layout. The header and footer use the
 * canvas column (1000 px) there and the old 1152 px content width elsewhere, so
 * they line up with each page body while the redesign lands route group by
 * route group. Phase 7g, the last sub-phase, removes this switch.
 */
const BENTO_ROUTES: ReadonlySet<string> = new Set(["/"]);

/** The page column: 24 px gutters (16 px at <=380px). */
function column(pathname: string): string {
  return cn(
    "mx-auto w-full px-6 max-[381px]:px-4",
    // Older pages put a 1152 px box (max-w-6xl) inside their own gutters.
    BENTO_ROUTES.has(pathname) ? "max-w-[1000px]" : "max-w-[75rem]",
  );
}

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
  const pathname = usePathname();
  return (
    <ChromeProvider>
      <div className="landing-root min-h-[100svh] bg-page font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-chip focus:bg-ink focus:px-3 focus:py-2 focus:text-page"
        >
          Skip to content
        </a>
        <div className={cn(column(pathname), "pt-10")}>
          <SiteHeader />
        </div>
        {children}
        <div className={cn(column(pathname), "pb-24")}>
          <SiteFooter />
        </div>
      </div>
    </ChromeProvider>
  );
}
