import { useEffect, useRef } from "react";
import type { FaqItem } from "@/lib/seo/jsonLd";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The FAQ as native disclosures (profile redesign: About since the Phase 6
 * cutover, the topic hubs since Phase 7): a question per `details`, the first
 * one open, every answer in the HTML (the FAQPage JSON-LD's text). Printing
 * opens every closed answer and closes it again afterwards, so the paper
 * carries all of them; where the engine has `::details-content`, the print
 * stylesheet shows them too (src/styles/profile/pages-hubs.css). `numbered`
 * draws each question's number before it, hidden from assistive technology.
 * Styles: `.pf-faq*` in cutover.css, the number in pages-hubs.css.
 */
export function FaqList({
  items,
  numbered = false,
}: {
  items: readonly FaqItem[];
  numbered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let opened: HTMLDetailsElement[] = [];
    const beforePrint = () => {
      opened = [
        ...list.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
      ];
      for (const item of opened) item.open = true;
    };
    // Only the answers printing opened close again; one the reader opened
    // stays open.
    const afterPrint = () => {
      for (const item of opened) item.open = false;
      opened = [];
    };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  return (
    <div ref={ref} className="pf-faq">
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className="pf-faq__item"
        >
          <summary className="pf-faq__question">
            {numbered ? (
              <span className="t-meta pf-faq__number" aria-hidden="true">
                {pad2(index + 1)}
              </span>
            ) : null}
            <h3 className="pf-faq__heading">{item.question}</h3>
            <span className="pf-faq__mark" aria-hidden="true" />
          </summary>
          <p className="t-body pf-faq__answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
