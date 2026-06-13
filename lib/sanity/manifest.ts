import { readFile } from "node:fs/promises";
import path from "node:path";

export const SANITY_MANIFEST_DIR = path.join(
  process.cwd(),
  "public/studio/static",
);

/** Reject path traversal; only serve flat manifest filenames from the build output. */
export function resolveManifestFileName(segments: string[] | undefined): string | null {
  const fileName = segments?.length ? segments.join("/") : "create-manifest.json";
  if (fileName.includes("..") || fileName.includes("/")) {
    return null;
  }
  return fileName;
}

export async function readManifestFile(fileName: string): Promise<string | null> {
  try {
    return await readFile(path.join(SANITY_MANIFEST_DIR, fileName), "utf8");
  } catch {
    return null;
  }
}
