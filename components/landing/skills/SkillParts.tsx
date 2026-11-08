import type { ReactNode } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import CopyButton from "@/components/landing/skills/CopyButton";
import {
  formatBytes,
  sourceLabel,
  type Skill,
  type SkillAsset,
} from "@/lib/content/skills";

export const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-landing";

/** Pill-shaped secondary action (link). 36px tall: clears the 24px target floor. */
export const pillLinkClass = `inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/20 px-3 text-sm text-primary/85 transition-colors hover:border-primary/40 hover:text-primary ${focusRing}`;

/** Primary action (cream fill), matching the nav Contact CTA. */
export const primaryLinkClass = `inline-flex min-h-10 items-center gap-1.5 rounded-full bg-cream px-4 text-sm font-medium text-black transition-opacity hover:opacity-90 ${focusRing}`;

/** Inline text link inside prose. */
export const textLinkClass = `text-primary underline decoration-primary/35 underline-offset-[3px] transition-colors hover:decoration-primary ${focusRing}`;

const badgeBase =
  "inline-flex min-h-7 items-center rounded-full border px-2.5 text-[13px] leading-none";

/**
 * A command (or path) with its copy button. The command wraps instead of
 * scrolling, so the block never creates a horizontal scroll on phones.
 */
export function CommandBlock({
  command,
  accessibleLabel,
  announcement,
  label,
}: {
  command: string;
  /** "Copy ..." naming what is copied, e.g. "Copy npx install command for verify-loop". */
  accessibleLabel: string;
  announcement?: string;
  /** Optional caption above the block. */
  label?: ReactNode;
}) {
  return (
    <div>
      {label ? <p className="mb-2 text-sm text-primary/80">{label}</p> : null}
      <div className="flex items-start gap-3 rounded-xl border border-primary/12 bg-primary/[0.04] p-3 pl-4">
        <pre className="min-w-0 flex-1 whitespace-pre-wrap py-1.5 font-mono text-[13px] leading-relaxed text-primary [overflow-wrap:anywhere] sm:text-sm">
          <code>{command}</code>
        </pre>
        <CopyButton
          text={command}
          accessibleLabel={accessibleLabel}
          announcement={announcement ?? "Copied to clipboard"}
        />
      </div>
    </div>
  );
}

export function OriginBadge({ skill }: { skill: Skill }) {
  if (skill.source) {
    return (
      <span className={`${badgeBase} border-primary/20 text-primary/80`}>
        Adapted from {sourceLabel(skill.source)}
      </span>
    );
  }
  return (
    <span
      className={`${badgeBase} border-primary/35 bg-primary/[0.06] font-medium text-primary`}
    >
      Original
    </span>
  );
}

export function InvocationBadge({ skill }: { skill: Skill }) {
  return skill.userInvoked ? (
    <span
      className={`${badgeBase} border-dashed border-primary/30 text-primary/80`}
      title="User-invoked: the agent never loads it on its own"
    >
      You invoke
    </span>
  ) : (
    <span
      className={`${badgeBase} border-primary/20 text-primary/80`}
      title="Model-invoked: the agent loads it when the task matches"
    >
      Runs automatically
    </span>
  );
}

/**
 * Link to a GitHub release asset. The visible label stays short ("Download
 * ZIP"); sr-only text adds the file name so several download links on one
 * page never share an accessible name.
 */
export function DownloadLink({
  asset,
  children,
  primary = false,
  showSize = true,
}: {
  asset: SkillAsset;
  children: ReactNode;
  primary?: boolean;
  /** Cards hide the visible size to keep three actions on one row. */
  showSize?: boolean;
}) {
  const size = formatBytes(asset.size);
  return (
    <a href={asset.url} className={primary ? primaryLinkClass : pillLinkClass}>
      <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
      <span className="sr-only">
        : {asset.name}
        {showSize ? "," : `, ${size}`}
      </span>
      {showSize ? (
        <span className={primary ? "text-black/70" : "text-primary/70"}>
          {size}
        </span>
      ) : null}
    </a>
  );
}

export function ExternalLink({
  href,
  children,
  accessibleLabel,
  className = pillLinkClass,
}: {
  href: string;
  children: ReactNode;
  accessibleLabel?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      className={className}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </a>
  );
}

export function SectionHeading({
  id,
  children,
  as: Tag = "h2",
}: {
  id: string;
  children: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      id={id}
      className={
        Tag === "h2"
          ? "mb-5 text-2xl font-medium tracking-tight text-primary sm:text-3xl"
          : "mb-3 text-xl font-medium text-primary"
      }
      style={serif}
    >
      {children}
    </Tag>
  );
}
