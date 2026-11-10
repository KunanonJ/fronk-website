import type { BentoSpan, BentoSpans } from "@/components/bento/Bento";

/*
 * Layout rules for the discovery hubs (bento canvas 4.7, 4.15, 4.16). The
 * canvas draws one venture and one topic per language; these rules derive the
 * variants it leaves out (Manut, the other topics) from the same template.
 */

export type TopicGrid = {
  sections: readonly BentoSpans[];
  proof: BentoSpans;
  faq: BentoSpans;
};

/**
 * Spans for a topic hub's cards. At three columns the first section leads at
 * span 2 and the others take one cell each; Operator proof then takes the
 * rest of its row (one cell when it starts a row) and the FAQ fills the row
 * it lands in. Three sections (EN) give s1 2 | s2, s3 | proof 2, FAQ 3; two
 * (TH) give s1 2 | s2, proof | FAQ 2, as the canvas draws them. At two
 * columns a one-cell card that would sit alone before a full-width card (or
 * at the end) widens to fill its row.
 */
export function topicGrid(sectionCount: number): TopicGrid {
  const lg: BentoSpan[] = [];
  let used = 0;
  const place = (span: BentoSpan) => {
    lg.push(span);
    used = (used + span) % 3;
  };
  for (let i = 0; i < sectionCount; i += 1) place(i === 0 ? 2 : 1);
  place(used === 0 ? 1 : ((3 - used) as BentoSpan));
  place((3 - used) as BentoSpan);

  const md = lg.map((span): 1 | 2 => (span === 1 ? 1 : 2));
  let column = 0;
  md.forEach((span, i) => {
    if (span === 1 && column === 0 && (md[i + 1] ?? 2) === 2) md[i] = 2;
    column = (column + md[i]) % 2;
  });

  const spans = lg.map((span, i): BentoSpans => ({ md: md[i], lg: span }));
  return {
    sections: spans.slice(0, sectionCount),
    proof: spans[sectionCount],
    faq: spans[sectionCount + 1],
  };
}

/** Longest first sentence a card sets as its 24 px lead line. */
const LEAD_MAX_CHARS = 64;

/**
 * Splits a section body into the card's lead line and the rest, as the canvas
 * does ("Founder." over "I own the product end to end..."). Only a short first
 * sentence leads; a long one, or a single sentence, stays body text.
 */
export function splitLead(body: string): { lead?: string; rest: string } {
  const match = /^(.+?[.!?])\s+(\S[\s\S]*)$/.exec(body);
  if (!match || match[1].length > LEAD_MAX_CHARS) return { rest: body };
  return { lead: match[1], rest: match[2] };
}
