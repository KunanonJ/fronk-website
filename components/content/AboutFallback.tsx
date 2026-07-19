import Link from "next/link";
import { Prose } from "@/components/ui/Prose";

/**
 * Fallback /about body when the CMS has no Portable Text. Terminal-editorial
 * reskin: mono section labels over weight-contrast headings, hairline dividers
 * between movements. Copy and hrefs are unchanged and honest.
 */
export function AboutFallback() {
  return (
    <div className="max-w-2xl">
      <section aria-labelledby="about-intro">
        <p className="label-mono text-subtle">Profile</p>
        <h2
          id="about-intro"
          className="mt-6 font-display text-2xl font-light leading-tight tracking-tight sm:text-3xl"
        >
          Founder, <span className="font-semibold">Bangkok</span>.
        </h2>

        <Prose className="mt-6">
          <p>
            I&apos;m Kunanon Jarat — Fronk to most people — a Bangkok-based
            founder and builder. I run{" "}
            <a
              href="https://gogocash.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              GoGoCash
            </a>
            , the shopping-to-earn cashback platform I founded in 2023; build{" "}
            <a href="https://manut.xyz" target="_blank" rel="noopener noreferrer">
              Manut AI
            </a>
            , an all-in-one AI workspace for solo entrepreneurs; and own IT
            operations at{" "}
            <a
              href="https://thebinaryholdings.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Binary Holdings
            </a>
            .
          </p>

          <p>
            My background is technical — I trained as an electrical engineer at
            Kasetsart University and started my career writing smart contracts at
            Bitkub and architecting blockchain systems at FICO. From there I spent
            several years inside the room where fintech, Web3, and AI products
            actually get built — as a project manager at{" "}
            <a href="https://coins.co.th" target="_blank" rel="noopener noreferrer">
              Coins.co.th
            </a>
            ,{" "}
            <a href="https://playbux.co" target="_blank" rel="noopener noreferrer">
              Playbux
            </a>
            , and Aiden Labs, where I ran ICO process design and tokenomics
            alongside the engineering roadmap.
          </p>

          <p>
            Founding GoGoCash was the natural next step. I learned that the
            interesting problems weren&apos;t ever the algorithms — they were the
            messy, organisational ones. The work that makes a small team feel
            like a much larger one.
          </p>
        </Prose>
      </section>

      <section aria-labelledby="about-how" className="rule-hud mt-12 pt-12">
        <p className="label-mono text-subtle">How I work</p>
        <h2
          id="about-how"
          className="mt-6 font-display text-2xl font-light leading-tight tracking-tight sm:text-3xl"
        >
          Four <span className="font-semibold">operating principles</span>.
        </h2>

        <Prose className="mt-6">
          <ul>
            <li>
              <strong>Ship the smallest thing that proves the bet.</strong>{" "}
              Pre-revenue founders confuse motion with progress; the cure is
              shrinking the next milestone until it scares you.
            </li>
            <li>
              <strong>Stay close to the work.</strong> Operators who haven&apos;t
              touched the product in six months stop making good calls. I review
              code, sit in support, and ship something most weeks.
            </li>
            <li>
              <strong>Optimise for reversibility.</strong> Most decisions framed
              as one-way doors are actually two-way. Cheap to try, cheap to
              undo, expensive to defer — in that order.
            </li>
            <li>
              <strong>Document as you go.</strong> Tokenomics, project plans,
              incident reports — the unsexy artefacts are what make growth
              possible without re-explaining the same thing every week.
            </li>
          </ul>
        </Prose>
      </section>

      <section aria-labelledby="about-now" className="rule-hud mt-12 pt-12">
        <p className="label-mono text-subtle">Now</p>
        <h2
          id="about-now"
          className="mt-6 font-display text-2xl font-light leading-tight tracking-tight sm:text-3xl"
        >
          What I&apos;m <span className="font-semibold">doing now</span>.
        </h2>

        <Prose className="mt-6">
          <p>
            Building{" "}
            <a
              href="https://gogocash.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              GoGoCash
            </a>{" "}
            as my main focus, with{" "}
            <a href="https://manut.xyz" target="_blank" rel="noopener noreferrer">
              Manut AI
            </a>{" "}
            as a parallel build. Helping the broader Binary Holdings group run
            smoother as IT Manager. Participating in{" "}
            <a
              href="https://protocol.camp"
              target="_blank"
              rel="noopener noreferrer"
            >
              Protocol Camp
            </a>{" "}
            cohort 2025 and the Bangkok Startup Association. Writing the
            occasional note in the{" "}
            <Link href="/blog">blog</Link> when something is worth working
            out in public.
          </p>

          <p>
            If you&apos;re a founder, builder, or operator with an interesting
            problem in fintech, AI, or Web3 — especially in Southeast Asia —{" "}
            <Link href="/contact">say hello</Link>. I read everything.
          </p>
        </Prose>
      </section>
    </div>
  );
}
