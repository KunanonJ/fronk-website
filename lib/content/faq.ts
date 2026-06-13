import type { FaqItem } from "@/lib/seo/jsonLd";

/**
 * Owner-approved FAQ — the single source for BOTH the visible /about FAQ and the
 * FAQPage JSON-LD, so answer engines see exactly what the page shows (AEO rewards
 * visible↔schema parity). Every answer is grounded in existing site copy
 * (AboutFallback, lib/content/ventures, lib/site) — no fabricated claims.
 */
export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Who is Fronk (Kunanon Jarat)?",
    answer:
      'Kunanon Jarat — "Fronk" — is a Bangkok-based founder, builder, and writer. He founded GoGoCash, builds Manut AI, and owns IT operations at The Binary Holdings.',
  },
  {
    question: "What is GoGoCash?",
    answer:
      "GoGoCash is a shopping-to-earn cashback platform Fronk founded in 2023. Over 1,000 users earn up to 30% cashback across 220+ top merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more.",
  },
  {
    question: "What is Manut AI?",
    answer:
      'Manut AI is an all-in-one workspace for solo entrepreneurs — "Notion on steroids." It connects MongoDB, Meta, AI agents, and multiple AI models into one platform, so you run your whole operation in one place instead of stitching together a dozen SaaS tools.',
  },
  {
    question: "What is Fronk's background?",
    answer:
      "He trained as an electrical engineer at Kasetsart University, wrote smart contracts at Bitkub, and architected blockchain systems at FICO. He then worked on fintech and Web3 products as a project manager at Coins.co.th, Playbux, and Aiden Labs — running ICO process design and tokenomics alongside the engineering roadmap.",
  },
  {
    question: "How can I contact Fronk?",
    answer:
      "Email fronk.kunanon@gmail.com, or reach him on X (@fkj98), LinkedIn, or Telegram. He's especially keen to hear from founders, builders, and operators working on fintech, AI, or Web3 in Southeast Asia.",
  },
];
