import { secretsCopy } from "@/lib/content/secretsCopy";
import type { SearchEntry } from "@/lib/search/match";

/*
 * The search dialog's commands (now-building-and-genz Phase 3): a query that
 * starts with "/" lists the commands instead of pages, and the rest of it
 * filters them. Two are hidden, listed only when typed exactly (with or
 * without the slash, in any case): `sudo hire kunanon` and `gm`. The dialog
 * runs them (components/profile/site/search/SearchDialog.tsx); this module
 * only names and finds them, and loads with the dialog, not the page.
 */

type CommandId = keyof typeof secretsCopy.commands.list;

export interface SearchCommand {
  readonly id: CommandId;
  /** As typed: "/party", "sudo hire kunanon". */
  readonly name: string;
  readonly summary: string;
  /** Listed only when typed exactly. */
  readonly hidden: boolean;
}

const HIDDEN: ReadonlySet<CommandId> = new Set(["sudo", "gm"]);

export const COMMANDS: readonly SearchCommand[] = (
  Object.entries(secretsCopy.commands.list) as [
    CommandId,
    readonly [string, string],
  ][]
).map(([id, [name, summary]]) => ({
  id,
  name,
  summary,
  hidden: HIDDEN.has(id),
}));

/** A command's words: no leading slash, lower case, single spaces. */
function bare(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/^\/ ?/, "");
}

/**
 * The commands `query` asks for, in list order, or null when it is a search.
 * "/" alone lists every listed command; "/th" the ones whose name holds
 * "th"; a hidden command's exact name shows that one.
 */
export function matchCommands(query: string): SearchCommand[] | null {
  const typed = bare(query);
  const secret = COMMANDS.filter(
    (command) => command.hidden && bare(command.name) === typed,
  );
  if (secret.length > 0) return secret;
  if (!query.trimStart().startsWith("/")) return null;
  return COMMANDS.filter(
    (command) => !command.hidden && bare(command.name).includes(typed),
  );
}

/** A case study from the index, at random; undefined when it has none. */
export function randomCase(
  entries: readonly SearchEntry[],
  random: () => number = Math.random,
): SearchEntry | undefined {
  const cases = entries.filter((entry) => entry.kind === "case");
  return cases[Math.floor(random() * cases.length)];
}
