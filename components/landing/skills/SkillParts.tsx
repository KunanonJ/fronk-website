import type { ReactNode } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import CopyButton from "@/components/landing/skills/CopyButton";
import { Chip } from "@/components/ui/Chip";
import {
  formatBytes,
  sourceLabel,
  type Skill,
  type SkillAsset,
} from "@/lib/content/skills";

/*
 * Shared Skills styling (visual-redesign Phase 5). Focus uses the site-wide
 * ring from the base layer, so none of these classes set their own.
 */

/** Pill-shaped secondary action (link). 36px tall: clears the 24px target floor. */
export const pillLinkClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-3.5 text-sm text-ink transition-colors duration-150 ease-smooth hover:border-ink/40 hover:bg-surface-tint";

/** Primary action (Signal fill, Paper text), the site's primary button. */
export const primaryLinkClass =
  "inline-flex min-h-10 items-center gap-1.5 rounded-full bg-action px-4 text-sm font-medium text-on-action transition-colors duration-150 ease-smooth hover:bg-action-hover";

/** Inline text link inside prose. */
export const textLinkClass =
  "text-link underline decoration-link/40 underline-offset-[3px] transition-colors hover:decoration-link";

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
      {label ? <p className="mb-2 text-small text-ink-2">{label}</p> : null}
      <div className="flex items-start gap-3 rounded-input border border-hairline bg-well p-2 pl-4">
        <pre className="min-w-0 flex-1 whitespace-pre-wrap py-2 font-mono text-small text-ink [overflow-wrap:anywhere]">
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
    return <Chip>Adapted from {sourceLabel(skill.source)}</Chip>;
  }
  return <Chip tone="signal">Original</Chip>;
}

export function InvocationBadge({ skill }: { skill: Skill }) {
  return skill.userInvoked ? (
    <Chip
      className="border-dashed"
      title="User-invoked: the agent never loads it on its own"
    >
      You invoke
    </Chip>
  ) : (
    <Chip title="Model-invoked: the agent loads it when the task matches">
      Runs automatically
    </Chip>
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
        <span
          className={
            primary
              ? "font-normal tabular-nums text-on-action/85"
              : "tabular-nums text-ink-2"
          }
        >
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

/** h2: a Geist section heading; h3: the smaller stage heading. */
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
          ? "mb-5 font-display text-h3 text-ink"
          : "mb-3 text-lead font-semibold text-ink"
      }
    >
      {children}
    </Tag>
  );
}
