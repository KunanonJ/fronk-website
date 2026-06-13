import { readFileSync } from "node:fs";
import { join } from "node:path";

// The real brand faces, loaded for next/og (Satori) so the share/OG card
// matches the live site: Geist sans for the wordmark + headline, Space Mono for
// the instrument labels. Read from committed TTFs at build time (the image
// routes are statically generated) — no network, no woff2.
//
// IMPORTANT: these Geist files are STATIC instances (weight 400 + 800) sliced
// from the upstream variable font. Satori cannot parse Geist's variable TTF
// (throws "Cannot read properties of undefined (reading '256')"), so the static
// instances are required. Regenerate with fonttools varLib.instancer if Geist
// is upgraded.
const dir = join(process.cwd(), "lib/og/fonts");

function load(file: string): ArrayBuffer {
  const buf = readFileSync(join(dir, file));
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}

export const ogFonts = [
  {
    name: "Geist",
    data: load("Geist-Regular.ttf"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Geist",
    data: load("Geist-Bold.ttf"),
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    name: "Space Mono",
    data: load("SpaceMono-Regular.ttf"),
    weight: 400 as const,
    style: "normal" as const,
  },
];
