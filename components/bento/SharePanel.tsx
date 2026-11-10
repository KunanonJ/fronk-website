import { useEffect, useRef, useState } from "react";
import { PANEL } from "@/components/bento/classes";
import ShareRows, { type ShareTarget } from "@/components/bento/ShareRows";
import { cn } from "@/lib/utils/cn";

/** The page being shared: its head() title and canonical URL, as rendered. */
export function readShareTarget(): ShareTarget {
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  return {
    title: document.title,
    url: canonical?.href || window.location.href,
  };
}

/**
 * Header share panel (bento canvas). Mounted only while open, on the client,
 * so it reads the live title and canonical URL. "Link copied" stays until the
 * panel is reopened. "More options" (the native share sheet) shows only where
 * navigator.share exists. Focus moves to the first row on open.
 */
export default function SharePanel() {
  const [target] = useState(readShareTarget);
  // The title is the page's own, in the page's language (Thai on a Thai
  // hub), while the header around this panel declares English.
  const [pageLang] = useState(() => document.documentElement.lang || undefined);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>("button, a[href]")
      ?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      ref={ref}
      id="share-panel"
      aria-label="Share this page"
      className={cn(PANEL, "w-[340px]")}
    >
      <p className="mx-3 mt-1 text-meta text-ink-2">Share</p>
      <p
        lang={pageLang}
        className="mx-3 mt-0.5 mb-2.5 text-card leading-[1.35] font-semibold"
      >
        {target.title}
      </p>
      <ShareRows target={target} showUrl />
    </section>
  );
}
