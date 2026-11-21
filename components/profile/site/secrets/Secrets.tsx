import { useEffect, useState } from "react";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { ProfileLink } from "@/components/profile/site/ProfileLink";
import { PORTRAIT_SMALL } from "@/lib/brand/pixelPortrait";
import { TRAITS_EVENT, type TraitNews } from "@/lib/brand/traitEvents";
import { KONAMI_LENGTH, konamiStep } from "@/lib/secrets/konami";

/*
 * The site's secrets in the shell (now-building-and-genz Phase 3), small
 * because every page loads it: a key listener for the Konami code, which
 * loads the pixel party, and a listener for found traits, which loads the
 * toast. Nothing renders until one comes, so a page at rest is as it was.
 * The toast is handed the drawing, the portrait and the link the shell
 * already has, so its lazy chunk adds no new ties to the shared chunks.
 */

const TraitToast = lazyFeature(
  () => import("@/components/profile/site/secrets/TraitToast"),
);

export function Secrets() {
  const [news, setNews] = useState<{ said: TraitNews; at: number } | null>(
    null,
  );

  useEffect(() => {
    let at = 0;
    const onKey = (event: KeyboardEvent) => {
      at = konamiStep(at, event);
      if (at < KONAMI_LENGTH) return;
      at = 0;
      void import("@/components/profile/site/secrets/pixelParty").then(
        (party) => party.startParty(),
      );
    };
    const onTraits = (event: Event) => {
      const said = (event as CustomEvent<TraitNews | null>).detail;
      if (said) setNews({ said, at: event.timeStamp });
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(TRAITS_EVENT, onTraits);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(TRAITS_EVENT, onTraits);
    };
  }, []);

  return news ? (
    <FeatureBoundary key={news.at}>
      <TraitToast
        news={news.said}
        base={PORTRAIT_SMALL}
        Portrait={PixelPortrait}
        Link={ProfileLink}
        onClose={() => setNews(null)}
      />
    </FeatureBoundary>
  ) : null;
}
