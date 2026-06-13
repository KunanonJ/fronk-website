export interface ResolvedTimelineItem {
  title: string;
  org: string;
  logoDomain?: string;
  logoSrc?: string;
  logoName?: string;
  period: string;
  href?: string;
  bullets?: readonly string[];
}

export interface ResolvedTimelineSection {
  title: string;
  items: readonly ResolvedTimelineItem[];
}

const currentlyItems: readonly ResolvedTimelineItem[] = [
  {
    title: "IT Manager",
    org: "The Binary Holdings · Full-time · On-site, Bangkok",
    logoName: "The Binary Holdings",
    logoDomain: "thebinaryholdings.com",
    period: "Nov 2025 — Present",
    bullets: [
      "Owning IT infrastructure and operations across the group.",
    ],
  },
  {
    title: "Founder",
    org: "GoGoCash · Remote, Bangkok",
    logoName: "GoGoCash",
    logoDomain: "gogocash.co",
    period: "May 2023 — Present",
    href: "https://gogocash.co",
    bullets: [
      "Founded and lead the company; drive growth and product direction.",
      "Live at gogocash.co.",
    ],
  },
  {
    title: "Founder",
    org: "Manut AI · Remote, Bangkok",
    logoName: "Manut AI",
    logoDomain: "manut.xyz",
    period: "2025 — Present",
    href: "https://manut.xyz",
    bullets: [
      "Building an AI-augmented, self-hosted knowledge workspace.",
      "Live at manut.xyz.",
    ],
  },
];

const experienceItems: readonly ResolvedTimelineItem[] = [
  {
    title: "AI Project Manager",
    org: "Aiden Labs · Full-time · Hybrid",
    logoName: "Aiden Labs",
    logoDomain: "aidenlabs.ai",
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
    logoName: "Aiden Labs",
    logoDomain: "aidenlabs.ai",
    period: "Nov 2024 — Jan 2025",
    bullets: [
      "Strategic planning support; engagement converted into a full-time PM role.",
    ],
  },
  {
    title: "Technical Project Manager",
    org: "The Binary Holdings · Full-time · On-site, Bangkok",
    logoName: "The Binary Holdings",
    logoDomain: "thebinaryholdings.com",
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
    logoName: "Playbux",
    logoDomain: "playbux.co",
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
    logoName: "VaporFund",
    logoDomain: "vaporfund.com",
    period: "Nov 2023 — Sep 2024",
    bullets: [
      "Parallel PM role alongside Playbux during the same period.",
    ],
  },
  {
    title: "IT Project Manager",
    org: "Coins.co.th · Full-time · Remote",
    logoName: "Coins.co.th",
    logoDomain: "coins.co.th",
    period: "Apr 2023 — Sep 2023",
    bullets: [
      "Led cross-functional teams to deliver projects on time.",
      "Collaborated with tech teams and external vendors; reported progress to stakeholders.",
    ],
  },
  {
    title: "Business Development",
    org: "The Monk Studios · Full-time · Hybrid, Bangkok",
    logoName: "The Monk Studios",
    logoDomain: "themonkstudios.com",
    period: "Feb 2023 — Apr 2023",
    bullets: [
      "Built market-expansion and client-acquisition strategy for the game-metaverse industry.",
      "Prepared sales reports, analysed trends, ran investor meetings.",
    ],
  },
  {
    title: "Business System Analyst",
    org: "FICO Corporation Thailand · Full-time · On-site, Bangkok",
    logoName: "FICO",
    logoDomain: "fico.com",
    period: "Mar 2022 — Feb 2023",
    bullets: [
      "Gathered and validated business requirements; authored functional specs.",
      "Analysed commercial data and oversaw outsourcing to hit project timelines.",
    ],
  },
  {
    title: "Blockchain Developer",
    org: "FICO Corporation Thailand",
    logoName: "FICO",
    logoDomain: "fico.com",
    period: "Feb 2022 — Apr 2022",
    bullets: [
      "Architected end-to-end systems in React, Node.js, and MySQL.",
      "Built reliable APIs alongside cross-functional teams.",
    ],
  },
  {
    title: "Smart Contract (Intern)",
    org: "Bitkub · Internship · Bangkok",
    logoName: "Bitkub",
    logoDomain: "bitkub.com",
    period: "Nov 2021 — Jan 2022",
    bullets: [
      "Worked with external partners to safeguard contract / DeFi / NFT projects.",
      "Conducted hands-on audits and contributed to security education.",
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
    bullets: [
      "Worked on core network deployment in Thailand.",
    ],
  },
  {
    title: "Research Assistant (Contract)",
    org: "NECTEC · Pathum Thani",
    logoName: "NECTEC",
    logoDomain: "nectec.or.th",
    period: "Jul 2020 — Oct 2020",
    bullets: [
      "Helped develop Bluetooth tag technology for NSTDA activities.",
    ],
  },
  {
    title: "Application Developer (Intern)",
    org: "Triple T Broadband · Bangkok",
    logoName: "Triple T Broadband",
    logoDomain: "3bb.co.th",
    period: "Jun 2020 — Jul 2020",
    bullets: [
      "Built a Bluetooth beacon detection application.",
    ],
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

const certificationsItems: readonly ResolvedTimelineItem[] = [
  {
    title: "Ethereum Smart Contract Security",
    org: "Moralis Academy",
    logoName: "Moralis",
    logoDomain: "moralis.io",
    period: "Dec 2021",
  },
  {
    title: "Ethereum Smart Contract Programming 101",
    org: "Moralis Academy",
    logoName: "Moralis",
    logoDomain: "moralis.io",
    period: "Dec 2021",
  },
  {
    title: "Ethereum 101",
    org: "Moralis Academy",
    logoName: "Moralis",
    logoDomain: "moralis.io",
    period: "Dec 2021",
  },
  {
    title: "Blockchain & Bitcoin 101",
    org: "Moralis Academy",
    logoName: "Moralis",
    logoDomain: "moralis.io",
    period: "Dec 2021",
  },
  {
    title: "Smart Contract",
    org: "University at Buffalo",
    logoName: "U at Buffalo",
    logoDomain: "buffalo.edu",
    period: "Oct 2021",
  },
  {
    title: "PMP Certification Exam Prep",
    org: "Udemy",
    logoName: "Udemy",
    logoDomain: "udemy.com",
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


export const RESUME_TIMELINE_FALLBACK: readonly ResolvedTimelineSection[] = [
  { title: "Currently", items: currentlyItems },
  { title: "Experience", items: experienceItems },
  { title: "University-era", items: earlyRolesItems },
  { title: "Education", items: educationItems },
  { title: "Affiliations", items: affiliationsItems },
  { title: "Certifications", items: certificationsItems },
];

export const RESUME_SKILLS_FALLBACK = skills;
