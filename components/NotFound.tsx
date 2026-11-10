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
 * 404 (bento canvas NotFound, design spec 4.20). The root renders it outside
 * the `_landing` layout for every unknown path, so it brings the site header
 * and footer itself, on the canvas column. The response status stays 404.
 */
export default function NotFound() {
  return (
    <LandingLayout canvas>
      <StatusPage copy={COPY} />
    </LandingLayout>
  );
}
