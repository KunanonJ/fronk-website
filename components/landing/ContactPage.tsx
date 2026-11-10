import { Bento } from "@/components/bento/Bento";
import { EyebrowChip } from "@/components/bento/Chips";
import PlaceCard from "@/components/bento/PlaceCard";
import {
  ElsewhereCard,
  EmailCard,
  RecruiterCard,
  WhoCard,
} from "@/components/landing/contact/ContactCards";
import ContactForm from "@/components/landing/contact/ContactForm";
import type { ContactIntent } from "@/lib/contact/search";
import { contactPage } from "@/lib/content/contact";
import { PageTitle, HeroLead } from "@/components/bento/PageHero";

/** Contact hero: eyebrow, the two-line h1 (LCP, lines only slide) and lead. */
function ContactHero() {
  const { headline } = contactPage;
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-6">
      <EyebrowChip>{contactPage.eyebrow}</EyebrowChip>
      <PageTitle>
        <span className="block">
          <span className="text-ink-3">{headline.muted}</span> {headline.focus}{" "}
          <span className="text-ink-3">{headline.joiner}</span>{" "}
          {headline.focusTail}
        </span>{" "}
        <span className="block">
          {headline.lead} <span className="text-mark">{headline.accent}</span>
        </span>
      </PageTitle>
      <HeroLead>{contactPage.lead}</HeroLead>
    </section>
  );
}

/**
 * Contact (bento redesign, phase 7b; design spec 4.3). Dense bento: Email
 * over Elsewhere beside the form (two columns, two rows), then Who should
 * write beside For recruiters, and the Bangkok card, whose "Say hello" jumps
 * to the form. `intent` comes from `?topic=`: `hiring` readies the form for
 * a recruiter.
 */
export default function ContactPage({
  intent = "general",
}: {
  intent?: ContactIntent;
}) {
  return (
    <>
      <ContactHero />
      <Bento dense>
        <EmailCard />
        <ContactForm intent={intent} />
        <ElsewhereCard />
        <WhoCard />
        <RecruiterCard />
        <PlaceCard span={3} ctaHref={`#${contactPage.formId}`} />
      </Bento>
    </>
  );
}
