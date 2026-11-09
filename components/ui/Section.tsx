import { useId, type ReactNode } from "react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { cn } from "@/lib/utils/cn";

/**
 * Page section with the redesign's vertical rhythm: 64 px on phones, 96 px
 * from md, 128 px from lg (visual-redesign Phase 0). When a heading is given,
 * the section is labelled by it for assistive tech.
 */
export function Section({
  eyebrow,
  heading,
  headingLevel = 2,
  id,
  className,
  innerClassName,
  children,
}: {
  eyebrow?: ReactNode;
  heading?: ReactNode;
  headingLevel?: 2 | 3;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  const generated = useId();
  const headingId = heading ? `${id ?? generated}-heading` : undefined;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("px-4 py-16 sm:px-6 md:py-24 lg:py-32", className)}
    >
      <div className={cn("mx-auto w-full max-w-6xl", innerClassName)}>
        {eyebrow ? <MonoLabel className="mb-3">{eyebrow}</MonoLabel> : null}
        {heading ? (
          <Heading
            id={headingId}
            className={cn(
              "font-display text-ink",
              headingLevel === 2 ? "text-h2" : "text-h3",
            )}
          >
            {heading}
          </Heading>
        ) : null}
        <div className={heading || eyebrow ? "mt-8 md:mt-10" : undefined}>
          {children}
        </div>
      </div>
    </section>
  );
}
