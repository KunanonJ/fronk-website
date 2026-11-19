import { Reveal } from "@/components/ds/Reveal";
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
import type { BlogCard } from "@/lib/content/blog";
import {
  getLearnHubs,
  getLearnWritingLinks,
  learnOperatorNotes,
  learnPage,
  type LearnHub,
  type LearnLink,
} from "@/lib/content/learn";
import type { LearnLang } from "@/lib/library/search";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * /learn (profile redesign, Phase 7 lane D1, plan step 7d): the hero with
 * what the page holds, then the topic hubs in the chosen language (the first
 * one leads, with its path and the other language), then the operator notes.
 * The language is the `?lang=` search param, owned by the route; /learn
 * renders on request, so the server already renders the requested language.
 * Writing (posts) shows only while the blog is public (`BLOG_PUBLIC`); until
 * then nothing here links to /blog.
 */

const LANG_OPTIONS: readonly FilterOption<LearnLang>[] = [
  { id: "en", label: "English", code: "EN", lang: "en" },
  { id: "th", label: "ไทย", code: "TH", lang: "th" },
];

const LANG_NAME: Record<LearnLang, string> = { en: "English", th: "Thai" };

/**
 * A hub in the chosen language, under "Read the hubs in" (so its title is an
 * h3); the first leads, with its path and the other language.
 */
function HubCard({ hub, index }: { hub: LearnHub; index: number }) {
  const lead = index === 0;
  const id = `hub-${hub.slug}`;
  return (
    <article
      aria-labelledby={id}
      className={cn("ds-tile pf-read-tile", lead && "pf-read-lead")}
    >
      <p className="t-meta text-ink-2">Topic hub · {pad2(index + 1)}</p>
      {lead ? (
        <p className="t-meta pf-read-path">
          {hub.lang.toUpperCase()} · {hub.href}
        </p>
      ) : null}
      <h3
        id={id}
        lang={hub.lang}
        className={cn(lead ? "t-card-title" : "t-h3", "pf-read-title")}
      >
        {hub.title}
      </h3>
      <p lang={hub.lang} className="t-body pf-read-text">
        {hub.lede}
      </p>
      <div className="pf-read-links">
        <ArrowLink href={hub.href} label={`Open hub: ${hub.title}`}>
          Open hub
        </ArrowLink>
        {lead ? (
          <ArrowLink
            href={hub.alt.href}
            lang={hub.alt.lang}
            hrefLang={hub.alt.lang}
          >
            {hub.alt.label}
          </ArrowLink>
        ) : null}
      </div>
    </article>
  );
}

/** Operator notes (and Writing, while the blog is public): numbered tiles. */
function LinkList({
  id,
  title,
  unit,
  cta,
  items,
}: {
  id: string;
  title: string;
  unit: [one: string, many: string];
  cta: string;
  items: readonly LearnLink[];
}) {
  return (
    <article aria-labelledby={id}>
      <BlockHead
        id={id}
        title={title}
        note={countLabel(items.length, unit[0], unit[1])}
      />
      <ul className="pf-read-flex">
        {items.map((item, i) => (
          <li key={item.href} className="ds-tile pf-read-tile">
            <p className="t-meta text-ink-2">{pad2(i + 1)}</p>
            <h3 className="t-lift-title pf-read-title">{item.title}</h3>
            <p className="t-small pf-read-text">{item.description}</p>
            <div className="pf-read-links">
              <ArrowLink href={item.href} label={`${cta}: ${item.title}`}>
                {cta}
              </ArrowLink>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function LearnPage({
  posts,
  lang,
  onLangChange,
}: {
  posts: readonly BlogCard[];
  lang: LearnLang;
  onLangChange: (next: LearnLang) => void;
}) {
  const { headline } = learnPage;
  const hubs = getLearnHubs(lang);
  const writing = getLearnWritingLinks(posts);

  return (
    <>
      <ReadingHero
        eyebrow={learnPage.eyebrow}
        title={
          <SegmentHeadline
            lines={[
              [{ muted: headline.muted }, ` ${headline.rest}`],
              [headline.accent],
            ]}
            joiner=" "
          />
        }
        lead={learnPage.lede}
      >
        <ul aria-label="On this page" className="pf-read-chips">
          <li className="ds-chip">
            <span className="pf-count">{pad2(hubs.length)}</span> Topic hubs
          </li>
          {writing.length > 0 ? (
            <li className="ds-chip">
              <span className="pf-count">{pad2(writing.length)}</span> Writing
            </li>
          ) : null}
          <li className="ds-chip">
            <span className="pf-count">{pad2(learnOperatorNotes.length)}</span>{" "}
            Operator notes
          </li>
          <li className="ds-chip">
            English · <span lang="th">ไทย</span>
          </li>
        </ul>
      </ReadingHero>
      <div className="ds-wrap pf-read-body">
        <section aria-labelledby="card-language">
          <BlockHead
            id="card-language"
            title="Read the hubs in"
            note={
              <span aria-hidden="true">
                {LANG_OPTIONS.find((option) => option.id === lang)?.code}
              </span>
            }
          />
          <FilterBar
            label="Hub language"
            options={LANG_OPTIONS}
            value={lang}
            onChange={onLangChange}
            result={`Showing ${hubs.length} hubs in ${LANG_NAME[lang]}`}
          />
          <div className="pf-read-flex">
            {hubs.map((hub, index) => (
              <HubCard key={hub.slug} hub={hub} index={index} />
            ))}
          </div>
        </section>
        {writing.length > 0 ? (
          <Reveal>
            <LinkList
              id="card-writing"
              title="Writing"
              unit={["post", "posts"]}
              cta="Read"
              items={writing}
            />
          </Reveal>
        ) : null}
        <Reveal>
          <LinkList
            id="card-notes"
            title="Operator notes"
            unit={["note", "notes"]}
            cta="Open"
            items={learnOperatorNotes}
          />
        </Reveal>
      </div>
    </>
  );
}
