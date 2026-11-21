import { DownloadIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import {
  formatBytes,
  sourceLabel,
  type Skill,
  type SkillAsset,
} from "@/lib/content/skills";
import { cn } from "@/lib/utils/cn";

/*
 * Pieces shared by /skills and /skills/$slug (profile redesign Phase 7c):
 * the download pill and the skill's chips. The command rows live in
 * CommandRow.tsx since 21-11-26 (/open-source shows them without this
 * module's skills snapshot) and are re-exported here. Styles: `.pf-cat-*`
 * and `.pf-skill-*` in src/styles/profile/pages-catalog.css.
 */

export {
  CommandRow,
  SlashBreaks,
} from "@/components/landing/skills/CommandRow";

/** Helper copy inside install panels (14 px, ink 60). */
export const NOTE = "t-small pf-cat-note";

/** Inline code in helper copy: the mono face, 13 px, in ink. */
export const CODE = "pf-cat-code";

/**
 * A link inside a sentence: underlined, so it never depends on colour alone
 * (axe link-in-text-block).
 */
export const INLINE_LINK = "ds-prose-link";

/** Opens on GitHub (or another site): a new tab, no opener. */
export const EXTERNAL = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/**
 * A release asset as the panel's primary action (the dark pill): the label
 * and the size. Screen readers also hear the file name when the label leaves
 * it out ("Download plugin ZIP: superstacks-plugin.zip, 91 KB"); the name is
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
    <a href={asset.url} className={cn(pillClass(), "pf-cat-download")}>
      <span className="ds-pill__icon" aria-hidden="true">
        <DownloadIcon size={16} />
      </span>
      <span className="pf-cat-download__label">{label}</span>
      <span className="sr-only">
        {label.includes(asset.name) ? "" : `: ${asset.name}`},{" "}
        {formatBytes(asset.size)}
      </span>
      <span aria-hidden className="pf-count">
        {formatBytes(asset.size)}
      </span>
    </a>
  );
}

/**
 * Origin and invocation chips: "Original" (accent square) or "Adapted from
 * <upstream>", then "Runs automatically" or "You invoke" (dashed). The hero's
 * chips are list items.
 */
export function SkillTags({
  skill,
  variant,
}: {
  skill: Pick<Skill, "source" | "userInvoked">;
  variant: "card" | "hero";
}) {
  const Item = variant === "hero" ? "li" : "span";
  return (
    <>
      {skill.source ? (
        <Item className="ds-chip pf-skill-tag">
          Adapted from {sourceLabel(skill.source)}
        </Item>
      ) : (
        <Item className="ds-chip pf-skill-tag pf-skill-tag--original">
          <span aria-hidden className="pf-skill-tag__mark" />
          Original
        </Item>
      )}
      {skill.userInvoked ? (
        <Item
          title="User-invoked: the agent never loads it on its own"
          className="ds-chip pf-skill-tag pf-skill-tag--user"
        >
          You invoke
        </Item>
      ) : (
        <Item
          title="Model-invoked: the agent loads it when the task matches"
          className="ds-chip pf-skill-tag"
        >
          Runs automatically
        </Item>
      )}
    </>
  );
}
