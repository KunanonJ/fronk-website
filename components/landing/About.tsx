import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { AnnotatedText } from "@/components/landing/AnnotatedText";
import { Section } from "@/components/ui/Section";
import { about } from "@/lib/content/landing";

/**
 * Home "About" (visual-redesign Phase 2): a short introduction that points to
 * the full /about page. Static text, no reveal animation.
 */
export default function About() {
  return (
    <Section id="about" eyebrow={about.label} heading={about.heading} className="scroll-mt-28 pt-0 md:pt-0 lg:pt-0">
      <div className="max-w-3xl">
        <p className="text-lead text-ink-2">
          <AnnotatedText text={about.body} />
        </p>
        <Link
          href={about.ctaHref}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-page transition-opacity hover:opacity-90"
        >
          {about.ctaLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
