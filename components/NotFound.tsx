import LandingLayout from "@/components/landing/LandingLayout";
import StatusPage, {
  type StatusPageCopy,
} from "@/components/landing/StatusPage";
import { NOT_FOUND_ART } from "@/components/landing/statusArt";
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

/**
 * 404 (profile redesign Phase 7f; design spec 13 item 18). The root renders
 * it outside the `_landing` layout for every unknown path, so it brings the
 * site's nav and footer itself. The response status stays 404.
 */
export default function NotFound() {
  return (
    <LandingLayout>
      <StatusPage copy={COPY} />
    </LandingLayout>
  );
}
