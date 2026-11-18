import { aboutCopy, type StatSource } from "@/lib/content/homeWorkAbout";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";

/*
 * The About bento's stats tile (profile redesign Phase 3, design spec 8.5,
 * umbrella input R8): each figure is read from where the owner cleared it, a
 * project's outcome in portfolio.ts or a venture's metric in ventures.ts, and
 * never typed. The tile draws a figure in pixel digits, so only a count can
 * stand there: a change ("from 4 to 1") or a dated total, which must carry its
 * month, is refused rather than shown without its words.
 */

export interface AboutStat {
  /** The figure as its source states it, drawn in pixels and kept as text. */
  readonly figure: string;
  /** What it counts, and where. */
  readonly label: string;
}

/** A count the pixel digits can draw: digits, separators, then + or %. */
const COUNT = /^\d[\d,.]*[+%]?$/;

/** An outcome's value as a count and its unit: "12+ teams". */
const COUNT_AND_UNIT = /^(\d[\d,.]*[+%]?)\s+(\D+)$/;

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
      label: `${capitalise(parts[2]!.trim())} on ${project.name}`,
    };
  }
  const venture = getVentureBySlug(source.venture);
  const metric = venture?.metrics?.find((item) => item.label === source.metric);
  if (!venture || !metric || metric.asOf || !COUNT.test(metric.value)) {
    throw new Error(
      `"${source.metric}" of "${source.venture}" is not an undated, cleared count.`,
    );
  }
  return { figure: metric.value, label: `${metric.label} on ${venture.name}` };
}

/** The tile's figures, in the order `aboutCopy.stats.figures` gives them. */
export function aboutStats(
  sources: readonly StatSource[] = aboutCopy.stats.figures,
): AboutStat[] {
  return sources.map(resolveStat);
}
