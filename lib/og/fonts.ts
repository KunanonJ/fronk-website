import { readFileSync } from "node:fs";
import { join } from "node:path";

type FontLoader = (filePath: string) => Uint8Array;

const dir = join(process.cwd(), "lib/og/fonts");

const fontFiles = [
  {
    name: "Geist",
    file: "Geist-Regular.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Geist",
    file: "Geist-Bold.ttf",
    weight: 800 as const,
    style: "normal" as const,
  },
  {
    name: "Space Mono",
    file: "SpaceMono-Regular.ttf",
    weight: 400 as const,
    style: "normal" as const,
  },
];

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

// The real brand faces, loaded lazily for next/og (Satori) so normal page
// metadata imports do not fail in Worker bundles that omit raw TTF files.
export function loadOgFonts(readFile: FontLoader = readFileSync) {
  try {
    return fontFiles.map(({ file, ...font }) => ({
      ...font,
      data: toArrayBuffer(readFile(join(dir, file))),
    }));
  } catch {
    return [];
  }
}
