import type { FaqItem } from "@/lib/seo/jsonLd";
import {
  OPEN_TO_ROLES,
  PERSON_CUSTOMER_WORK,
  PERSON_SOLOPRENEUR,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { siteConfig } from "@/lib/site";

/**
 * Owner-approved FAQ — the single source for BOTH the visible /about FAQ and the
 * FAQPage JSON-LD, so answer engines see exactly what the page shows (AEO rewards
 * visible↔schema parity). Every answer is grounded in existing site copy
 * (AboutFallback, lib/content/ventures, lib/site) — no fabricated claims.
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Who is Fronk (Kunanon Jarat)?",
    answer: PERSON_SUMMARY,
  },
  {
    question: "Is Kunanon Jarat open to new roles?",
    answer: `Yes. ${OPEN_TO_ROLES.sentence} ${PERSON_CUSTOMER_WORK} Email ${siteConfig.email} or use the contact page.`,
  },
  {
    question: "How does Kunanon Jarat build products?",
    answer: `${PERSON_SOLOPRENEUR} His working principles: ship the smallest thing that proves the bet, stay close to the work, optimise for reversibility, and document as you go.`,
  },
  {
    question: "What AI systems has Kunanon Jarat worked on?",
    answer:
      "As AI Engineering Lead at The Binary Holdings: ARIA, the TBH Intranet's assistant, which combines Gemini and Claude models with embedding search over internal knowledge; and a team-built set of agents on Google's Agent Development Kit. Fando has Gemini check and caption sports clips and queues them in a Google Sheet for human approval, and a recruitment agent scores resumes and grades take-home cases, with human review for borderline candidates.",
  },
  {
    question: "What is Superstacks?",
    answer:
      "Superstacks is Kunanon Jarat's MIT-licensed pack of 20 agent skills for Claude Code, Codex and Cursor, covering planning, test-driven development, verify loops, code review and draft pull requests. Eight are original and twelve are adapted, with credit, from other MIT-licensed packs.",
  },
  {
    question: "What is GoGoCash?",
    answer:
      "GoGoCash is a shopping-to-earn cashback platform Fronk founded in 2023. Over 1,000 users earn up to 30% cashback across 220+ top merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more.",
  },
  {
    question: "What is Manut AI?",
    answer:
      "Manut AI is an ERP/CRM workspace with Intelligence AI for SMEs in the automotive industry. It keeps operations, customers, and repeat decisions in one place instead of a dozen disconnected SaaS tools. Fronk is building it from Bangkok.",
  },
  {
    question: "What is Fronk's background?",
    answer:
      "He trained as an electrical engineer at Kasetsart University, wrote smart contracts at Bitkub, and architected blockchain systems at KK Venture Global. He then worked on fintech and Web3 products as a project manager at Coins.co.th, Playbux, and Aiden Labs — running ICO process design and tokenomics alongside the engineering roadmap.",
  },
  {
    question: "How can I contact Fronk?",
    answer:
      "Email fronk.kunanon@gmail.com, or reach him on X (@fkj98), LinkedIn, or Telegram. He's especially keen to hear from founders, builders, and operators working on fintech, AI, or Web3 in Southeast Asia.",
  },
];
