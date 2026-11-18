import type { ReactNode } from "react";
import SiteFooter from "@/components/profile/site/SiteFooter";
import SiteNav from "@/components/profile/site/SiteNav";

/*
 * Layout for the hidden profile-redesign previews (/preview/*, Phases 0 to 5):
 * the new pill nav over the page and the new footer under it. The chrome is
 * imported here and nowhere else, so the live site's entry chunk does not
 * grow. Phase 6 deletes the previews.
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-page text-ink">
      <a href="#main" className="ds-skip">
        Skip to content
      </a>
      <SiteNav />
      <main id="main" tabIndex={-1} className="pf-main outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
