import { readFileSync } from "node:fs";

/**
 * The pixel size of a lossy WebP file, read from its VP8 frame header: what
 * cwebp writes for a photo or a capture with no transparency. Throws for
 * any other kind of file.
 */
export function webpSize(path: string): { width: number; height: number } {
  const file = readFileSync(path);
  if (
    file.toString("ascii", 0, 4) !== "RIFF" ||
    file.toString("ascii", 8, 16) !== "WEBPVP8 "
  )
    throw new Error(`${path} is not a lossy WebP`);
  return {
    width: file.readUInt16LE(26) & 0x3fff,
    height: file.readUInt16LE(28) & 0x3fff,
  };
}
