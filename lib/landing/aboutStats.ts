import { aboutCopy, type StatSource } from "@/lib/content/homeWorkAbout";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";

/*
 * The About bento's stats tile (profile redesign Phase 3, design spec 8.5,
 * umbrella input R8): each figure is read from where the owner cleared it, a
 * project's outcome in portfolio.ts or a venture's metric in ventures.ts, and
 * never typed. The tile draws a figure in pixel digits, so only a count can
 * stand there: a change ("from 4 to 1") or a dated total, which must carry its
 * month, is refused rather than shown without its words. The label keeps the
 * source's own words, and the footnote names the cases the figures come from.
 */

export interface AboutStat {
  /** The figure as its source states it, drawn in pixels and kept as text. */
  readonly figure: string;
  /**
   * What it counts, in its source's words: an outcome's label and unit
   * ("Adoption: employees on TBH Intranet"), or a metric's label
   * ("Merchants on GoGoCash").
   */
  readonly label: string;
  /** The case the figure comes from: its project's or its venture's name. */
  readonly source: string;
}

/** A count the pixel digits can draw: digits, separators, then + or %. */
const COUNT = /^\d[\d,.]*[+%]?$/;

/** An outcome's value as a count and its unit: "12+ teams". */
const COUNT_AND_UNIT = /^(\d[\d,.]*[+%]?)\s+(\D+)$/;

/** One figure of the tile, read from the place `source` names. */
export function resolveStat(source: StatSource): AboutStat {
  if ("project" in source) {
    const project = getPortfolioProjectBySlug(source.project);
    const outcome = project?.outcomes?.find(
      (item) => item.label === source.outcome,
    );
    const parts = outcome ? COUNT_AND_UNIT.exec(outcome.value) : null;
    if (!project || !outcome || !parts) {
      throw new Error(
        `"${source.outcome}" of "${source.project}" is not a cleared count.`,
      );
    }
    return {
      figure: parts[1]!,
      label: `${outcome.label}: ${parts[2]!.trim()} on ${project.name}`,
      source: project.name,
    };
  }
  const venture = getVentureBySlug(source.venture);
  const metric = venture?.metrics?.find((item) => item.label === source.metric);
  if (!venture || !metric || metric.asOf || !COUNT.test(metric.value)) {
    throw new Error(
      `"${source.metric}" of "${source.venture}" is not an undated, cleared count.`,
    );
  }
  return {
    figure: metric.value,
    label: `${metric.label} on ${venture.name}`,
    source: venture.name,
  };
}

/** The tile's figures, in the order `aboutCopy.stats.figures` gives them. */
export function aboutStats(
  sources: readonly StatSource[] = aboutCopy.stats.figures,
): AboutStat[] {
  return sources.map(resolveStat);
}

/**
 * The footnote under the figures: the names of the cases they come from, in
 * order and once each, inside the module's words, so it never names a case
 * the tile does not draw from ("From the TBH Intranet and GoGoCash case
 * studies.").
 */
export function statsFootnote(
  stats: readonly AboutStat[],
  words: { lead: string; one: string; many: string } = aboutCopy.stats.footnote,
): string {
  const names = [...new Set(stats.map((stat) => stat.source))];
  if (names.length === 0) return "";
  const last = names.at(-1)!;
  const list =
    names.length === 1 ? last : `${names.slice(0, -1).join(", ")} and ${last}`;
  return `${words.lead} ${list} ${names.length === 1 ? words.one : words.many}`;
}
