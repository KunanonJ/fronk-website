import { CURRENT_ROLE } from "@/lib/content/currentRole";

/*
 * The résumé as data. Production renders this file: there is no
 * `resumeProfile` document in Sanity (a CMS document would override the
 * sections, never the skills). /llms.txt lists the roles and /llms-full.txt
 * prints every bullet, so what is written here is public.
 *
 * Employers, titles, dates and bullets follow the owner's CV (PDF dated
 * 2026-10-07; recruiter-fit phase 1). The owner cleared its figures and
 * partner names for the site on 10-11-26. Never add a claim the CV, the repo
 * or an owner answer does not make.
 */

export interface ResolvedTimelineItem {
  title: string;
  org: string;
  logoDomain?: string;
  logoSrc?: string;
  logoName?: string;
  period: string;
  href?: string;
  /** One line under the organisation: what a project is, or that a role ran beside another. */
  note?: string;
  bullets?: readonly string[];
  /** A page on this site with more about the entry ("Case studies"). */
  more?: { label: string; href: string };
}

export interface ResolvedTimelineSection {
  title: string;
  items: readonly ResolvedTimelineItem[];
}

/** A labelled group of skills ("AI & Cloud"). */
export interface ResumeSkillGroup {
  label: string;
  items: readonly string[];
}

const currentlyItems: readonly ResolvedTimelineItem[] = [
  {
    title: CURRENT_ROLE.title,
    org: `${CURRENT_ROLE.organization} · Full-time · On-site, Bangkok`,
    logoName: CURRENT_ROLE.organization,
    logoDomain: "thebinaryholdings.com",
    period: `${CURRENT_ROLE.sinceShort} — Present`,
    bullets: [
      "Owned the roadmap and requirements for an internal platform covering CRM, support, HR, project management and AI assistance; achieved adoption by 50+ employees.",
      "Led delivery of a private-data knowledge platform using Google ADK, Gemini and Retrieval-Augmented Generation (RAG) for competitive analysis and executive decision support.",
      "Automated video sourcing, trimming, review and publishing; reduced recurring workflow staffing from 10 people to 1 operator, with a 30-minute turnaround.",
      "Partnered with engineering and strategy from requirements through launch; build cycles for the internal company platform fell from 4 months to 1 week.",
    ],
    more: { label: "Case studies", href: "/portfolio" },
  },
];

const experienceItems: readonly ResolvedTimelineItem[] = [
  {
    title: "AI Project Manager",
    org: "Aiden Labs · Full-time · Hybrid",
    logoName: "Aiden Labs",
    logoDomain: "aidenlabs.ai",
    period: "Jan 2025 — Oct 2025",
    note: "Concurrent with The Binary Holdings during Sep 2025 to Oct 2025.",
    bullets: [
      "Owned and launched Lunar AI Agent, a conversational Generative AI product on Telegram for non-technical users; reached 10,000 users.",
      "Led a 20-person cross-functional team across engineering, design and marketing using Agile/Scrum; delivered milestones on time with over 90% sprint completion.",
      "Ran a global growth campaign with 170,000+ participants, supporting onboarding, retention and engagement.",
    ],
  },
  {
    title: "Advisor",
    org: "Aiden Labs · Part-time · Remote",
    logoName: "Aiden Labs",
    logoDomain: "aidenlabs.ai",
    period: "Nov 2024 — Dec 2024",
    note: "Part-time, concurrent with The Binary Holdings.",
    bullets: [
      "Built the product roadmap and advised on go-to-market strategy.",
    ],
  },
  {
    title: "Technical Project Manager",
    org: `${CURRENT_ROLE.organization} · Full-time · On-site, Bangkok`,
    logoName: CURRENT_ROLE.organization,
    logoDomain: "thebinaryholdings.com",
    period: "Sep 2024 — Dec 2024",
    bullets: [
      "Digitized HR, Product, Technology and Business Development workflows in Zoho; led product development and engaged executives and global partners, including WorldCoin and Optimism Superchain.",
    ],
  },
  {
    title: "Project Manager",
    org: "Playbux · Full-time · On-site, Bangkok",
    logoName: "Playbux",
    logoDomain: "playbux.co",
    period: "Nov 2023 — Sep 2024",
    bullets: [
      "Managed product launches from fundraising through exchange listing; launched VaporFund DeFi with partners including VISA and BNB Chain.",
      "Delivered Trust Wallet and OKX Wallet campaigns with 1.7M+ participants and USD 250,000 revenue.",
    ],
  },
  {
    title: "IT Project Manager",
    org: "Coins.co.th · Full-time · Remote",
    logoName: "Coins.co.th",
    logoDomain: "coins.co.th",
    period: "Apr 2023 — Oct 2023",
    bullets: [
      "Led a 7-member team and 3 vendors to automate electronic know-your-customer (eKYC) onboarding; improved verification success from 60% to 90% and reduced errors to below 1%.",
      "Authored product requirements in Confluence and managed delivery in Jira, translating customer workflows into developer tickets; introduced information security governance policies.",
    ],
  },
  {
    title: "Business Development Executive",
    org: "The Monk Games - Bitkub Metaverse · Full-time · Hybrid, Bangkok",
    logoName: "The Monk Games",
    period: "Feb 2023 — Apr 2023",
    bullets: [
      "Closed a USD 250,000 partnership; developed market-expansion and client-growth strategy.",
    ],
  },
  {
    title: "Business System Analyst",
    org: "KK Venture Global · Full-time · On-site, Bangkok",
    logoName: "KK Venture Global",
    period: "Mar 2022 — Feb 2023",
    bullets: [
      "Led 9 team members and 3 vendors across 5 projects, achieving 40% cost savings; projects included a metaverse concert generating USD 5.5 million revenue.",
    ],
  },
  {
    title: "Blockchain Developer",
    org: "KK Venture Global",
    logoName: "KK Venture Global",
    period: "Feb 2022 — Apr 2022",
    bullets: [
      "Built a 10,000-asset NFT collection, marketplace and smart contracts; saved USD 33,000 in outsourcing and reduced infrastructure costs 99.4% using QuickNode.",
    ],
  },
  {
    title: "Smart Contract Intern",
    org: "Bitkub · Internship · Bangkok",
    logoName: "Bitkub",
    logoDomain: "bitkub.com",
    period: "Nov 2021 — Jan 2022",
    bullets: [
      "Ranked in the top 1% globally in a smart-contract security CTF; supported DeFi/NFT audits.",
    ],
  },
];

/** Built outside employment. The CV calls them independent projects. */
const projectItems: readonly ResolvedTimelineItem[] = [
  {
    title: "GoGoCash",
    org: "Cashback platform · Independent project",
    logoName: "GoGoCash",
    logoDomain: "gogocash.co",
    period: "May 2023 — Present",
    href: "https://gogocash.co",
    note: "Thailand-focused platform helping shoppers earn cashback on eligible purchases from participating brands.",
    bullets: [
      "Configured approximately 30 role-based agents in Grok Bot for customer support, marketing planning, product development, business development, accounting/finance and HR.",
      "Led end-to-end development with AI agents for web, LINE/Telegram Mini Apps, iOS and Android.",
      "1,000 registered users; THB 13 million cumulative gross merchandise value; THB 169,000 cashback paid.",
      "Live at gogocash.co.",
    ],
    more: { label: "Case study", href: "/ventures/gogocash" },
  },
  {
    title: "Manut AI",
    org: "ERP/CRM workspace · Independent project",
    logoName: "Manut AI",
    logoDomain: "manut.xyz",
    period: "2025 — Present",
    href: "https://manut.xyz",
    bullets: [
      "Building an ERP/CRM workspace with Intelligence AI for automotive SMEs.",
      "Live at manut.xyz.",
    ],
    more: { label: "Case study", href: "/ventures/manut" },
  },
  {
    title: "GoSpark",
    org: "AI workspace for business agents · Independent project",
    logoName: "GoSpark",
    period: "In development",
    note: "Native macOS workspace for nontechnical users to create office and company AI agents.",
    bullets: [
      "Developed for friends and family using AI agents, from product definition to release preparation.",
      "Supports frontier AI models and Chinese open models for company-related workflows.",
    ],
  },
];

const earlyRolesItems: readonly ResolvedTimelineItem[] = [
  {
    title: "Event Manager",
    org: "KU Startup · Full-time · Bangkok",
    logoName: "KU Startup",
    logoDomain: "ku.ac.th",
    period: "Jul 2020 — Jan 2021",
    bullets: [
      "Owned client liaison, proposals, event logistics, supplier coordination, and staffing.",
    ],
  },
  {
    title: "President & Co-Producer",
    org: "TEDxKasetsartU · Full-time · Bangkok",
    logoName: "TEDx",
    logoDomain: "ted.com",
    period: "Jan 2020 — Dec 2020",
    bullets: [
      "Led all production and day-of planning: content, stage, technology, and video.",
    ],
  },
  {
    title: "Event Manager",
    org: "TEDxKasetsartU",
    logoName: "TEDx",
    logoDomain: "ted.com",
    period: "Mar 2019 — Dec 2019",
    bullets: [
      "Managed day-of logistics, venue staff, ticketing, and registration.",
    ],
  },
  {
    title: "Telecommunications Engineer (Intern)",
    org: "CAT Telecom · Bangkok",
    logoName: "CAT Telecom",
    logoDomain: "cattelecom.com",
    period: "Aug 2020 — Nov 2020",
    bullets: ["Worked on core network deployment in Thailand."],
  },
  {
    title: "Research Assistant (Contract)",
    org: "NECTEC · Pathum Thani",
    logoName: "NECTEC",
    logoDomain: "nectec.or.th",
    period: "Jul 2020 — Oct 2020",
    bullets: ["Helped develop Bluetooth tag technology for NSTDA activities."],
  },
  {
    title: "Application Developer (Intern)",
    org: "Triple T Broadband · Bangkok",
    logoName: "Triple T Broadband",
    logoDomain: "3bb.co.th",
    period: "Jun 2020 — Jul 2020",
    bullets: ["Built a Bluetooth beacon detection application."],
  },
];

const educationItems: readonly ResolvedTimelineItem[] = [
  {
    title: "B.Eng. Electrical Engineering",
    org: "Kasetsart University · Bangkok",
    logoName: "Kasetsart University",
    logoDomain: "ku.ac.th",
    period: "Aug 2017 — Apr 2021",
    bullets: [
      "Teaching assistant — Innovative thinking (2021) and Knowledge of the land (2020).",
      "Working Student Program — LoRa wireless research (2020).",
      "Project Lead Developer (2019).",
    ],
  },
];

const affiliationsItems: readonly ResolvedTimelineItem[] = [
  {
    title: "Cohort 2025",
    org: "Protocol Camp",
    logoName: "Protocol Camp",
    logoDomain: "protocol.camp",
    period: "Sep 2025 — Jan 2026",
  },
  {
    title: "Member",
    org: "Bangkok Startup Association",
    logoName: "Bangkok Startup",
    logoDomain: "bsa.or.th",
    period: "Feb 2025 — Present",
  },
];

/** The title holds the courses, so the printed résumé can set each entry on one line. */
const trainingItems: readonly ResolvedTimelineItem[] = [
  {
    title:
      "Claude 101; Building with the Claude API; Claude with Google Cloud's Vertex AI; AI Fluency for Small Businesses",
    org: "Anthropic Academy",
    logoName: "Anthropic Academy",
    period: "May 2026",
  },
  {
    title: "Smart Contract Development & Security (4-course program)",
    org: "University at Buffalo & Moralis Blockchain Academy",
    logoName: "Buffalo Moralis",
    period: "2021",
  },
];

const skills: readonly ResumeSkillGroup[] = [
  {
    label: "AI & Cloud",
    // RAG is listed as the CV lists it (owner, 11-11-26). The wording rule
    // allows the word here and for ARIA, the knowledge platform, only.
    items: [
      "Generative AI",
      "Large language models (LLMs)",
      "RAG",
      "AI agents",
      "Google ADK",
      "Grok Bot",
      "Prompt engineering",
      "Google Cloud Platform (GCP)",
    ],
  },
  {
    label: "Transformation & Delivery",
    items: [
      "Process automation",
      "Roadmaps",
      "PRDs",
      "Backlog prioritization",
      "Agile/Scrum",
      "Stakeholder and vendor management",
    ],
  },
  {
    label: "Engineering",
    items: ["Python", "Node.js", "TypeScript", "React", "API integration"],
  },
  {
    label: "Tools",
    items: [
      "Jira",
      "Confluence",
      "Figma",
      "PostHog",
      "Mixpanel",
      "Zoho CRM/Desk",
    ],
  },
];

/**
 * Section order is the screen order. The printed résumé merges and trims
 * these (see `printGroups` in lib/resume/view.ts).
 */
export const RESUME_TIMELINE_FALLBACK: readonly ResolvedTimelineSection[] = [
  { title: "Currently", items: currentlyItems },
  { title: "Experience", items: experienceItems },
  { title: "Independent projects", items: projectItems },
  { title: "University-era", items: earlyRolesItems },
  { title: "Education", items: educationItems },
  { title: "Affiliations", items: affiliationsItems },
  { title: "Training", items: trainingItems },
];

export const RESUME_SKILLS_FALLBACK = skills;

/**
 * The résumé summary. The first sentence is the approved identity headline
 * (lib/content/identity.ts); the rest is the CV's own summary.
 */
export const RESUME_SUMMARY_FALLBACK =
  "AI Engineering Lead and solopreneur in Bangkok: builds AI tools inside the businesses that use them. Delivered a private-data AI knowledge platform and launched Lunar AI Agent to 10,000 users. Led cross-functional teams of up to 20 people and configured approximately 30 role-based AI agents for GoGoCash. Combines business-process automation with AI product development for nontechnical users.";

/** Language lines for the printed header, as the CV states them. */
export const RESUME_LANGUAGES_FALLBACK = ["English: TOEIC 725 (2026)"] as const;
