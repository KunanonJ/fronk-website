import { describe, expect, it } from "vitest";
import { readManifestFile, resolveManifestFileName } from "./manifest";

describe("resolveManifestFileName", () => {
  it("defaults to create-manifest.json when path is empty", () => {
    expect(resolveManifestFileName(undefined)).toBe("create-manifest.json");
    expect(resolveManifestFileName([])).toBe("create-manifest.json");
  });

  it("allows known flat manifest filenames", () => {
    expect(resolveManifestFileName(["create-manifest.json"])).toBe(
      "create-manifest.json",
    );
    expect(resolveManifestFileName(["ba47da56.create-tools.json"])).toBe(
      "ba47da56.create-tools.json",
    );
  });

  it("rejects path traversal and nested paths", () => {
    expect(resolveManifestFileName(["..", "etc", "passwd"])).toBeNull();
    expect(resolveManifestFileName(["nested", "file.json"])).toBeNull();
  });
});

describe("readManifestFile", () => {
  it("returns null when the manifest file is missing", async () => {
    const content = await readManifestFile("does-not-exist.json");
    expect(content).toBeNull();
  });
});
