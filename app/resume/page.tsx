import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Resume",
  description: "Fronk Kunanon Jarat — experience, education, and selected work.",
};

interface ResumeItem {
  title: string;
  org: string;
  period: string;
  bullets: readonly string[];
}

const experience: readonly ResumeItem[] = [
  {
    title: "Founder & CEO",
    org: "Atlas (current)",
    period: "2024 — Present",
    bullets: [
      "Building infrastructure for small engineering teams to ship at startup speed.",
      "Led a $X seed round; design-partner traction across fintech, devtools, and consumer.",
      "Wear product, sales, and engineering hats depending on the week.",
    ],
  },
  {
    title: "Founder",
    org: "Lumen",
    period: "2023 — Present",
    bullets: [
      "Privacy-first analytics for indie builders. Bootstrapped and profitable.",
      "Crossed 1,200 paying customers on a single $9/mo plan.",
    ],
  },
  {
    title: "Co-founder",
    org: "Tessera (shut down)",
    period: "2022 — 2023",
    bullets: [
      "Two-sided marketplace for open-source support contracts.",
      "Reached early GMV before structural marketplace dynamics made the model unviable.",
      "Returned remaining funds; wrote a public post-mortem.",
    ],
  },
];

const education: readonly ResumeItem[] = [
  {
    title: "B.S. in Computer Science",
    org: "[University, placeholder]",
    period: "20XX — 20XX",
    bullets: [],
  },
];

const skills = [
  "Founder operations",
  "Product strategy",
  "Engineering management",
  "Distributed systems",
  "TypeScript / Go / Rust",
  "Postgres / ClickHouse",
  "GTM for technical products",
] as const;

export default function ResumePage() {
  return (
    <Container size="lg" className="py-20">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted">Resume</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Fronk Kunanon Jarat
          </h1>
          <p className="mt-2 text-muted">
            Founder, builder, writer. Based in Bangkok.
          </p>
        </div>
        <Button href="/resume.pdf" variant="secondary">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </header>

      <section className="space-y-12">
        <ResumeSection title="Experience" items={experience} />
        <ResumeSection title="Education" items={education} />

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-subtle/40 px-3 py-1 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}

function ResumeSection({
  title,
  items,
}: {
  title: string;
  items: readonly ResumeItem[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </h2>
      <div className="space-y-8 border-l border-border pl-6">
        {items.map((item) => (
          <article key={`${item.title}-${item.org}`} className="relative">
            <span className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-accent" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium">
                {item.title}{" "}
                <span className="text-muted">— {item.org}</span>
              </h3>
              <span className="text-sm text-muted">{item.period}</span>
            </div>
            {item.bullets.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>— {bullet}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
