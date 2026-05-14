import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Resume",
  description: "Kunanon Jarat (Fronk) — experience, projects, education, and certifications.",
};

interface TimelineItem {
  title: string;
  org: string;
  period: string;
  href?: string;
  bullets: readonly string[];
}

const experience: readonly TimelineItem[] = [
  {
    title: "Founder",
    org: "The Binary Holdings",
    period: "2024 — Present · Bangkok",
    bullets: [
      "Operating company behind GoGoCash, GoGoCare, and earlier ventures.",
      "Focus areas: fintech rails, AI-assisted product development, on-chain infrastructure.",
      "Wear product, engineering, and GTM hats across the portfolio.",
    ],
  },
];

const projects: readonly TimelineItem[] = [
  {
    title: "GoGoCare",
    org: "Founder · Healthcare benefits",
    period: "Jun 2025 — Present",
    href: "/ventures/gogocare",
    bullets: [
      "Building accessible healthcare benefits infrastructure for modern teams.",
    ],
  },
  {
    title: "GoGoCash",
    org: "Founder · Fintech",
    period: "Nov 2024 — Present",
    href: "/ventures/gogocash",
    bullets: [
      "On-demand cash-access product with transparent pricing.",
      "Live at gogocash.co.",
    ],
  },
  {
    title: "Talent Wizard",
    org: "Co-founder · AI + Blockchain",
    period: "May 2023 — Mar 2024",
    href: "/ventures/talent-wizard",
    bullets: [
      "AI and blockchain technologies applied to product requirements — drafting, sign-off, and traceability.",
    ],
  },
  {
    title: "Saving Plus",
    org: "Founder · Fintech",
    period: "Dec 2022 — Mar 2023",
    href: "/ventures/saving-plus",
    bullets: [
      "Mobile-first savings product aimed at first-time savers.",
    ],
  },
  {
    title: "Nicha NFT Marketplace",
    org: "Co-founder · Web3",
    period: "Oct — Dec 2022",
    href: "/ventures/nicha",
    bullets: [
      "Curated NFT marketplace for Southeast Asian creators.",
    ],
  },
];

const education: readonly TimelineItem[] = [
  {
    title: "Kasetsart University",
    org: "[degree — fill in major]",
    period: "2017 — 2021 · Bangkok",
    bullets: [
      "Founder & President — TEDxKasetsartU.",
      "Vice President — KU Startup.",
      "CMO — KU Moresheet.",
      "Research assistant — LoRa wireless technology.",
    ],
  },
];

const certifications: readonly TimelineItem[] = [
  {
    title: "Ethereum Smart Contract Security",
    org: "Moralis Academy",
    period: "Dec 2021",
    bullets: [],
  },
  {
    title: "Ethereum Smart Contract Programming 101",
    org: "Moralis Academy",
    period: "Dec 2021",
    bullets: [],
  },
  {
    title: "Ethereum 101",
    org: "Moralis Academy",
    period: "Dec 2021",
    bullets: [],
  },
  {
    title: "Blockchain & Bitcoin 101",
    org: "Moralis Academy",
    period: "Dec 2021",
    bullets: [],
  },
  {
    title: "Smart Contract",
    org: "University at Buffalo",
    period: "Oct 2021",
    bullets: [],
  },
  {
    title: "PMP Certification Exam Prep",
    org: "Udemy",
    period: "—",
    bullets: [],
  },
];

const skills = [
  "Founder operations",
  "Product strategy",
  "Fintech / payments",
  "Web3 / smart contracts",
  "AI / LLM integration",
  "Full-stack TypeScript",
  "Next.js · React",
  "Solidity · Ethereum",
  "GTM for early-stage products",
  "Project management (PMP-trained)",
] as const;

export default function ResumePage() {
  return (
    <Container size="lg" className="py-20">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted">Resume</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Kunanon Jarat
          </h1>
          <p className="mt-2 text-muted">
            Founder. Based in Bangkok.
          </p>
        </div>
        <Button href="/resume.pdf" variant="secondary">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </header>

      <section className="space-y-12">
        <TimelineSection title="Experience" items={experience} />
        <TimelineSection title="Selected projects" items={projects} />
        <TimelineSection title="Education" items={education} />
        <TimelineSection title="Certifications" items={certifications} />

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

function TimelineSection({
  title,
  items,
}: {
  title: string;
  items: readonly TimelineItem[];
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
                {item.href ? (
                  <Link href={item.href} className="hover:text-accent">
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}{" "}
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
