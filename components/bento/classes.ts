/*
 * Class strings shared by the bento chrome (phase 7a; design spec 3.2-3.7).
 * `kj-icon` and `kj-row` hook the canvas hover and entrance motion in
 * src/styles/globals.css.
 */

/**
 * The bento card surface: 28 px radius, hairline, surface fill, card shadow
 * and the card padding. Layout (flex, gaps, spans) is added per card.
 */
export const CARD_SURFACE =
  "relative overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 text-ink shadow-card";

/** Mono label: Geist Mono 12 px uppercase on the label token (0.06em), ink-2. */
export const MONO_LABEL = "m-0 font-mono text-label text-ink-2 uppercase";

/** 48 px round icon button (44 px at <=380px), surface fill and hairline. */
export const ICON_BUTTON =
  "kj-icon inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-card max-[381px]:size-11";

/** Header panel shell (share panel, site menu): pops from the top right. */
export const PANEL =
  "kj-panel absolute top-[60px] right-0 flex max-w-full flex-col gap-0.5 rounded-sheet border border-hairline bg-surface p-3 shadow-pop";

/** Menu and share rows: 44 px, 15 px medium ink, 14 px radius. */
export const ROW =
  "kj-row flex min-h-11 w-full items-center gap-3 rounded-row border-0 px-3 text-left text-card font-medium text-ink no-underline";
