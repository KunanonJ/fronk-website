import LandingLayout from "@/components/landing/LandingLayout";
import StatusPage, {
  type StatusPageCopy,
} from "@/components/landing/StatusPage";
import { NOT_FOUND_ART } from "@/components/landing/statusArt";
import {
  PixelArt,
  pixelBeats,
  pixelCells,
  playBeats,
} from "@/components/profile/site/PixelArt";
import { FeatureBoundary, lazyFeature } from "@/components/ui/LazyFeature";
import { siteConfig } from "@/lib/site";

const COPY: StatusPageCopy = {
  eyebrow: "Page not found",
  headline: { muted: "Nothing", middle: "lives", accent: "here." },
  lead: "Either the URL is stale, or this page never existed. Try one of these instead.",
  status: "404 · Not found",
  art: NOT_FOUND_ART,
  report: {
    title: "Broken link?",
    subject: `Broken link on ${siteConfig.url}`,
  },
};

/** The 404 you fix (now-building-and-genz Phase 6): only this page loads it. */
const PatchArt = lazyFeature(() => import("@/components/landing/PatchArt"));

/**
 * 404 (profile redesign Phase 7f; design spec 13 item 18). The root renders
 * it outside the `_landing` layout for every unknown path, so it brings the
 * site's nav and footer itself. The response status stays 404. Its drawing
 * is the game (PatchArt), drawn whole until that loads, or for good if it
 * fails to.
 */
export default function NotFound() {
  return (
    <LandingLayout>
      <StatusPage
        copy={COPY}
        art={
          <FeatureBoundary
            fallback={
              <PixelArt rows={NOT_FOUND_ART} className="pf-status__art" />
            }
          >
            <PatchArt
              rows={NOT_FOUND_ART}
              cells={pixelCells}
              beats={pixelBeats}
              play={playBeats}
            />
          </FeatureBoundary>
        }
      />
    </LandingLayout>
  );
}
