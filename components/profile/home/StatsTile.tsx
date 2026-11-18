import { DitherField } from "@/components/ds/DitherField";
import { PixelNumber } from "@/components/profile/home/PixelNumber";
import type { AboutStat } from "@/lib/landing/aboutStats";

/*
 * The About bento's stats tile (profile redesign Phase 3, design spec 8.5):
 * the dark violet wash with a dither field, up to three cleared figures in
 * pixel digits with mono labels, and a footnote that says where they come
 * from. The wash and its pixels are the same in both themes, so the white
 * text keeps 5.6:1 or more over any of them.
 */

/** Theme-invariant violets, so the white figures keep their contrast. */
const SKY = ["--stats-1", "--stats-2"] as const;

export function StatsTile({
  stats,
  footnote,
}: {
  stats: readonly AboutStat[];
  footnote: string;
}) {
  return (
    <div className="ds-tile ds-tile--stats pf-bento__tile pf-bento__stats">
      <div className="pf-stats__sky">
        <DitherField stops={SKY} fade="right" cell={12} seed={5} />
      </div>
      <ul className="pf-stats">
        {stats.map((stat) => (
          <li key={stat.label} className="pf-stats__item">
            <PixelNumber value={stat.figure} />
            <p className="t-meta pf-stats__label">{stat.label}</p>
          </li>
        ))}
      </ul>
      <p className="t-small pf-stats__foot">{footnote}</p>
    </div>
  );
}
