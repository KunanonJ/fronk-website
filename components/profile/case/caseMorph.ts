import { useEffect, useState, type MouseEvent } from "react";

/*
 * The tile-to-case morph (plan morph-count-up_PLAN_20-11-26, research item
 * 1): as a case card opens its case, the card's title moves into the h1's
 * name, and a venture's logo into the hero's logo, inside the router's page
 * transition. The cover is not a target: it starts under the hero copy, below
 * the fold, so it would fly off the screen.
 *
 * Only the pressed card takes part. A press on its link marks the card
 * (`data-morph`) and remembers the case it opens; the case's h1 marks itself
 * as it renders for that case. CSS (globals.css, "View transitions") names the
 * marked parts only while a "page" transition runs, under no-preference, so a
 * mark left behind does nothing on its own. Naming every card for its case
 * instead would morph the hero of the case being left into its own card
 * further down the next page, across the screen.
 */

/** The case a pressed card opens, until that case's hero has rendered. */
let pending: string | null = null;

/** A plain press: one that opens the case in this tab. */
function opensHere(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * The card link's onClick: marks the card that holds the link (a
 * `data-morph-card` ancestor) after clearing any other mark, so two parts
 * never share a name (that would abort the transition).
 */
export function morphFromCard(event: MouseEvent<HTMLAnchorElement>): void {
  for (const marked of document.querySelectorAll("[data-morph]")) {
    marked.removeAttribute("data-morph");
  }
  pending = null;
  const card = event.currentTarget.closest("[data-morph-card]");
  if (!card || !opensHere(event)) return;
  card.setAttribute("data-morph", "");
  pending = event.currentTarget.pathname;
}

/**
 * True when the case at `href` is opening from a pressed card. Read once, as
 * the hero first renders; the pending case is then forgotten.
 */
export function useMorphTarget(href: string): boolean {
  const [morph] = useState(() => pending === href);
  useEffect(() => {
    if (morph) pending = null;
  }, [morph]);
  return morph;
}
