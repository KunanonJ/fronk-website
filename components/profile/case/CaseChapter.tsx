import { Chip, PixelMark } from "@/components/ds/labels";
import { TextLink } from "@/components/ds/TextLink";
import { CaseLayers } from "@/components/profile/case/CaseLayers";
import { CaseSteps } from "@/components/profile/case/CaseSteps";
import { FactStrip } from "@/components/profile/case/FactStrip";
import { PointList } from "@/components/profile/case/PointList";
import { ShowcaseGrid } from "@/components/profile/case/ShowcaseGrid";
import type {
  CaseBlock,
  CaseChapter as Chapter,
} from "@/lib/content/caseStudy";

/*
 * A chapter (profile redesign Phase 5, design spec 9.7): `section#ch-NN` with
 * its kicker (the pixel mark, the number, a slash, the title in mono), then
 * its blocks. With no headline cleared for it (owner input), the kicker is
 * the chapter's h2, named by its title alone; the number and the slash are
 * decoration the contents list already gives. The section takes focus when
 * the contents move to it. Styles: `.pf-case-chapter*` in case.css.
 */

function Block({ block }: { block: CaseBlock }) {
  switch (block.type) {
    case "prose":
      return (
        <div className="t-prose pf-case-prose">
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      );
    case "facts":
      return <FactStrip items={block.items} />;
    case "points":
      return <PointList items={block.items} />;
    case "steps":
      return <CaseSteps label={block.label} steps={block.steps} />;
    case "layers":
      return <CaseLayers label={block.label} layers={block.layers} />;
    case "chips":
      return (
        <ul aria-label={block.label} className="pf-case-chips">
          {block.items.map((item) => (
            <li key={item}>
              <Chip>{item}</Chip>
            </li>
          ))}
        </ul>
      );
    case "links":
      return (
        <div className="pf-case-links">
          <ul aria-label={block.label} className="pf-case-links__list">
            {block.links.map((link) => (
              <li key={link.href}>
                <TextLink href={link.href}>{link.label}</TextLink>
              </li>
            ))}
          </ul>
          {block.more ? (
            <TextLink href={block.more.href}>{block.more.label}</TextLink>
          ) : null}
        </div>
      );
    case "showcase":
      return <ShowcaseGrid tiles={block.tiles} />;
  }
}

function Kicker({ chapter, as: Tag }: { chapter: Chapter; as: "h2" | "p" }) {
  return (
    <Tag className="t-kicker pf-case-kicker">
      <PixelMark />
      <span aria-hidden="true">{chapter.number}</span>
      <span aria-hidden="true" className="pf-case-kicker__slash">
        /
      </span>
      <span>{chapter.title}</span>
    </Tag>
  );
}

export function CaseChapter({ chapter }: { chapter: Chapter }) {
  return (
    <section id={chapter.id} className="pf-case-chapter" tabIndex={-1}>
      {chapter.headline ? (
        <>
          <Kicker chapter={chapter} as="p" />
          <h2 className="t-h3 pf-case-chapter__headline">{chapter.headline}</h2>
        </>
      ) : (
        <Kicker chapter={chapter} as="h2" />
      )}
      {chapter.blocks.map((block, index) => (
        <Block key={`${block.type}-${index}`} block={block} />
      ))}
    </section>
  );
}
