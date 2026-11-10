import { useEffect, useRef, useState } from "react";
import { BentoCard, CardLink, bentoSpan } from "@/components/bento/Bento";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
} from "@/components/bento/icons";
import { contactMailto } from "@/components/landing/contact/ContactForm";
import {
  RecruiterLines,
  RecruiterLinks,
} from "@/components/landing/RecruiterFacts";
import { aboutPage } from "@/lib/content/aboutPage";
import {
  contactElsewhere,
  contactNextLinks,
  contactPage,
  contactRecruiterLinks,
} from "@/lib/content/contact";
import { writeClipboard } from "@/lib/utils/clipboard";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Contact bento cards around the form (bento canvas, design spec 4.3).
 */

const COPY_RESET_MS = 2000;

/** Email me directly: the address, an envelope, and a Copy email button. */
export function EmailCard() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <BentoCard
      headingId="card-email"
      title={contactPage.directLabel}
      gap={3.5}
      className="items-center"
    >
      <svg
        aria-hidden
        width="184"
        height="112"
        viewBox="0 0 184 112"
        fill="none"
        className="mt-1.5 shrink-0 -rotate-5"
      >
        <rect
          x="14"
          y="10"
          width="156"
          height="92"
          rx="12"
          strokeWidth="1.5"
          className="fill-surface-tint stroke-hairline-strong"
        />
        <path
          d="M20 18l72 50 72-50"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-hairline-strong"
        />
        <rect x="86" y="62" width="12" height="12" className="fill-mark" />
      </svg>
      <a
        href={contactMailto}
        className="inline-block max-w-full px-1 py-2.5 text-center text-lg leading-[1.35] font-semibold tracking-[-0.01em] [overflow-wrap:anywhere] text-ink underline decoration-hairline-strong underline-offset-[6px]"
      >
        {contactPage.email}
      </a>
      <button
        type="button"
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
        className="mt-auto inline-flex h-11 items-center gap-2 rounded-full border border-hairline-strong bg-surface px-[18px] text-sm font-medium text-ink"
      >
        {copied ? <CheckIcon size={16} className="text-mark" /> : <CopyIcon />}
        <span aria-live="polite">
          {copied ? contactPage.emailCopied : contactPage.copyEmail}
        </span>
      </button>
    </BentoCard>
  );
}

/** Elsewhere: every public profile as a numbered row with its URL. */
export function ElsewhereCard() {
  return (
    <BentoCard
      headingId="card-elsewhere"
      title={contactPage.elsewhereTitle}
      gap={2}
      minHeight={false}
    >
      <ul className="m-0 mt-1 flex list-none flex-col p-0">
        {contactElsewhere.map((item, index) => (
          <li
            key={item.href}
            className="border-b border-hairline last:border-b-0"
          >
            <a
              href={item.href}
              target="_blank"
              rel="me noopener noreferrer"
              className="kj-row -mx-2.5 flex min-h-11 items-start gap-3 rounded-row px-2.5 py-[9px] no-underline"
            >
              <span
                aria-hidden
                className="pt-[3px] font-mono text-xs text-ink-2"
              >
                {pad2(index + 1)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-card font-medium text-ink">
                  {item.label}
                </span>
                <span className="truncate font-mono text-xs text-ink-2">
                  {item.href.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </span>
              <ArrowUpRightIcon className="mt-0.5 ml-auto shrink-0 text-mark" />
            </a>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

/**
 * Who should write: the invitation from About's "Now" copy, read big. Its
 * "say hello" link points at the form on this page instead of /contact.
 */
export function WhoCard() {
  const spans = aboutPage.now.paragraphs[1].spans;
  return (
    <BentoCard headingId="card-who" title={contactPage.whoTitle} span={2}>
      <p className="m-0 mt-auto max-w-[600px] px-1 text-2xl leading-[1.35] font-semibold tracking-[-0.02em]">
        {spans.map((span, index) =>
          span.type === "link" ? (
            <a
              key={index}
              href={`#${contactPage.formId}`}
              className="underline decoration-2 underline-offset-[5px]"
            >
              {span.text}
            </a>
          ) : (
            span.text
          ),
        )}
      </p>
      <div className="flex flex-wrap gap-x-6 px-1">
        {contactNextLinks.map((link) => (
          <CardLink key={link.href} href={link.href}>
            {link.label} →
          </CardLink>
        ))}
      </div>
    </BentoCard>
  );
}

/**
 * For recruiters: what they ask first, answered before they write (the
 * lines and links are shared with About's "Let's talk" card).
 */
export function RecruiterCard() {
  return (
    <BentoCard
      headingId="card-recruiters"
      title={contactPage.recruiterTitle}
      gap={3}
      // One column beside "Who should write" at three columns. At two
      // (641 to 1023 px) that card fills its row, so this one takes a full
      // row too: one column would leave an empty cell beside it.
      className={bentoSpan({ md: 2, lg: 1 })}
    >
      <RecruiterLines />
      <RecruiterLinks links={contactRecruiterLinks} className="mt-auto" />
    </BentoCard>
  );
}
