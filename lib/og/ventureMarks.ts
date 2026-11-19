import gogocash from "@/public/brand/gogocash.png?inline";
import manut from "@/public/brand/manut.png?inline";

/*
 * Each venture's mark for its share card: the 256 px PNG its Venture names
 * in `logoPng`, bundled as a data URL because the Worker has no filesystem.
 * A PNG, not the site's SVG or WebP, so satori's renderer draws every mark.
 */
const MARKS: Readonly<Record<string, string>> = { gogocash, manut };

/** The venture's mark as a data URL, or undefined when it has none. */
export function ventureMark(slug: string): string | undefined {
  return MARKS[slug];
}
