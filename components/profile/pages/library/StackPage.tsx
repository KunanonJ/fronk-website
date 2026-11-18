import { PixelBadge } from "@/components/profile/home/PixelIcon";
import {
  ArrowLink,
  BlockHead,
  FilterBar,
  countLabel,
  type FilterOption,
} from "@/components/profile/pages/library/parts";
import {
  ReadingHero,
  SegmentHeadline,
} from "@/components/profile/pages/ReadingHero";
import {
  STACK_GROUPS,
  stackItems,
  stackItemsByGroup,
  stackPage,
  type StackItem,
} from "@/lib/content/stack";
import { orbitRing, type PixelTone } from "@/lib/landing/journey";
import type { StackFilter, StackGroupId } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";

/*
 * /stack (profile redesign, Phase 7 lane D1, plan step 7d): the hero, the
 * group filter, then a tile per group and the Through-line tile. Each tool
 * wears its pixel badge from the Home's Journey orbit (Phase 4; umbrella R18,
 * its default: our own badges from the two letters, never brand marks), in
 * the same colour it has there. All groups: Ship (two columns, its tools in
 * two columns) beside Build, then Operate beside Through-line. One group:
 * that group and Through-line full width. The group is the `?group=` search
 * param, owned by the route; the prerendered page shows every group.
 */

/** Group markers: ink, accent, outline (decorative; the name carries it). */
const MARKER: Record<StackGroupId, string> = {
  build: "pf-read-marker--ink",
  ship: "pf-read-marker--accent",
  operate: "pf-read-marker--line",
};

/** The canvas grid order: Ship leads at two columns, Build and Operate follow. */
const GRID_ORDER: readonly StackGroupId[] = ["ship", "build", "operate"];

const FILTERS: readonly FilterOption<StackFilter>[] = [
  { id: "all", label: "All", count: stackItems.length },
  ...STACK_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    count: stackItemsByGroup(group.id).length,
  })),
];

/** Each tool's colour in the Journey orbit, so a badge matches on both pages. */
const TONE = new Map<string, PixelTone>(
  orbitRing().flatMap((item) =>
    item.type === "tool" ? [[item.name, item.tone] as const] : [],
  ),
);

function domain(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** One tool: a row link with its pixel badge, use and domain (new tab). */
function ToolRow({ item }: { item: StackItem }) {
  return (
    <li className="pf-read-tool">
      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="pf-read-tool__link"
      >
        <PixelBadge
          badge={item.badge}
          tone={TONE.get(item.name) ?? "violet"}
          className="pf-read-badge"
        />
        <span className="pf-read-tool__text">
          <span className="pf-read-tool__name">
            {item.name}
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
          <span className="t-small text-ink-2">{item.purpose}</span>
          <span className="t-meta pf-read-path">
            {domain(item.website)} <span aria-hidden="true">↗</span>
          </span>
        </span>
      </a>
    </li>
  );
}

/** A group tile: kicker with its marker, tool count, the tool rows. */
function GroupTile({
  id,
  wide,
  twoColumn,
}: {
  id: StackGroupId;
  wide: boolean;
  twoColumn: boolean;
}) {
  const group = STACK_GROUPS.find((g) => g.id === id);
  const items = stackItemsByGroup(id);
  return (
    <article
      aria-labelledby={`group-${id}`}
      className={cn("ds-tile pf-read-tile", wide && "pf-read-wide")}
    >
      <BlockHead
        id={`group-${id}`}
        title={group?.label}
        marker={MARKER[id]}
        note={countLabel(items.length, "tool", "tools")}
      />
      <ul className={cn("pf-read-tools", twoColumn && "pf-read-tools--two")}>
        {items.map((item) => (
          <ToolRow key={item.name} item={item} />
        ))}
      </ul>
    </article>
  );
}

/** Through-line: the lead tool, the counts, the group split, the orgs. */
function ThroughLine({ wide }: { wide: boolean }) {
  const lead = stackItems.find((item) => item.name === stackPage.throughLine);
  const stats = [
    { label: "Tools", value: stackItems.length },
    { label: "Groups", value: STACK_GROUPS.length },
    { label: "GitHub orgs", value: stackPage.orgs.length },
  ];
  return (
    <article
      aria-labelledby="card-through"
      className={cn("ds-tile pf-read-tile", wide && "pf-read-wide")}
    >
      <BlockHead id="card-through" title="Through-line" />
      {lead ? (
        <div className="pf-read-lead-tool">
          <PixelBadge
            badge={lead.badge}
            tone={TONE.get(lead.name) ?? "violet"}
            className="pf-read-badge pf-read-badge--lg"
          />
          <div className="pf-read-tool__text">
            <h3 className="t-card-title pf-read-title">{lead.name}</h3>
            <p className="t-body pf-read-text">{lead.purpose}</p>
          </div>
        </div>
      ) : null}
      <dl className="pf-read-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="pf-read-stat">
            <dt className="t-meta text-ink-2">{stat.label}</dt>
            <dd className="t-h3 pf-read-figure">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div aria-hidden="true" className="pf-read-bar">
        {STACK_GROUPS.map((group) => (
          <span
            key={group.id}
            className={cn("pf-read-bar__part", MARKER[group.id])}
            style={{ flexGrow: stackItemsByGroup(group.id).length }}
          />
        ))}
      </div>
      <p className="t-meta pf-read-legend">
        {STACK_GROUPS.map((group) => (
          <span key={group.id}>
            <span
              aria-hidden="true"
              className={cn("pf-read-marker", MARKER[group.id])}
            />
            {group.label} {stackItemsByGroup(group.id).length}
          </span>
        ))}
      </p>
      <div className="pf-read-links">
        {stackPage.orgs.map((org) => (
          <ArrowLink key={org.href} href={org.href} external>
            {org.label}
          </ArrowLink>
        ))}
      </div>
    </article>
  );
}

export default function StackPage({
  group,
  onGroupChange,
}: {
  group: StackFilter;
  onGroupChange: (next: StackFilter) => void;
}) {
  const all = group === "all";
  const picked = FILTERS.find((f) => f.id === group) ?? FILTERS[0];
  const total = stackItems.length;
  const result = all
    ? `Showing all ${total} tools`
    : `Showing ${picked.count} of ${total} tools · ${picked.label}`;
  const { headline } = stackPage;

  return (
    <>
      <ReadingHero
        eyebrow={stackPage.eyebrow}
        title={
          <SegmentHeadline
            lines={[...headline.lines, [headline.accent]]}
            joiner=" "
          />
        }
        lead={stackPage.description}
      />
      <section aria-label="Tools by group" className="ds-wrap pf-read-body">
        <div>
          <FilterBar
            label="Filter tools by group"
            options={FILTERS}
            value={group}
            onChange={onGroupChange}
            result={result}
          />
          <div className={cn("pf-read-board", !all && "pf-read-board--one")}>
            {all ? (
              GRID_ORDER.map((id) => (
                <GroupTile
                  key={id}
                  id={id}
                  wide={id === "ship"}
                  twoColumn={id === "ship"}
                />
              ))
            ) : (
              <GroupTile key={group} id={group} wide twoColumn />
            )}
            <ThroughLine wide={all} />
          </div>
        </div>
      </section>
    </>
  );
}
