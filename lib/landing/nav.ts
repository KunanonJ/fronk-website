/** Home landing sections that accept `/#…` deep links. */
export const HOME_SECTION_IDS = ["about", "ventures", "contact"] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/$/, "");
}

export function isHomeSectionId(value: string): value is HomeSectionId {
  return (HOME_SECTION_IDS as readonly string[]).includes(value);
}

/** Strip leading `#` / `/#` and return a known home section id, else null. */
export function parseHomeSectionHash(hashOrHref: string): HomeSectionId | null {
  const raw = hashOrHref.startsWith("/#")
    ? hashOrHref.slice(2)
    : hashOrHref.startsWith("#")
      ? hashOrHref.slice(1)
      : hashOrHref.replace(/^#/, "");
  const id = raw.split(/[?#]/)[0] ?? "";
  return isHomeSectionId(id) ? id : null;
}

/**
 * Expand legacy `#section` hrefs to `/#section` for off-home pages.
 * Leaves absolute paths and http(s) URLs untouched.
 */
export function expandHashHref(href: string): string {
  if (href.startsWith("#")) return `/${href}`;
  return href;
}

/**
 * Resolve a content href for the current route.
 * On home, `/#ventures` becomes `#ventures` so browsers do in-page scroll
 * instead of a same-path Next.js navigation that often skips the hash.
 */
export function resolveHomeAwareHref(href: string, pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/" && href.startsWith("/#")) {
    return href.slice(1);
  }
  return href;
}

/** Section ids that have a matching hash nav link (`/#ventures`). */
export function scrollSpySectionIds(
  items: readonly { href: string }[],
): HomeSectionId[] {
  const ids: HomeSectionId[] = [];
  const seen = new Set<HomeSectionId>();
  for (const item of items) {
    const id = parseHomeSectionHash(item.href);
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

type NavTreeItem =
  | { type: "link"; href: string }
  | { type: "menu"; href?: string; children: readonly { href: string }[] };

/** Flatten primary nav + optional CTA into href rows for scroll-spy / active state. */
export function flattenNavHrefs(
  items: readonly NavTreeItem[],
  cta?: { href: string },
): { href: string }[] {
  const out: { href: string }[] = [{ href: "/" }];
  for (const item of items) {
    if (item.type === "link") {
      out.push({ href: item.href });
      continue;
    }
    if (item.href) out.push({ href: item.href });
    for (const child of item.children) out.push({ href: child.href });
  }
  if (cta) out.push({ href: cta.href });
  return out;
}

/** True when pathname matches a menu child (prefix-aware). */
export function isMenuChildActive(
  children: readonly { href: string }[],
  pathname: string,
  activeSection: string | null,
  hashLinkedSections: readonly string[] = [],
): boolean {
  return children.some((child) =>
    isNavItemActive(child.href, pathname, activeSection, hashLinkedSections),
  );
}

export function isHashHref(href: string): boolean {
  return href.startsWith("#") || href.startsWith("/#");
}

export function isNavItemActive(
  href: string,
  pathname: string,
  activeSection: string | null,
  /** Hash-linked section ids from nav; used so the wordmark clears only for those. */
  hashLinkedSections: readonly string[] = [],
): boolean {
  const path = normalizePath(pathname);

  if (href.startsWith("#")) {
    return path === "/" && activeSection === href.slice(1);
  }

  if (href === "/") {
    const onHashLinked =
      activeSection !== null && hashLinkedSections.includes(activeSection);
    return path === "/" && !onHashLinked;
  }

  // `/#ventures`-style hrefs (content source form, before home-aware resolve)
  if (href.startsWith("/#")) {
    return path === "/" && activeSection === href.slice(2);
  }

  return path === href || path.startsWith(`${href}/`);
}

/** Scroll a home section into view; no-ops when the node is missing. */
export function scrollToHomeSection(
  id: HomeSectionId,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

type SectionRect = { id: string; top: number; bottom: number };

/**
 * Classic scroll-spy: last section whose top has crossed the focus line.
 *
 * Short trailing sections (home `#contact` footer) often can't scroll up to
 * the focus line. Once the last section's top is well inside the viewport,
 * activate it so a tall prior block doesn't stay highlighted forever.
 */
export function activeSectionAtFocus(
  sections: readonly SectionRect[],
  focusY: number,
  viewportHeight = 0,
): string | null {
  if (sections.length === 0) return null;

  let active: string | null = null;
  for (const section of sections) {
    if (section.top <= focusY) active = section.id;
  }

  if (viewportHeight > 0) {
    const last = sections[sections.length - 1]!;
    // Generous band: short footers + scroll-margin often stop ~60–70% down.
    const footerBand = viewportHeight * 0.85;
    if (last.top > focusY && last.top < footerBand) {
      active = last.id;
    }
  }

  return active;
}
