/*
 * The words of the hero canvas's tools (now-building-and-genz Phase 4): the
 * stickers' names and what the polite live line says. A sibling of
 * `canvasMock.tools` (./home), which names the toolbar's buttons, in its own
 * module so only the lazy chunk that draws the stickers loads it. All DRAFT
 * for the owner.
 */
export const canvasToolsCopy = {
  /** Each sticker's name, for the live line; the text ones show it too. */
  stickers: {
    ship: "ship it",
    heart: "a heart",
    gm: "gm",
    w: "W",
    star: "a star",
  }, // DRAFT
  placed: (name: string) => `Sticker placed: ${name}`, // DRAFT
  cleared: "Canvas cleared", // DRAFT
} as const;
