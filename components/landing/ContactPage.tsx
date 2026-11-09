import { Bento } from "@/components/bento/Bento";
import { EyebrowChip } from "@/components/bento/Chips";
import PlaceCard from "@/components/bento/PlaceCard";
import {
  ElsewhereCard,
  EmailCard,
  WhoCard,
} from "@/components/landing/contact/ContactCards";
import ContactForm from "@/components/landing/contact/ContactForm";
import { contactPage } from "@/lib/content/contact";

/** Contact hero: eyebrow, the two-line h1 (LCP, lines only slide) and lead. */
function ContactHero() {
  const { headline } = contactPage;
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-6">
      <EyebrowChip>{contactPage.eyebrow}</EyebrowChip>
      <h1 id="hero-title" className="kj-lines m-0 text-title text-ink">
        <span className="block">
          <span className="text-ink-3">{headline.muted}</span> {headline.focus}{" "}
          <span className="text-ink-3">{headline.joiner}</span>{" "}
          {headline.focusTail}
        </span>{" "}
        <span className="block">
          {headline.lead} <span className="text-mark">{headline.accent}</span>
        </span>
      </h1>
      <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
        {contactPage.lead}
      </p>
    </section>
  );
}

/**
 * Contact (bento redesign, phase 7b; design spec 4.3). Dense bento: Email
 * over Elsewhere beside the form (two columns, two rows), then Who should
 * write and the Bangkok card, whose "Say hello" jumps to the form.
 */
export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <Bento dense>
        <EmailCard />
        <ContactForm />
        <ElsewhereCard />
        <WhoCard />
        <PlaceCard span={3} ctaHref={`#${contactPage.formId}`} />
      </Bento>
    </>
  );
}
