import type { FaqItem } from "@/lib/seo/jsonLd";

export type TopicLocale = "en" | "th";

export type TopicPillar = {
  slug: string;
  locale: TopicLocale;
  title: string;
  description: string;
  h1: string;
  lede: string;
  sections: readonly { heading: string; body: string }[];
  proof: readonly string[];
  faqs: readonly FaqItem[];
  relatedLinks: readonly { label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
};

const EN_PILLARS: readonly TopicPillar[] = [
  {
    slug: "ai-transformation-thailand",
    locale: "en",
    title: "AI Transformation for Thailand & SEA SMEs",
    description:
      "Practical AI transformation for Thai and SEA startups and SMEs — from operator workflows to ERP/CRM with Intelligence AI. Built from Bangkok by Kunanon Jarat.",
    h1: "AI transformation for Thailand and SEA",
    lede: "AI transformation is not a slide deck. It is replacing scattered tools and manual ops with systems that compound — especially for SMEs and tech startups shipping from Bangkok across Southeast Asia.",
    sections: [
      {
        heading: "What AI transformation means here",
        body: "For Thai and SEA operators, transformation means wiring intelligence into the work already happening: inventory, customer follow-up, finance handoffs, and dealer ops. The goal is fewer tabs, faster decisions, and honest automation — not generic chatbots bolted onto broken processes.",
      },
      {
        heading: "How we approach it",
        body: "Start from the internal system of record (ERP/CRM), add Intelligence AI where judgment repeats, and prove value on one vertical first. Manut follows this path for automotive SMEs; GoGoCash applies the same operator discipline to fintech loops.",
      },
      {
        heading: "Who this is for",
        body: "Founders and operators of tech startups and SMEs in Thailand and SEA who need AI that lands in production — not a consulting PDF.",
      },
    ],
    proof: [
      "Operator based in Bangkok building live products",
      "Manut: ERP/CRM + Intelligence AI for automotive SMEs",
      "GoGoCash: fintech cashback with 1,000+ users and 220+ merchants",
    ],
    faqs: [
      {
        question: "What is AI transformation for SMEs in Thailand?",
        answer:
          "It is the shift from fragmented SaaS and manual ops to connected internal systems with practical AI — often starting with ERP/CRM workflows — so teams in Thailand and SEA can ship faster with fewer tools.",
      },
      {
        question: "Who is Kunanon Jarat in this space?",
        answer:
          "Kunanon Jarat (Fronk) is a Bangkok founder building GoGoCash (fintech cashback) and Manut (ERP/CRM with Intelligence AI for automotive SMEs).",
      },
      {
        question: "Where should a startup begin?",
        answer:
          "Begin with the system of record for customers and operations, then add AI where the same decisions repeat weekly. See the ERP/CRM hub and Manut case page for a worked example.",
      },
    ],
    relatedLinks: [
      { label: "ERP / CRM / internal systems", href: "/topics/erp-crm-internal-systems" },
      { label: "Manut case", href: "/ventures/manut" },
      { label: "AI transformation for Thai SMEs (blog)", href: "/blog/ai-transformation-thailand-smes" },
      { label: "Tech startups Bangkok & SEA", href: "/topics/tech-startup-thailand-sea" },
    ],
    ctaLabel: "Talk about transformation",
    ctaHref: "/contact",
  },
  {
    slug: "erp-crm-internal-systems",
    locale: "en",
    title: "ERP, CRM & Internal Systems for Startups",
    description:
      "ERP, CRM, and internal systems for tech startups and SMEs in Thailand — how to escape SaaS sprawl and run ops with Intelligence AI. KunanonJ / Manut.",
    h1: "ERP, CRM, and internal systems for startups",
    lede: "Most early teams drown in SaaS. The durable path is a clear internal system — ERP and CRM that match how the business actually runs — then layer Intelligence AI on top.",
    sections: [
      {
        heading: "Why internal systems beat tool sprawl",
        body: "When CRM, inventory, tickets, and finance live in five products, nobody trusts the numbers. An internal system (or a focused ERP/CRM) becomes the source of truth so AI and automation have something real to act on.",
      },
      {
        heading: "Automotive SME example",
        body: "Manut is built as an ERP/CRM workspace with Intelligence AI for SMEs in the automotive industry — one operator surface instead of a dozen disconnected apps.",
      },
      {
        heading: "For tech startups in SEA",
        body: "Startups in Thailand and SEA often need the same discipline as SMEs: ship product, keep ops tight, and avoid enterprise bloat. Internal systems should be boring, reliable, and AI-ready.",
      },
    ],
    proof: [
      "Manut positions ERP/CRM + Intelligence AI for automotive SMEs",
      "Operator experience shipping fintech and AI products from Bangkok",
      "Practical focus: one system of record before fancy agents",
    ],
    faqs: [
      {
        question: "What ERP/CRM should a Thai SME start with?",
        answer:
          "Start with the workflows that move money and customers — quotes, inventory, follow-ups — in one system. Vertical focus (e.g. automotive) beats a generic suite you will not finish configuring.",
      },
      {
        question: "How does Manut relate to ERP and CRM?",
        answer:
          "Manut is an ERP/CRM workspace with Intelligence AI aimed at automotive SMEs, so ops and customer work live in one place with AI assistance.",
      },
      {
        question: "Is this only for enterprises?",
        answer:
          "No. The hubs and products here target startups and SMEs that need production systems, not enterprise transformation theater.",
      },
    ],
    relatedLinks: [
      { label: "AI transformation Thailand", href: "/topics/ai-transformation-thailand" },
      { label: "Manut venture hub", href: "/ventures/manut" },
      { label: "ERP/CRM for startups (blog)", href: "/blog/erp-crm-internal-systems-startups" },
      { label: "Manut automotive case (blog)", href: "/blog/manut-ai-erp-crm-automotive" },
    ],
    ctaLabel: "Discuss your internal system",
    ctaHref: "/contact",
  },
  {
    slug: "tech-startup-thailand-sea",
    locale: "en",
    title: "Tech Startups in Thailand & Southeast Asia",
    description:
      "Building tech startups from Bangkok across SEA — fintech, AI, ERP/CRM. Operator notes from Kunanon Jarat (KunanonJ).",
    h1: "Tech startups in Thailand and SEA",
    lede: "Bangkok is a strong base to ship fintech and AI products into Southeast Asia — if you treat operations as seriously as product.",
    sections: [
      {
        heading: "Why Bangkok",
        body: "Talent, cost discipline, and proximity to SEA markets. The constraint is focus: build real loops (cashback, dealer ops, internal systems) instead of pitching vapor.",
      },
      {
        heading: "What we ship",
        body: "GoGoCash (shopping-to-earn cashback), Manut (ERP/CRM with Intelligence AI for automotive SMEs), and adjacent ventures — all operated from Bangkok.",
      },
      {
        heading: "How to follow the work",
        body: "Read the topic hubs, venture case pages, and blog notes. Contact when you want an operator conversation — not a slideware agency pitch.",
      },
    ],
    proof: [
      "Founder-led products in production",
      "Fintech + AI workspace portfolio from Thailand",
      "Public writing on shipping from Bangkok",
    ],
    faqs: [
      {
        question: "Who is the founder behind KunanonJ?",
        answer:
          "Kunanon Jarat (Fronk) — Bangkok founder of GoGoCash and Manut AI.",
      },
      {
        question: "What markets do you focus on?",
        answer:
          "Thailand first, with SEA-relevant products and playbooks for startups and SMEs.",
      },
      {
        question: "Where can I read more?",
        answer:
          "Start with the AI transformation and ERP/CRM hubs, then the blog cluster posts linked from those pages.",
      },
    ],
    relatedLinks: [
      { label: "About Kunanon Jarat", href: "/about" },
      { label: "GoGoCash case", href: "/ventures/gogocash" },
      { label: "Building from Bangkok (blog)", href: "/blog/building-tech-startups-bangkok-sea" },
      { label: "AI transformation hub", href: "/topics/ai-transformation-thailand" },
    ],
    ctaLabel: "Get in touch",
    ctaHref: "/contact",
  },
];

const TH_PILLARS: readonly TopicPillar[] = [
  {
    slug: "ai-transformation-thailand",
    locale: "th",
    title: "การเปลี่ยนผ่านด้วย AI สำหรับ SME ไทยและอาเซียน",
    description:
      "แนวทาง AI transformation สำหรับสตาร์ทอัพและ SME ในไทยและ SEA — จากระบบภายในถึง ERP/CRM พร้อม Intelligence AI โดย Kunanon Jarat กรุงเทพฯ",
    h1: "การเปลี่ยนผ่านด้วย AI ในประเทศไทยและ SEA",
    lede: "AI transformation ไม่ใช่สไลด์พรีเซนต์ แต่คือการเปลี่ยนงานจริง — ลดเครื่องมือกระจัดกระจาย และใส่ระบบที่ทำงานได้จริงสำหรับ SME และสตาร์ทอัพในไทย",
    sections: [
      {
        heading: "ความหมายในบริบทไทย",
        body: "เริ่มจากระบบบันทึกหลัก (ERP/CRM) แล้วใส่ Intelligence AI ในงานที่ตัดสินใจซ้ำ เช่น ลูกค้า สต็อก และการติดตามงาน — ไม่ใช่แชทบอทลอย ๆ",
      },
      {
        heading: "ตัวอย่างที่ทำอยู่",
        body: "Manut มุ่ง ERP/CRM พร้อม Intelligence AI สำหรับ SME ยานยนต์ และ GoGoCash เป็นฟินเทคที่เดินเกมจากกรุงเทพฯ",
      },
    ],
    proof: [
      "ผู้ก่อตั้งในกรุงเทพฯ ที่ส่งผลิตภัณฑ์จริง",
      "Manut: ERP/CRM + AI สำหรับ SME ยานยนต์",
      "GoGoCash: เงินคืนช้อปปิ้ง ผู้ใช้ 1,000+ / ร้านค้า 220+",
    ],
    faqs: [
      {
        question: "AI transformation สำหรับ SME ไทยคืออะไร?",
        answer:
          "คือการย้ายจากเครื่องมือกระจัดกระจายไปสู่ระบบภายในที่เชื่อมกัน และใช้ AI ช่วยงานที่เกิดซ้ำ — เริ่มจาก ERP/CRM ที่ตรงกับธุรกิจ",
      },
      {
        question: "Kunanon Jarat คือใคร?",
        answer:
          "ผู้ก่อตั้ง GoGoCash และ Manut AI จากกรุงเทพฯ (KunanonJ / Fronk)",
      },
    ],
    relatedLinks: [
      { label: "English version", href: "/topics/ai-transformation-thailand" },
      { label: "Manut", href: "/ventures/manut" },
      { label: "ติดต่อ", href: "/contact" },
    ],
    ctaLabel: "ติดต่อคุยเรื่อง transformation",
    ctaHref: "/contact",
  },
  {
    slug: "erp-crm-internal-systems",
    locale: "th",
    title: "ERP CRM และระบบภายในสำหรับสตาร์ทอัพ",
    description:
      "ERP CRM และระบบภายในสำหรับสตาร์ทอัพ/SME ในไทย — เลิก sprawl ของ SaaS แล้วใช้ Intelligence AI อย่างมีวินัย",
    h1: "ERP CRM และระบบภายในสำหรับสตาร์ทอัพ",
    lede: "ทีมส่วนใหญ่จมกับ SaaS หลายตัว ทางที่ยั่งยืนคือระบบภายในที่ชัด — ERP/CRM ที่ตรงกับงานจริง แล้วค่อยใส่ AI",
    sections: [
      {
        heading: "ทำไมต้องมีระบบบันทึกหลัก",
        body: "ถ้าข้อมูลลูกค้าและสต็อกกระจายหลายแอป จะไม่มีตัวเลขที่เชื่อถือได้ และ AI ก็ช่วยอะไรไม่ได้มาก",
      },
      {
        heading: "ตัวอย่าง Manut",
        body: "Manut เป็น workspace แบบ ERP/CRM พร้อม Intelligence AI สำหรับ SME ในอุตสาหกรรมยานยนต์",
      },
    ],
    proof: [
      "โฟกัสแนวตั้ง (ยานยนต์) ก่อนชุด enterprise ใหญ่",
      "เหมาะกับสตาร์ทอัพและ SME ที่ต้องการระบบใช้งานจริง",
    ],
    faqs: [
      {
        question: "เริ่ม ERP/CRM อย่างไร?",
        answer:
          "เริ่มจากงานที่เกี่ยวกับเงินและลูกค้าในระบบเดียว แล้วค่อยขยาย — ดูหน้า Manut สำหรับตัวอย่าง",
      },
    ],
    relatedLinks: [
      { label: "English version", href: "/topics/erp-crm-internal-systems" },
      { label: "Manut", href: "/ventures/manut" },
    ],
    ctaLabel: "คุยเรื่องระบบภายใน",
    ctaHref: "/contact",
  },
  {
    slug: "tech-startup-thailand-sea",
    locale: "th",
    title: "สตาร์ทอัพเทคโนโลยีในไทยและอาเซียน",
    description:
      "สร้างสตาร์ทอัพจากกรุงเทพฯ สู่ SEA — ฟินเทค AI ERP/CRM บันทึกจาก Kunanon Jarat",
    h1: "สตาร์ทอัพเทคโนโลยีในไทยและ SEA",
    lede: "กรุงเทพฯ เป็นฐานที่ดีในการส่งผลิตภัณฑ์ฟินเทคและ AI สู่ภูมิภาค — ถ้าใส่ใจระบบปฏิบัติการพอ ๆ กับตัวผลิตภัณฑ์",
    sections: [
      {
        heading: "สิ่งที่เราสร้าง",
        body: "GoGoCash, Manut และ venture ที่เกี่ยวข้อง — ดำเนินการจากกรุงเทพฯ",
      },
    ],
    proof: ["ผลิตภัณฑ์ออนไลน์จริง", "โฟกัสไทยก่อน ขยาย SEA"],
    faqs: [
      {
        question: "ติดตามงานได้ที่ไหน?",
        answer: "อ่าน topic hubs, หน้า venture และบล็อก — หรือติดต่อโดยตรง",
      },
    ],
    relatedLinks: [
      { label: "English version", href: "/topics/tech-startup-thailand-sea" },
      { label: "เกี่ยวกับ", href: "/about" },
    ],
    ctaLabel: "ติดต่อ",
    ctaHref: "/contact",
  },
];

export const TOPIC_SLUGS = [
  "ai-transformation-thailand",
  "erp-crm-internal-systems",
  "tech-startup-thailand-sea",
] as const;

export type TopicSlug = (typeof TOPIC_SLUGS)[number];

export function isTopicSlug(slug: string): slug is TopicSlug {
  return (TOPIC_SLUGS as readonly string[]).includes(slug);
}

export function getTopicPillar(
  slug: string,
  locale: TopicLocale = "en",
): TopicPillar | null {
  if (!isTopicSlug(slug)) return null;
  const list = locale === "th" ? TH_PILLARS : EN_PILLARS;
  return list.find((p) => p.slug === slug) ?? null;
}

export function getAllTopicPillars(locale: TopicLocale = "en"): readonly TopicPillar[] {
  return locale === "th" ? TH_PILLARS : EN_PILLARS;
}

export function topicHreflang(slug: TopicSlug): Record<string, string> {
  return {
    en: `/topics/${slug}`,
    th: `/th/topics/${slug}`,
    "x-default": `/topics/${slug}`,
  };
}
