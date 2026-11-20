import { describe, expect, it } from "vitest";
import { sayHello } from "@/lib/content/profileChrome";
import { secretsCopy } from "@/lib/content/secretsCopy";
import { COMMANDS, matchCommands, randomCase } from "@/lib/search/commands";
import type { SearchEntry } from "@/lib/search/match";
import { siteConfig } from "@/lib/site";

/*
 * The search dialog's commands (now-building-and-genz Phase 3): "/" lists
 * them, the rest of the query filters them, and two hidden ones show only
 * when typed exactly.
 */

const names = (query: string) =>
  matchCommands(query)?.map((command) => command.name) ?? null;

const LISTED = [
  "/party",
  "/theme light",
  "/theme dark",
  "/copy email",
  "/random",
  "/traits",
  "/resume",
  "/contact",
  "/shortcuts",
];

describe("search commands", () => {
  it("lists every command but the hidden ones for a lone slash", () => {
    expect(names("/")).toEqual(LISTED);
    expect(names("  /  ")).toEqual(LISTED);
  });

  it("filters by what follows the slash", () => {
    expect(names("/th")).toEqual(["/theme light", "/theme dark"]);
    expect(names("/THEME   D")).toEqual(["/theme dark"]);
    expect(names("/ party")).toEqual(["/party"]);
    expect(names("/copy")).toEqual(["/copy email"]);
    expect(names("/zzz")).toEqual([]);
  });

  it("leaves a query without a slash to the search", () => {
    expect(names("party")).toBeNull();
    expect(names("gogocash")).toBeNull();
    expect(names("")).toBeNull();
  });

  it("shows a hidden command only when typed exactly", () => {
    expect(names("sudo hire kunanon")).toEqual(["sudo hire kunanon"]);
    expect(names("  Sudo   HIRE kunanon ")).toEqual(["sudo hire kunanon"]);
    expect(names("/sudo hire kunanon")).toEqual(["sudo hire kunanon"]);
    expect(names("gm")).toEqual(["gm"]);
    expect(names("/GM")).toEqual(["gm"]);
    // Not before they are complete, and never in the list.
    expect(names("sudo")).toBeNull();
    expect(names("sudo hire")).toBeNull();
    expect(names("/sudo")).toEqual([]);
    expect(names("/sudo hire")).toEqual([]);
    expect(COMMANDS.filter((c) => c.hidden).map((c) => c.id)).toEqual([
      "sudo",
      "gm",
    ]);
  });

  it("answers the hidden ones with the owner's status, from AVAILABILITY", () => {
    expect(secretsCopy.commands.sudo).toBe(
      "Permission denied: currently building GoGoCash and Manut AI. Try /contact.",
    );
    expect(secretsCopy.commands.gm).toBe("gm. Bangkok says hi.");
  });

  it("copies the site's public address", () => {
    expect(sayHello.address).toBe(siteConfig.email);
  });

  it("picks a random case study, and nothing from an index without one", () => {
    const entries: SearchEntry[] = [
      { path: "/about", title: "About", kind: "page", summary: "" },
      { path: "/portfolio/a", title: "A", kind: "case", summary: "" },
      { path: "/topics/x", title: "X", kind: "topic", summary: "" },
      { path: "/portfolio/b", title: "B", kind: "case", summary: "" },
    ];
    expect(randomCase(entries, () => 0)?.path).toBe("/portfolio/a");
    expect(randomCase(entries, () => 0.99)?.path).toBe("/portfolio/b");
    expect(randomCase(entries.slice(0, 1))).toBeUndefined();
  });
});
