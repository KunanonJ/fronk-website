import { useState, type ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { BentoCard, BentoPair, PageMain } from "@/components/bento/Bento";
import { CheckIcon, CopyIcon } from "@/components/bento/icons";
import { MonoEyebrow } from "@/components/bento/MonoEyebrow";
import { PixelGrid } from "@/components/ui/PixelGrid";
import { siteConfig } from "@/lib/site";
import { writeClipboard } from "@/lib/utils/clipboard";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The 404 page and the route error state (bento canvas NotFound, design spec
 * 4.20; RouteError reuses the layout, spec 6): the hero, then a bento pair of
 * the status art, the recovery links and the "report it" email card.
 */

/** Where a lost visitor can go next (owner decision 3: Ventures is /#ventures). */
const RECOVERY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/#ventures", label: "Ventures" },
  { href: "/contact", label: "Contact" },
] as const;

export type StatusPageCopy = {
  eyebrow: string;
  /** The h1 as one line: a muted opening word, the middle, an accent end. */
  headline: { muted: string; middle: string; accent: string };
  lead: string;
  /** The status card's kicker, after the Ember square. */
  status: string;
  /** Seed of the pixel art (404 draws the canvas grid). */
  seed: number;
  /** The email card's kicker and the subject of its mailto link. */
  report: { title: string; subject: string };
};

function RecoveryCard() {
  return (
    <BentoCard
      headingId="card-recover"
      title="Try one of these"
      gap={3}
      minHeight={false}
    >
      <nav aria-label="Recovery links" className="mt-auto flex flex-col">
        {RECOVERY_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex min-h-[60px] items-center gap-3.5 border-hairline px-1 text-lg font-semibold tracking-[-0.01em] text-ink no-underline [&:not(:last-child)]:border-b"
          >
            <span className="font-mono text-xs font-normal tracking-normal text-ink-2">
              {pad2(i + 1)}
            </span>
            {link.label}
            <span
              aria-hidden
              className="ml-auto text-card font-medium text-mark"
            >
              →
            </span>
          </Link>
        ))}
      </nav>
    </BentoCard>
  );
}

/** The address as a mailto link, and a Copy email button that stays copied. */
function ReportCard({ title, subject }: StatusPageCopy["report"]) {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
  return (
    <BentoCard headingId="card-report" title={title} span={2} minHeight={false}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-1">
        <a
          href={mailto}
          className="min-w-0 text-[clamp(20px,3vw,28px)] leading-[1.25] font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] underline decoration-hairline-strong underline-offset-[6px]"
        >
          {siteConfig.email}
        </a>
        <button
          type="button"
          onClick={() => {
            void writeClipboard(siteConfig.email).then(setCopied);
          }}
          className="inline-flex h-14 shrink-0 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-[26px] text-card font-semibold text-ink"
        >
          {copied ? (
            <CheckIcon className="text-mark" />
          ) : (
            <CopyIcon size={18} />
          )}
          <span aria-live="polite">
            {copied ? "Email copied" : "Copy email"}
          </span>
        </button>
      </div>
    </BentoCard>
  );
}

/**
 * The status page body. `actions` sits under the lead (RouteError's "Try
 * again"); `alert` makes the hero a live alert for an error that appears in
 * place of a page.
 */
export default function StatusPage({
  copy,
  actions,
  alert = false,
}: {
  copy: StatusPageCopy;
  actions?: ReactNode;
  alert?: boolean;
}) {
  const { headline } = copy;
  return (
    <PageMain>
      <section
        aria-labelledby="hero-title"
        role={alert ? "alert" : undefined}
        className="flex flex-col gap-[22px]"
      >
        <MonoEyebrow>{copy.eyebrow}</MonoEyebrow>
        <h1 id="hero-title" className="m-0 text-title text-ink">
          <span className="text-ink-3">{headline.muted}</span> {headline.middle}{" "}
          <span className="text-mark">{headline.accent}</span>
        </h1>
        <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
          {copy.lead}
        </p>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </section>
      <BentoPair>
        <BentoCard
          headingId="card-status"
          title={
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2 shrink-0 bg-ember" />
              {copy.status}
            </span>
          }
          gap={0}
          minHeight={false}
          className="gap-5 pb-6"
        >
          <div className="flex flex-auto items-center justify-center px-1 pt-1">
            <PixelGrid
              cols={12}
              rows={8}
              seed={copy.seed}
              state="failed"
              className="max-w-[420px]"
            />
          </div>
        </BentoCard>
        <RecoveryCard />
        <ReportCard {...copy.report} />
      </BentoPair>
    </PageMain>
  );
}
