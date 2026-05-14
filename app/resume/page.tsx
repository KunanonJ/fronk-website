import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Kunanon Jarat (Fronk) — Founder, IT manager, and project leader across fintech, AI, and Web3.",
};

interface TimelineItem {
  title: string;
  org: string;
  period: string;
  href?: string;
  bullets?: readonly string[];
}

const currently: readonly TimelineItem[] = [
  {
    title: "IT Manager",
    org: "The Binary Holdings · Full-time · On-site, Bangkok",
    period: "Nov 2025 — Present",
    bullets: [
      "Owning IT infrastructure and operations across the group.",
    ],
  },
  {
    title: "Founder",
    org: "GoGoCash · Remote, Bangkok",
    period: "May 2023 — Present",
    href: "/ventures/gogocash",
    bullets: [
      "Founded and lead the company; drive growth and product direction.",
      "Live at gogocash.co.",
    ],
  },
];

const experience: readonly TimelineItem[] = [
  {
    title: "AI Project Manager",
    org: "Aiden Labs · Full-time · Hybrid",
    period: "Jan 2025 — Oct 2025",
    bullets: [
      "Turned product ideas into shippable roadmaps and public-sale launches.",
      "Designed ICO process strategy and refined tokenomics allocation.",
      "Coordinated operational support across the team.",
    ],
  },
  {
    title: "Strategic Advisor",
    org: "Aiden Labs · Part-time · Remote",
    period: "Nov 2024 — Jan 2025",
    bullets: [
      "Strategic planning support; engagement converted into a full-time PM role.",
    ],
  },
  {
    title: "Technical Project Manager",
    org: "The Binary Holdings · Full-time · On-site, Bangkok",
    period: "Sep 2024 — Dec 2024",
    bullets: [
      "Led project planning and execution across internal teams and vendors.",
      "Built detailed plans, tracked performance, managed scope and cost.",
      "Owned vendor relationships and project documentation end-to-end.",
    ],
  },
  {
    title: "Project Manager",
    org: "Playbux · Full-time · On-site, Bangkok",
    period: "Nov 2023 — Sep 2024",
    bullets: [
      "Defined and executed product strategy aligned with company goals.",
      "Prioritised features against customer needs; ran market research.",
      "Liaised between engineering, stakeholders, and business units.",
    ],
  },
  {
    title: "Project Manager",
    org: "VaporFund · Full-time · Remote",
    period: "Nov 2023 — Sep 2024",
    bullets: [
      "Parallel PM role alongside Playbux during the same period.",
    ],
  },
  {
    title: "IT Project Manager",
    org: "Coins.co.th · Full-time · Remote",
    period: "Apr 2023 — Sep 2023",
    bullets: [
      "Led cross-functional teams to deliver projects on time.",
      "Collaborated with tech teams and external vendors; reported progress to stakeholders.",
    ],
  },
  {
    title: "Business Development",
    org: "The Monk Studios · Full-time · Hybrid, Bangkok",
    period: "Feb 2023 — Apr 2023",
    bullets: [
      "Built market-expansion and client-acquisition strategy for the game-metaverse industry.",
      "Prepared sales reports, analysed trends, ran investor meetings.",
    ],
  },
  {
    title: "Business System Analyst",
    org: "FICO Corporation Thailand · Full-time · On-site, Bangkok",
    period: "Mar 2022 — Feb 2023",
    bullets: [
      "Gathered and validated business requirements; authored functional specs.",
      "Analysed commercial data and oversaw outsourcing to hit project timelines.",
    ],
  },
  {
    title: "Blockchain Developer",
    org: "FICO Corporation Thailand",
    period: "Feb 2022 — Apr 2022",
    bullets: [
      "Architected end-to-end systems in React, Node.js, and MySQL.",
      "Built reliable APIs alongside cross-functional teams.",
    ],
  },
  {
    title: "Smart Contract (Intern)",
    org: "Bitkub · Internship · Bangkok",
    period: "Nov 2021 — Jan 2022",
    bullets: [
      "Worked with external partners to safeguard contract / DeFi / NFT projects.",
      "Conducted hands-on audits and contributed to security education.",
    ],
  },
];

const earlyRoles: readonly TimelineItem[] = [
  {
    title: "Event Manager",
    org: "KU Startup · Full-time · Bangkok",
    period: "Jul 2020 — Jan 2021",
    bullets: [
      "Owned client liaison, proposals, event logistics, supplier coordination, and staffing.",
    ],
  },
  {
    title: "President & Co-Producer",
    org: "TEDxKasetsartU · Full-time · Bangkok",
    period: "Jan 2020 — Dec 2020",
    bullets: [
      "Led all production and day-of planning: content, stage, technology, and video.",
    ],
  },
  {
    title: "Event Manager",
    org: "TEDxKasetsartU",
    period: "Mar 2019 — Dec 2019",
    bullets: [
      "Managed day-of logistics, venue staff, ticketing, and registration.",
    ],
  },
  {
    title: "Telecommunications Engineer (Intern)",
    org: "CAT Telecom · Bangkok",
    period: "Aug 2020 — Nov 2020",
    bullets: [
      "Worked on core network deployment in Thailand.",
    ],
  },
  {
    title: "Research Assistant (Contract)",
    org: "NECTEC · Pathum Thani",
    period: "Jul 2020 — Oct 2020",
    bullets: [
      "Helped develop Bluetooth tag technology for NSTDA activities.",
    ],
  },
  {
    title: "Application Developer (Intern)",
    org: "Triple T Broadband · Bangkok",
    period: "Jun 2020 — Jul 2020",
    bullets: [
      "Built a Bluetooth beacon detection application.",
    ],
  },
];

const education: readonly TimelineItem[] = [
  {
    title: "B.Eng. Electrical Engineering",
    org: "Kasetsart University · Bangkok",
    period: "Aug 2017 — Apr 2021",
    bullets: [
      "Teaching assistant — Innovative thinking (2021) and Knowledge of the land (2020).",
      "Working Student Program — LoRa wireless research (2020).",
      "Project Lead Developer (2019).",
    ],
  },
];

const affiliations: readonly TimelineItem[] = [
  {
    title: "Cohort 2025",
    org: "Protocol Camp",
    period: "Sep 2025 — Jan 2026",
  },
  {
    title: "Member",
    org: "Bangkok Startup Association",
    period: "Feb 2025 — Present",
  },
];

const certifications: readonly TimelineItem[] = [
  {
    title: "Ethereum Smart Contract Security",
    org: "Moralis Academy",
    period: "Dec 2021",
  },
  {
    title: "Ethereum Smart Contract Programming 101",
    org: "Moralis Academy",
    period: "Dec 2021",
  },
  {
    title: "Ethereum 101",
    org: "Moralis Academy",
    period: "Dec 2021",
  },
  {
    title: "Blockchain & Bitcoin 101",
    org: "Moralis Academy",
    period: "Dec 2021",
  },
  {
    title: "Smart Contract",
    org: "University at Buffalo",
    period: "Oct 2021",
  },
  {
    title: "PMP Certification Exam Prep",
    org: "Udemy",
    period: "—",
  },
];

const skills = [
  "Project management (PMP-trained)",
  "Product strategy",
  "ICO / tokenomics design",
  "Fintech / payments",
  "Web3 · DeFi · NFT",
  "Smart contracts · Solidity",
  "AI / LLM integration",
  "Full-stack TypeScript",
  "React · Next.js · Node.js",
  "Business analysis",
  "Cross-functional team lead",
  "Vendor & stakeholder management",
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
            Founder. IT Manager. Based in Bangkok.
          </p>
        </div>
        <Button href="/resume.pdf" variant="secondary">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </header>

      <section className="space-y-12">
        <TimelineSection title="Currently" items={currently} />
        <TimelineSection title="Experience" items={experience} />
        <TimelineSection title="University-era" items={earlyRoles} />
        <TimelineSection title="Education" items={education} />
        <TimelineSection title="Affiliations" items={affiliations} />
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
          <article key={`${item.title}-${item.org}-${item.period}`} className="relative">
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
            {item.bullets && item.bullets.length > 0 && (
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
