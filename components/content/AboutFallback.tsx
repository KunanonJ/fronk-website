import Link from "next/link";
import { Prose } from "@/components/ui/Prose";

export function AboutFallback() {
  return (
    <Prose>
      <p>
        I&apos;m Kunanon Jarat — most people call me Fronk. I&apos;m a founder based in
        Bangkok. Day-to-day, I split my time between{" "}
        <a
          href="https://gogocash.co"
          target="_blank"
          rel="noopener noreferrer"
        >
          GoGoCash
        </a>
        , the fintech I founded in 2023,{" "}
        <a href="https://manut.xyz" target="_blank" rel="noopener noreferrer">
          Manut AI
        </a>
        , and IT operations at{" "}
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

      <h2>How I work</h2>
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

      <h2>What I&apos;m doing now</h2>
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
        <Link href="/writing">journal</Link> when something is worth working
        out in public.
      </p>

      <p>
        If you&apos;re a founder, builder, or operator with an interesting
        problem in fintech, AI, or Web3 — especially in Southeast Asia —{" "}
        <Link href="/contact">say hello</Link>. I read everything.
      </p>
    </Prose>
  );
}
