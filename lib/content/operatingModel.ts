/**
 * The solopreneur operating model: how Kunanon Jarat takes a product from
 * idea to production on his own. Four stages, each with one of his working
 * principles, the Superstacks skills that carry it, and shipped work that
 * shows it. Rendered on /about and exported as /operating-model.md so other
 * projects can reuse it.
 *
 * Kept free of lib/content/skills.ts (which bundles every SKILL.md): stage
 * labels, blurbs and members are copied here, and operatingModel.test.ts
 * checks them against the skills data so they can't drift.
 */

export type OperatingStage = {
  id: "plan" | "build" | "verify-ship" | "operate";
  label: string;
  /** The stage blurb from SKILL_STAGES. */
  practice: string;
  /** One of the four principles in aboutPage.principles. */
  principle: string;
  /** Skill slugs from SKILL_STAGE_MEMBERS, in order. */
  skills: readonly string[];
  /** Shipped work that shows the stage, as site links. */
  evidence: readonly { label: string; href: string }[];
};

export const operatingModel = {
  eyebrow: "Solopreneur",
  heading: "How I ship.",
  intro:
    "One person can take a product from idea to production when every stage has a principle, a repeatable skill and a check. I run this loop solo on GoGoCash and Manut AI, and inside teams at The Binary Holdings. These are the stages, the agent skills that run them, and work where each one shows.",
  markdownHref: "/operating-model.md",
  stages: [
    {
      id: "plan",
      label: "Plan",
      practice:
        "Understand the code and pressure-test the plan before writing any.",
      principle: "Ship the smallest thing that proves the bet.",
      skills: [
        "how",
        "writing-plans",
        "grilling",
        "grill-with-docs",
        "domain-modeling",
        "interrogate",
      ],
      evidence: [{ label: "Manut AI", href: "/ventures/manut" }],
    },
    {
      id: "build",
      label: "Build",
      practice:
        "Write the check first, then the code, and debug with evidence.",
      principle: "Stay close to the work.",
      skills: ["verify-loop", "test-driven-development", "diagnosing-bugs"],
      evidence: [
        { label: "TBH Intranet", href: "/portfolio/tbh-intranet" },
        { label: "AI Automation (team)", href: "/portfolio/ai-automation" },
      ],
    },
    {
      id: "verify-ship",
      label: "Verify and ship",
      practice: "Prove it works, review it, and open a draft pull request.",
      principle: "Optimise for reversibility.",
      skills: ["verification-before-completion", "code-review", "pr"],
      evidence: [
        {
          label: "Node Validator Automation",
          href: "/portfolio/node-validator-automation",
        },
      ],
    },
    {
      id: "operate",
      label: "Operate and improve",
      practice:
        "Run tickets end to end and turn repeated mistakes into guardrails.",
      principle: "Document as you go.",
      skills: [
        "ticket-pipeline",
        "workflow-profile",
        "intake-triage",
        "gardening",
        "sample-review",
        "steer-miner",
        "mistake-to-constraint",
        "writing-for-agents",
      ],
      evidence: [
        { label: "GoGoCash", href: "/ventures/gogocash" },
        {
          label: "Email Signature Generator",
          href: "/portfolio/email-signature-generator",
        },
      ],
    },
  ] satisfies readonly OperatingStage[],
} as const;
