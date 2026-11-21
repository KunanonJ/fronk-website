import { Fragment, type ReactNode } from "react";
import CopyButton from "@/components/landing/skills/CopyButton";
import { cn } from "@/lib/utils/cn";

/*
 * A command row and its parts (profile redesign Phase 7c; moved here from
 * SkillParts.tsx on 21-11-26 for /open-source), so a page can show a
 * command without importing lib/content/skills, whose snapshot carries every
 * SKILL.md. SkillParts re-exports them for /skills and /skills/$slug.
 * Styles: `.pf-cat-command*` in src/styles/profile/pages-catalog.css.
 */

/**
 * Text that breaks only after a slash where a path or address runs long:
 * a <wbr> after each "/", so "github.com/KunanonJ/superstacks" never splits
 * inside a word. The text itself (and what Copy copies) is unchanged.
 */
export function SlashBreaks({ text }: { text: string }) {
  return text.split("/").map((part, i, parts) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? (
        <>
          /<wbr />
        </>
      ) : null}
    </Fragment>
  ));
}

/**
 * A word with slashes as one box per part, each ending at its slashes
 * ("https://", "github.com/"), with a <wbr> between them: the word wraps
 * only after a slash, never after the hyphen in "thai-accounting"
 * (`.pf-cat-command__part`). A part longer than the row still wraps inside
 * its own box. The text is unchanged.
 */
function SlashParts({ word }: { word: string }) {
  const parts = word.match(/\/*[^/]+\/*|\/+/g) ?? [word];
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      <span className="pf-cat-command__part">{part}</span>
    </Fragment>
  ));
}

/**
 * A command's words, each kept whole: a line breaks only at a space, never
 * inside a flag ("--copy") or a name ("verify-loop"). A word longer than
 * the row still wraps inside its own box (`.pf-cat-command__word`). With
 * `breakAfterSlash`, a word with slashes is its parts instead (SlashParts),
 * so a row ends after a slash, never after a hyphen.
 */
function CommandWords({
  command,
  breakAfterSlash,
}: {
  command: string;
  breakAfterSlash: boolean;
}) {
  return command.split(/(\s+)/).map((part, i) => {
    if (/^\s*$/.test(part)) return part;
    // Its parts are the boxes, so the row can end after any of its slashes.
    if (breakAfterSlash && part.includes("/"))
      return <SlashParts key={i} word={part} />;
    return (
      <span key={i} className="pf-cat-command__word">
        {part}
      </span>
    );
  });
}

/**
 * A command (or path) on the page colour with its Copy pill. The command
 * wraps instead of scrolling, so the row never scrolls sideways on phones,
 * and breaks only between its words; the pill drops under it when the row
 * is narrow.
 */
export function CommandRow({
  command,
  accessibleLabel,
  announcement,
  label,
  lines = false,
}: {
  command: string;
  /** "Copy ..." naming what is copied, e.g. "Copy install command for verify-loop". */
  accessibleLabel: string;
  announcement: string;
  /** Optional caption above the row. */
  label?: ReactNode;
  /**
   * Several commands, one per line (a README's steps, on /open-source):
   * each line is its own block, its wrapped rows indented under its start,
   * a long word breaks only after a slash, and Copy sits under them
   * (`.pf-cat-command--lines`). Off by default: /skills/$slug's Full pack
   * panel passes two lines and keeps the plain layout, Copy beside them.
   */
  lines?: boolean;
}) {
  return (
    <div className="pf-cat-stack">
      {label ? <p className="t-small pf-cat-note">{label}</p> : null}
      <div className={cn("pf-cat-command", lines && "pf-cat-command--lines")}>
        <code className="pf-cat-command__text">
          {lines ? (
            command.split("\n").map((line, i) => (
              <span key={i} className="pf-cat-command__line">
                <CommandWords command={line} breakAfterSlash />
              </span>
            ))
          ) : (
            <CommandWords command={command} breakAfterSlash={false} />
          )}
        </code>
        <CopyButton
          text={command}
          accessibleLabel={accessibleLabel}
          announcement={announcement}
        />
      </div>
    </div>
  );
}
