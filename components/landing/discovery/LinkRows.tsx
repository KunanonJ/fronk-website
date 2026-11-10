import Link from "@/components/navigation/Link";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

export type HubLink = {
  label: string;
  href: string;
  /** Language of the label and the page it opens, when not the page's own. */
  lang?: string;
};

/**
 * Numbered link rows under hairlines (Venture "Related topics", Topic "Keep
 * exploring"): mono index, label, accent arrow, 52 px targets. `kj-row` adds
 * the canvas hover nudge.
 */
export default function LinkRows({
  links,
  size = "md",
  className,
}: {
  links: readonly HubLink[];
  /** md: 16 px labels (Topic); sm: 15 px medium labels (Venture). */
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "m-0 flex list-none flex-col border-hairline p-0",
        // Venture: ruled above and below every row; Topic: between rows.
        size === "sm" && "border-t",
        className,
      )}
    >
      {links.map((link, i) => (
        <li
          key={link.href}
          className={cn(
            "border-hairline",
            (size === "sm" || i < links.length - 1) && "border-b",
          )}
        >
          <Link
            href={link.href}
            hrefLang={link.lang}
            lang={link.lang}
            className={cn(
              "kj-row flex min-h-[52px] items-center gap-3 rounded-tile px-2 text-ink no-underline",
              size === "md" ? "text-base" : "text-card font-medium",
            )}
          >
            <span className="font-mono text-xs font-normal text-ink-2">
              {pad2(i + 1)}
            </span>
            <span className="min-w-0">{link.label}</span>
            <ArrowUpRightIcon
              strokeWidth={2}
              className="ml-auto shrink-0 text-mark"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
