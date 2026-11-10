import {
  Bento,
  bentoSpan,
  type BentoSpan,
  Kicker,
} from "@/components/bento/Bento";
import {
  CARD,
  EXTERNAL,
  FilterBar,
  LibraryHero,
  TEXT_LINK,
  WELL,
  countLabel,
  type FilterOption,
} from "@/components/landing/library/parts";
import {
  STACK_GROUPS,
  stackItems,
  stackItemsByGroup,
  stackPage,
  type StackItem,
} from "@/lib/content/stack";
import type { StackFilter, StackGroupId } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";
import { MONO_LABEL } from "@/components/bento/classes";

/** Group markers: ink, accent, outline (decorative; the name carries it). */
const MARKER: Record<StackGroupId, string> = {
  build: "size-1.5 bg-ink",
  ship: "size-1.5 bg-mark",
  operate: "box-border size-1.5 border border-ink-2",
};

/** The same groups in the Through-line bar. */
const BAR: Record<StackGroupId, string> = {
  build: "bg-ink",
  ship: "bg-mark",
  operate: "bg-ink-3",
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

function domain(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** One tool: a row link with its mono badge, use and domain. */
function ToolRow({ item }: { item: StackItem }) {
  return (
    <li className="min-w-0 border-t border-hairline">
      <a
        href={item.website}
        {...EXTERNAL}
        className="kj-row -mx-2 flex min-h-11 items-start gap-3 rounded-row px-2 py-3 text-ink no-underline"
      >
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-tint font-mono text-xs font-medium text-ink-2"
        >
          {item.badge}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-card font-medium">{item.name}</span>
          <span className="text-meta leading-[1.45] text-ink-2">
            {item.purpose}
          </span>
          <span className="font-mono text-xs [overflow-wrap:anywhere] text-link">
            {domain(item.website)} →
          </span>
        </span>
      </a>
    </li>
  );
}

/** A group card: kicker with its marker, tool count, the tool rows. */
function GroupCard({
  id,
  span,
  twoColumn,
}: {
  id: StackGroupId;
  span: BentoSpan;
  twoColumn: boolean;
}) {
  const group = STACK_GROUPS.find((g) => g.id === id);
  const items = stackItemsByGroup(id);
  return (
    <article
      aria-labelledby={`group-${id}`}
      className={cn(CARD, "gap-3", bentoSpan(span))}
    >
      <div className="flex items-center justify-between gap-3">
        <Kicker id={`group-${id}`} marker={MARKER[id]}>
          {group?.label}
        </Kicker>
        <span className={MONO_LABEL}>
          {countLabel(items.length, "tool", "tools")}
        </span>
      </div>
      <ul
        className={cn(
          "m-0 grid list-none grid-cols-1 gap-x-6 p-0",
          twoColumn && "min-[641px]:grid-cols-2",
        )}
      >
        {items.map((item) => (
          <ToolRow key={item.name} item={item} />
        ))}
      </ul>
    </article>
  );
}

/** Through-line: the lead tool, the counts, the group split, the orgs. */
function ThroughLineCard({ span }: { span: BentoSpan }) {
  const lead = stackItems.find((item) => item.name === stackPage.throughLine);
  const stats = [
    { label: "Tools", value: stackItems.length },
    { label: "Groups", value: STACK_GROUPS.length },
    { label: "GitHub orgs", value: stackPage.orgs.length },
  ];
  return (
    <article
      aria-labelledby="card-through"
      className={cn(CARD, "gap-5", bentoSpan(span))}
    >
      <Kicker id="card-through">Through-line</Kicker>
      {lead ? (
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden
            className="inline-flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-surface-tint font-mono text-xl font-medium text-mark"
          >
            {lead.badge}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="m-0 text-[clamp(28px,3.6vw,40px)] leading-[1.1] font-semibold tracking-[-0.03em]">
              {lead.name}
            </h3>
            <p className="m-0 text-card leading-[1.5] text-ink-2">
              {lead.purpose}
            </p>
          </div>
        </div>
      ) : null}
      <dl className="m-0 flex flex-wrap gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              WELL,
              "flex flex-[1_1_120px] flex-col-reverse gap-1 px-4 py-3.5",
            )}
          >
            <dt className={MONO_LABEL}>{stat.label}</dt>
            <dd className="m-0 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2.5">
        <div aria-hidden className="flex h-2.5 gap-[3px]">
          {STACK_GROUPS.map((group) => (
            <span
              key={group.id}
              className={cn("basis-0 rounded-full", BAR[group.id])}
              style={{ flexGrow: stackItemsByGroup(group.id).length }}
            />
          ))}
        </div>
        <p className={cn(MONO_LABEL, "flex flex-wrap gap-x-[18px] gap-y-1.5")}>
          {STACK_GROUPS.map((group) => (
            <span key={group.id} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("size-1.5", BAR[group.id])} />
              {group.label} {stackItemsByGroup(group.id).length}
            </span>
          ))}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1">
        {stackPage.orgs.map((org) => (
          <a
            key={org.href}
            href={org.href}
            {...EXTERNAL}
            className={cn(TEXT_LINK, "[overflow-wrap:anywhere]")}
          >
            {org.label} →
          </a>
        ))}
      </div>
    </article>
  );
}

/**
 * Stack (bento redesign, phase 7f; design spec 4.12): the filter bar, then a
 * card per group and the Through-line card. All groups: Ship (two columns,
 * its tools in two columns) beside Build, then Operate beside Through-line.
 * One group: that group and Through-line full width. The group is the
 * `?group=` search param, owned by the route.
 */
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

  return (
    <>
      <LibraryHero
        eyebrow={stackPage.eyebrow}
        headline={stackPage.headline}
        lede={stackPage.description}
      />
      <section aria-label="Tools by group" className="flex flex-col gap-5">
        <FilterBar
          label="Filter tools by group"
          options={FILTERS}
          value={group}
          onChange={onGroupChange}
          result={result}
        />
        <Bento>
          {all ? (
            GRID_ORDER.map((id) => (
              <GroupCard
                key={id}
                id={id}
                span={id === "ship" ? 2 : 1}
                twoColumn={id === "ship"}
              />
            ))
          ) : (
            <GroupCard key={group} id={group} span={3} twoColumn />
          )}
          <ThroughLineCard span={all ? 2 : 3} />
        </Bento>
      </section>
    </>
  );
}
