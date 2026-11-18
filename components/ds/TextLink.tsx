import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";

/*
 * Text links (profile redesign, design spec 6.10). The arrow sits in an
 * aria-hidden span, so the link's name is its words. Prose links keep an
 * underline: colour alone would not mark them.
 */

const ARROW = { right: "→", "up-right": "↗", left: "←", none: null } as const;

export function TextLink({
  href,
  children,
  arrow = "right",
  tone = "quiet",
  external = false,
}: {
  href: string;
  children: ReactNode;
  arrow?: keyof typeof ARROW;
  /** prose: accent-ink and underlined, for links inside paragraphs. */
  tone?: "quiet" | "prose";
  external?: boolean;
}) {
  const glyph = tone === "prose" ? null : ARROW[arrow];
  const mark = glyph ? (
    <span className="ds-text-link__arrow" aria-hidden="true">
      {glyph}
    </span>
  ) : null;
  const className =
    tone === "prose"
      ? "ds-prose-link"
      : arrow === "left"
        ? "ds-back"
        : "ds-text-link";
  const newTab = external ? { target: "_blank", rel: "noopener" } : {};
  // The label and the new-tab note share one inline run, so the space
  // between them survives the link's flex layout.
  return (
    <Link href={href} className={className} {...newTab}>
      {arrow === "left" ? mark : null}
      <span>
        {children}
        {external ? (
          <>
            {" "}
            <span className="sr-only">(opens in a new tab)</span>
          </>
        ) : null}
      </span>
      {arrow === "left" ? null : mark}
    </Link>
  );
}
