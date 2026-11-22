/*
 * The browser's toolbar colour (`theme-color`, design spec 2.1): the light
 * lavender wash in the light theme, the dark paper in the dark one, each
 * theme's `--theme-color` in globals.css (contrast.test.ts pins both).
 *
 * The theme is the reader's choice, not the OS's (the root's ThemeProvider
 * has no system theme), so one meta with no `media` carries the colour of
 * the theme the page shows (UX hunt 22-11-26, U08). Two metas scoped to
 * `prefers-color-scheme` followed the OS instead: a dark OS put a
 * near-black bar over the light page, a light OS a lavender bar over the
 * dark one. The server writes the light colour, the default;
 * THEME_COLOR_SCRIPT makes it the dark one before the first paint when the
 * stored choice is dark; from hydration on the document keeps it on the
 * theme (src/routes/__root.tsx).
 */

export const THEME_COLORS = { light: "#f7f3ff", dark: "#0f0c18" } as const;

/**
 * The toolbar colour for a theme as next-themes names it: the dark colour
 * for `dark` only, the one theme that puts the `dark` class on <html>.
 */
export function themeColorFor(theme: string | undefined): string {
  return theme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
}

/*
 * Inline in <head>, where React writes it after the head's meta tags. It
 * reads the choice where next-themes keeps it (localStorage "theme") and
 * makes the colour dark when the choice is "dark", the one choice for which
 * next-themes' own script (in <body>) puts the `dark` class on <html>.
 * Storage that cannot be read leaves the light colour, as the page stays
 * light too. Written out by hand, with no interpolation, so the root route
 * keeps the string out of the client bundle (themeColor.test.ts holds it to
 * THEME_COLORS).
 */
export const THEME_COLOR_SCRIPT = `try{localStorage.getItem("theme")==="dark"&&document.querySelector('meta[name="theme-color"]').setAttribute("content","#0f0c18")}catch(e){}`;
