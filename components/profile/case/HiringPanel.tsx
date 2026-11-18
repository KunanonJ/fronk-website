import { Pill } from "@/components/ds/Pill";
import { caseCopy } from "@/lib/content/caseStudy";

/*
 * The Hiring panel (profile redesign Phase 5, design spec 9.11): the article
 * named exactly "Hiring" that ends every case, with the availability sentence,
 * the résumé and the hiring contact. The smoke tests pin its name and both
 * links' names and targets. Styles: `.pf-case-hire*` in case.css.
 */
export function HiringPanel() {
  const { hire } = caseCopy;
  return (
    <article className="pf-case-hire" aria-labelledby="case-hire">
      <div className="pf-case-hire__text">
        <h2 id="case-hire" className="t-meta pf-case-hire__kicker">
          {hire.kicker}
        </h2>
        <p className="t-h3 pf-case-hire__heading">{hire.heading}</p>
        <p className="pf-case-hire__sentence">{hire.sentence}</p>
      </div>
      <div className="pf-case-hire__actions">
        <Pill href={hire.resume.href} variant="ghost">
          {hire.resume.label}
        </Pill>
        <Pill href={hire.contact.href} arrow="swap">
          {hire.contact.label}
        </Pill>
      </div>
    </article>
  );
}
