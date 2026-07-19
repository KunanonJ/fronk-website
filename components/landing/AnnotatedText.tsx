import type { ReactNode } from "react";
import Keyword from "@/components/landing/Keyword";
import { aboutKeywords } from "@/lib/content/landing";

/**
 * Split plain text and wrap first occurrence of each about keyword tip.
 * Longer keywords win first so "ERP/CRM" beats shorter overlaps.
 */
export function AnnotatedText({ text }: { text: string }): ReactNode {
  const sorted = [...aboutKeywords].sort(
    (a, b) => b.text.length - a.text.length,
  );
  const used = new Set<string>();
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let match: (typeof aboutKeywords)[number] | null = null;

    for (const kw of sorted) {
      if (used.has(kw.text)) continue;
      const idx = remaining.indexOf(kw.text);
      if (idx === -1) continue;
      if (earliest === -1 || idx < earliest) {
        earliest = idx;
        match = kw;
      }
    }

    if (!match || earliest < 0) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliest > 0) {
      nodes.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    }
    nodes.push(
      <Keyword key={key++} tip={match.tip}>
        {match.text}
      </Keyword>,
    );
    used.add(match.text);
    remaining = remaining.slice(earliest + match.text.length);
  }

  return <>{nodes}</>;
}
