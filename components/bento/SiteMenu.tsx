import { useEffect, useRef } from "react";
import Link from "@/components/navigation/Link";
import { PANEL, ROW } from "@/components/bento/classes";
import { siteMenu } from "@/lib/content/landing";
import { cn } from "@/lib/utils/cn";

type MenuRow = { href: string; match: readonly string[] };

/** True when `pathname` is the row's page or one of its children. */
export function isCurrentRow(pathname: string, row: MenuRow): boolean {
  const path =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
  if (row.href === path) return true;
  return row.match.some((prefix) => path.startsWith(prefix));
}

function Row({
  label,
  row,
  pathname,
  onNavigate,
}: {
  label: string;
  row: MenuRow;
  pathname: string;
  onNavigate: () => void;
}) {
  const current = isCurrentRow(pathname, row);
  return (
    <Link
      href={row.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(ROW, current && "bg-surface-tint")}
    >
      {label}
      {current ? (
        <span aria-hidden className="ml-auto size-1.5 shrink-0 bg-mark" />
      ) : null}
    </Link>
  );
}

/**
 * Site menu (bento canvas): a disclosure <nav>, not role="menu". Rows in
 * canvas order, the Library group in two columns, then the ink "Contact me"
 * button. The current page's row (or its parent section) carries
 * aria-current="page", a Glaze fill and a small accent square.
 *
 * It is server-rendered on every page and `hidden` while closed, so its links
 * stay in the HTML for crawlers; opening it replays the panel animation.
 */
export default function SiteMenu({
  open,
  pathname,
  onNavigate,
}: {
  open: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current
      ?.querySelector<HTMLElement>("a[href]")
      ?.focus({ preventScroll: true });
  }, [open]);

  return (
    <nav
      ref={ref}
      id="site-menu"
      aria-label="Site"
      hidden={!open}
      className={cn(PANEL, "kj-menu w-[360px]")}
    >
      {siteMenu.rows.map((row) => (
        <Row
          key={row.href}
          label={row.label}
          row={row}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
      <p className="mx-3 mt-2.5 mb-1 font-mono text-label uppercase text-ink-2">
        {siteMenu.libraryLabel}
      </p>
      <div className="grid grid-cols-2 gap-0.5">
        {siteMenu.library.map((row) => (
          <Row
            key={row.href}
            label={row.label}
            row={row}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <Link
        href={siteMenu.cta.href}
        onClick={onNavigate}
        className="mt-2.5 flex min-h-12 items-center justify-center rounded-full bg-cta text-card font-semibold text-on-cta no-underline"
      >
        {siteMenu.cta.label}
      </Link>
    </nav>
  );
}
