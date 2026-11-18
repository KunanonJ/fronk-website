import LandingLayout from "@/components/landing/LandingLayout";
import StatusPage, {
  type StatusPageCopy,
} from "@/components/landing/StatusPage";
import { siteConfig } from "@/lib/site";

const COPY: StatusPageCopy = {
  eyebrow: "Page not found",
  headline: { muted: "Nothing", middle: "lives", accent: "here." },
  lead: "Either the URL is stale, or this page never existed. Try one of these instead.",
  status: "404 · Not found",
  seed: 404,
  report: {
    title: "Broken link?",
    subject: `Broken link on ${siteConfig.url}`,
  },
};

/**
 * 404. The root renders it outside the `_landing` layout for every unknown
 * path, so it brings the site chrome itself: LandingLayout's pill nav and
 * footer (profile redesign, Phase 6 cutover). The page body is still
 * the bento StatusPage (design spec 4.20) until Phase 7 (plan step 7f)
 * restyles it. The response status stays 404.
 */
export default function NotFound() {
  return (
    <LandingLayout>
      <StatusPage copy={COPY} />
    </LandingLayout>
  );
}
