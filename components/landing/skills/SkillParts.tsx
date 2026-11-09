import type { ReactNode } from "react";
import { DownloadIcon } from "@/components/bento/icons";
import CopyButton from "@/components/landing/skills/CopyButton";
import {
  formatBytes,
  sourceLabel,
  type Skill,
  type SkillAsset,
} from "@/lib/content/skills";
import { cn } from "@/lib/utils/cn";

/*
 * Pieces shared by /skills and /skills/$slug (bento canvas, design spec 4.8
 * and 4.9): command rows, the download CTA and the skill meta tags.
 */

/** Helper copy inside install panels (14 px, ink 2). */
export const NOTE = "m-0 text-sm leading-[1.5] text-ink-2";

/** Inline code in helper copy: Geist Mono 13 px in ink. */
export const CODE = "font-mono text-meta text-ink";

/**
 * A link inside a sentence: underlined, so it never depends on colour alone
 * (axe link-in-text-block). Mono file names and code links stand out already.
 */
export const INLINE_LINK =
  "underline decoration-hairline-strong underline-offset-4";

/** Opens on GitHub (or another site): a new tab, no opener. */
export const EXTERNAL = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/**
 * A command (or path) on the page colour with its Copy button. The command
 * wraps instead of scrolling, so the row never scrolls sideways on phones;
 * the button drops under it when the row is narrow.
 */
export function CommandRow({
  command,
  accessibleLabel,
  announcement,
  label,
}: {
  command: string;
  /** "Copy ..." naming what is copied, e.g. "Copy install command for verify-loop". */
  accessibleLabel: string;
  announcement: string;
  /** Optional caption above the row. */
  label?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <p className="m-0 text-meta leading-[1.5] text-ink-2">{label}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[18px] border border-hairline bg-page py-2 pr-2 pl-4">
        <code className="min-w-0 flex-[1_1_220px] py-1.5 font-mono text-meta leading-[1.6] [overflow-wrap:anywhere] whitespace-pre-wrap text-ink">
          {command}
        </code>
        <CopyButton
          text={command}
          accessibleLabel={accessibleLabel}
          announcement={announcement}
          className="ml-auto"
        />
      </div>
    </div>
  );
}

/**
 * A release asset as the panel's primary action (ink pill): the label and
 * the size. Screen readers also hear the file name when the label leaves it
 * out ("Download plugin ZIP: superstacks-plugin.zip, 91 KB"); the name is
 * built from the visible words, so it always contains them.
 */
export function DownloadCta({
  asset,
  label,
}: {
  asset: SkillAsset;
  label: string;
}) {
  return (
    <a
      href={asset.url}
      className="btn-cta inline-flex min-h-12 max-w-full flex-wrap items-center gap-2.5 rounded-full bg-cta px-[22px] text-card font-semibold text-on-cta no-underline"
    >
      <DownloadIcon size={16} />
      <span className="[overflow-wrap:anywhere]">{label}</span>
      <span className="sr-only">
        {label.includes(asset.name) ? "" : `: ${asset.name}`},{" "}
        {formatBytes(asset.size)}
      </span>
      <span aria-hidden className="font-mono text-meta font-normal">
        {formatBytes(asset.size)}
      </span>
    </a>
  );
}

const TAG =
  "inline-flex items-center rounded-full border border-hairline-strong font-medium";

const TAG_VARIANT = {
  /** The 26 px catalog tag (spec 3.6), in ink 2 except "Original". */
  card: { size: "min-h-[26px] gap-1.5 px-2.5 text-xs", text: "text-ink-2" },
  /** The 34 px chip under a skill's description, in ink. */
  hero: { size: "min-h-[34px] gap-2 px-3 text-meta", text: "text-ink" },
} as const;

/**
 * Origin and invocation tags: "Original" (accent square) or "Adapted from
 * <upstream>", then "Runs automatically" or "You invoke" (dashed). The hero
 * chips are list items and put "Original" on the tint.
 */
export function SkillTags({
  skill,
  variant,
}: {
  skill: Pick<Skill, "source" | "userInvoked">;
  variant: keyof typeof TAG_VARIANT;
}) {
  const Item = variant === "hero" ? "li" : "span";
  const { size, text } = TAG_VARIANT[variant];
  return (
    <>
      {skill.source ? (
        <Item className={cn(TAG, size, text, "bg-surface")}>
          Adapted from {sourceLabel(skill.source)}
        </Item>
      ) : (
        <Item
          className={cn(
            TAG,
            size,
            "text-ink",
            variant === "hero" ? "bg-surface-tint" : "bg-surface",
          )}
        >
          <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
          Original
        </Item>
      )}
      {skill.userInvoked ? (
        <Item
          title="User-invoked: the agent never loads it on its own"
          className={cn(TAG, size, text, "border-dashed bg-surface")}
        >
          You invoke
        </Item>
      ) : (
        <Item
          title="Model-invoked: the agent loads it when the task matches"
          className={cn(TAG, size, text, "bg-surface")}
        >
          Runs automatically
        </Item>
      )}
    </>
  );
}
