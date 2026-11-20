import { useEffect, useRef } from "react";
import { Pill } from "@/components/ds/Pill";
import { caseCopy } from "@/lib/content/caseStudy";

/*
 * The Work together panel (profile redesign Phase 5, design spec 9.11; the
 * Hiring panel until the owner's direction of 20-11-26): the article named
 * exactly "Work together" that ends every case, with the availability and
 * what he is open to, the résumé and the contact form with "Freelance or
 * consulting" chosen. The smoke tests pin its name and both links' names and
 * targets. Styles: `.pf-case-work*` in case.css.
 *
 * A reader who scrolls down to it finds the Gold glasses trait
 * (now-building-and-genz Phase 3; the toast says so). Only after a scroll:
 * a page that opens with it in view, or a full-page capture, finds nothing.
 * The trait store loads then, not with the page.
 */
export function WorkTogetherPanel() {
  const { work } = caseCopy;
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.scrollY <= 0 || !entries.some((e) => e.isIntersecting)) {
          return;
        }
        observer.disconnect();
        void import("@/lib/brand/traitStore").then((store) =>
          store.award("glasses", "case"),
        );
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article ref={panel} className="pf-case-work" aria-labelledby="case-work">
      <div className="pf-case-work__text">
        <h2 id="case-work" className="t-meta pf-case-work__kicker">
          {work.kicker}
        </h2>
        <p className="t-h3 pf-case-work__heading">{work.heading}</p>
        <p className="pf-case-work__sentence">{work.sentence}</p>
      </div>
      <div className="pf-case-work__actions">
        <Pill href={work.resume.href} variant="ghost">
          {work.resume.label}
        </Pill>
        <Pill href={work.contact.href} arrow="swap">
          {work.contact.label}
        </Pill>
      </div>
    </article>
  );
}
