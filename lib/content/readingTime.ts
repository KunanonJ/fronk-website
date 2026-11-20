import type { CaseBlock, CaseStudy } from "@/lib/content/caseStudy";

/*
 * Reading time (reading aids, plan reading-aids_PLAN_20-11-26): worked out from
 * the content itself, so it is the same on the server and in the browser and
 * changes only with the words. A case study counts what a reader reads: the
 * tagline, the lead, the evidence rows and the chapters, labels included;
 * not links' addresses, ids or picture data.
 */

/** Words a minute for plain English non-fiction, read silently. */
export const WORDS_PER_MINUTE = 230;

/** Words in a piece of English text: runs of letters or digits. */
export function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu)?.length ?? 0;
}

/** Whole minutes, rounded up, and never under one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** The text a reader reads in one chapter block. */
function blockText(block: CaseBlock): string[] {
  switch (block.type) {
    case "prose":
      return [...block.paragraphs];
    case "facts":
      return block.items.flatMap((item) => [item.label, item.value]);
    case "points":
      return [...block.items];
    case "steps":
      return [
        block.label,
        ...block.steps.flatMap((step) => [step.label, step.detail ?? ""]),
      ];
    case "layers":
      return [
        block.label,
        ...block.layers.flatMap((layer) => [
          layer.label,
          ...layer.nodes.flatMap((node) => [node.label, node.note ?? ""]),
        ]),
      ];
    case "chips":
      return [block.label, ...block.items];
    case "links":
      return [block.label, ...block.links.map((link) => link.label)];
    case "showcase":
      return block.tiles.flatMap((tile) => [tile.title, tile.text ?? ""]);
  }
}

/** Every word a reader reads on a case page, above the "More projects". */
export function caseWords(study: CaseStudy): number {
  const { figures, part } = study.evidence;
  const text = [
    study.tagline,
    study.lead,
    ...(figures?.items ?? []).flatMap((item) => [
      item.label,
      item.value,
      item.note ?? "",
    ]),
    part?.text ?? "",
    ...study.chapters.flatMap((chapter) => [
      chapter.title,
      chapter.headline ?? "",
      ...chapter.blocks.flatMap(blockText),
    ]),
  ];
  return text.reduce((sum, piece) => sum + countWords(piece), 0);
}
