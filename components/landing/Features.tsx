import Link from "@/components/navigation/Link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { ventures } from "@/lib/content/landing";

/**
 * Home ventures (visual-redesign Phase 2): one card per venture, rendered once,
 * with a unique link name per destination ("GoGoCash case study"). No video
 * or stock photo cards. Server component.
 */
export default function Features() {
  return (
    <Section
      id="ventures"
      eyebrow={ventures.eyebrow}
      heading={ventures.heading}
      className="scroll-mt-28"
    >
      <p className="-mt-4 mb-10 max-w-2xl text-lead text-ink-2">
        {ventures.subheading}
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {ventures.cards.map((card) => (
          <li key={card.href}>
            <Card className="flex h-full flex-col p-6 sm:p-8">
              <div className="flex items-center justify-between">
                {/* Decorative: the venture name is the heading below. */}
                <img
                  src={card.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-chip object-cover"
                />
                <span className="font-mono text-label text-ink-2">
                  {card.number}
                </span>
              </div>
              <h3 className="mt-6 text-h3 text-ink">{card.title}</h3>
              <p className="mt-2 text-body text-ink-2">{card.summary}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {card.items.map((item) => (
                  <li key={item}>
                    <Chip>{item}</Chip>
                  </li>
                ))}
              </ul>
              <Link
                href={card.href}
                className="mt-8 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-medium text-link underline-offset-4 hover:underline"
              >
                {card.linkLabel}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
