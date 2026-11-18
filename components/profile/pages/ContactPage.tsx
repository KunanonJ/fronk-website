import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/bento/icons";
import { TextLink } from "@/components/ds/TextLink";
import ContactForm, {
  contactMailto,
} from "@/components/landing/contact/ContactForm";
import { PageHero } from "@/components/profile/pages/PageHero";
import {
  RecruiterLines,
  RecruiterLinks,
} from "@/components/profile/pages/RecruiterFacts";
import type { ContactIntent } from "@/lib/contact/search";
import { aboutPage } from "@/lib/content/aboutPage";
import {
  contactElsewhere,
  contactNextLinks,
  contactPage,
  contactRecruiterLinks,
} from "@/lib/content/contact";
import { contactHeadline } from "@/lib/content/corePages";
import { composeHref, sayHello } from "@/lib/content/profileChrome";
import { writeClipboard } from "@/lib/utils/clipboard";

/*
 * /contact (profile redesign, Phase 6 cutover; plan step 6d): the hero in the
 * new style, the form beside "Email me directly" (with the Say hello
 * actions) and "Elsewhere", then "Who should write" beside "For recruiters".
 * The Bangkok card is retired (umbrella input R14): the footer carries
 * "Bangkok, GMT+7". The form keeps its labels, autocomplete, aria-invalid and
 * aria-describedby, 16 px inputs, focus on the first invalid field, and
 * aria-busy while sending. `intent` comes from `?topic=`: `hiring` readies
 * the form for a recruiter. Styles: `.pf-contact*` in
 * src/styles/profile/cutover.css.
 */

const COPY_RESET_MS = 2000;

/** Email me directly: the address, and the Say hello popover's actions. */
function EmailTile() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <article aria-labelledby="card-email" className="ds-tile pf-contact__tile">
      <h2 id="card-email" className="t-meta pf-contact__label">
        {contactPage.directLabel}
      </h2>
      <a href={contactMailto} className="pf-contact__address">
        {contactPage.email}
      </a>
      <ul className="pf-contact__actions">
        <li>
          <button
            type="button"
            className="pf-contact__action"
            onClick={() => {
              void writeClipboard(contactPage.email).then((ok) => {
                if (!ok) return;
                setCopied(true);
                window.clearTimeout(timer.current);
                timer.current = window.setTimeout(
                  () => setCopied(false),
                  COPY_RESET_MS,
                );
              });
            }}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon />}
            <span aria-live="polite">
              {copied ? contactPage.emailCopied : contactPage.copyEmail}
            </span>
          </button>
        </li>
        <li>
          <TextLink
            href={composeHref(contactPage.email)}
            external
            arrow="up-right"
          >
            {sayHello.compose}
          </TextLink>
        </li>
        <li>
          <TextLink href={`mailto:${contactPage.email}`}>
            {sayHello.mailApp}
          </TextLink>
        </li>
      </ul>
    </article>
  );
}

/** Elsewhere: every public profile, with its address. */
function ElsewhereTile() {
  return (
    <article
      aria-labelledby="card-elsewhere"
      className="ds-tile pf-contact__tile"
    >
      <h2 id="card-elsewhere" className="t-meta pf-contact__label">
        {contactPage.elsewhereTitle}
      </h2>
      <ul className="pf-contact__profiles">
        {contactElsewhere.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="me noopener noreferrer"
              className="pf-contact__profile"
            >
              <span className="pf-contact__profile-name">
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span className="t-meta pf-contact__profile-url">
                {item.href.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Who should write: the invitation from About's "Now" copy, read big. Its
 * "say hello" link points at the form on this page.
 */
function WhoTile() {
  const spans = aboutPage.now.paragraphs[1].spans;
  return (
    <article
      aria-labelledby="card-who"
      className="ds-tile ds-tile--tint pf-contact__tile"
    >
      <h2 id="card-who" className="t-meta pf-contact__label">
        {contactPage.whoTitle}
      </h2>
      <p className="t-statement pf-contact__who">
        {spans.map((span, index) =>
          span.type === "link" ? (
            <a
              key={index}
              href={`#${contactPage.formId}`}
              className="ds-prose-link"
            >
              {span.text}
            </a>
          ) : (
            span.text
          ),
        )}
      </p>
      <ul className="pf-contact__next">
        {contactNextLinks.map((link) => (
          <li key={link.href}>
            <TextLink href={link.href}>{link.label}</TextLink>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** For recruiters: what they ask first, answered before they write. */
function RecruiterTile() {
  return (
    <article
      aria-labelledby="card-recruiters"
      className="ds-tile ds-tile--paper pf-contact__tile"
    >
      <h2 id="card-recruiters" className="t-meta pf-contact__label">
        {contactPage.recruiterTitle}
      </h2>
      <RecruiterLines />
      <RecruiterLinks links={contactRecruiterLinks} />
    </article>
  );
}

export default function ContactPage({
  intent = "general",
}: {
  intent?: ContactIntent;
}) {
  return (
    <>
      <PageHero
        eyebrow={contactPage.eyebrow}
        lines={contactHeadline}
        lead={contactPage.lead}
      />
      <div className="ds-wrap pf-contact">
        <div className="pf-contact__top">
          <ContactForm intent={intent} />
          <div className="pf-contact__side">
            <EmailTile />
            <ElsewhereTile />
          </div>
        </div>
        <div className="pf-contact__row">
          <WhoTile />
          <RecruiterTile />
        </div>
      </div>
    </>
  );
}
