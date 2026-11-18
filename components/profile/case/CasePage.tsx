import { Reveal } from "@/components/ds/Reveal";
import { CaseChapter } from "@/components/profile/case/CaseChapter";
import { CaseHero } from "@/components/profile/case/CaseHero";
import { CaseContents, CaseRail } from "@/components/profile/case/CaseRail";
import { HiringPanel } from "@/components/profile/case/HiringPanel";
import { MoreProjects } from "@/components/profile/case/MoreProjects";
import { useChapterNav } from "@/components/profile/case/useChapterNav";
import type { CaseStudy } from "@/lib/content/caseStudy";

/*
 * The case-study template (profile redesign Phase 5, design spec 9): the
 * hero with the evidence rows, the cover and the meta row; then the phone
 * contents, the chapters beside the sticky rail, the Hiring panel at the end
 * of the column; then More projects. The footer comes from the layout.
 * Every case renders from lib/content/caseStudy.ts, which reads today's
 * content modules. Styles: src/styles/profile/case.css.
 */
export default function CasePage({ study }: { study: CaseStudy }) {
  const { active, go } = useChapterNav(study.chapters.map(({ id }) => id));
  return (
    <div className="pf-case" data-kind={study.kind}>
      <CaseHero study={study} />
      <div className="ds-wrap pf-case-body-wrap">
        <CaseContents chapters={study.chapters} active={active} go={go} />
        <div className="pf-case-body">
          <CaseRail chapters={study.chapters} active={active} go={go} />
          <div className="pf-case-column">
            {study.chapters.map((chapter) => (
              <Reveal key={chapter.id} className="pf-case-step">
                <CaseChapter chapter={chapter} />
              </Reveal>
            ))}
            <Reveal className="pf-case-step pf-case-step--hire">
              <HiringPanel />
            </Reveal>
          </div>
        </div>
      </div>
      <MoreProjects cards={study.more} />
    </div>
  );
}
