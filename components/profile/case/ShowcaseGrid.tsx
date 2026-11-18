import { useCallback, useState } from "react";
import { CaseLightbox } from "@/components/profile/case/CaseLightbox";
import { ShowcaseTile } from "@/components/profile/case/ShowcaseTile";
import type { ShowcaseTile as Tile } from "@/lib/content/caseStudy";

/*
 * The showcase grid (profile redesign Phase 5, design spec 9.9 and 4.2): two
 * columns from 600 px, full tiles across both, and the one viewer the tiles
 * open. A tile's pause state is shared by its page copy and its viewer copy.
 * Styles: `.pf-sc-grid` in src/styles/profile/case.css.
 */
export function ShowcaseGrid({ tiles }: { tiles: readonly Tile[] }) {
  const [open, setOpen] = useState<{ id: string; step: number } | null>(null);
  const [paused, setPaused] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = useCallback((id: string) => {
    setPaused((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const onClosed = useCallback(() => setOpen(null), []);
  const viewing = open
    ? (tiles.find((tile) => tile.id === open.id) ?? null)
    : null;

  return (
    <>
      <div className="pf-sc-grid">
        {tiles.map((tile) => (
          <ShowcaseTile
            key={tile.id}
            tile={tile}
            playing={!paused.has(tile.id)}
            hidden={viewing?.id === tile.id}
            onTogglePlaying={() => toggle(tile.id)}
            onOpen={(step) => setOpen({ id: tile.id, step })}
          />
        ))}
      </div>
      <CaseLightbox
        tile={viewing}
        initialStep={open?.step ?? 0}
        playing={viewing ? !paused.has(viewing.id) : false}
        onTogglePlaying={() => {
          if (viewing) toggle(viewing.id);
        }}
        onClosed={onClosed}
      />
    </>
  );
}
