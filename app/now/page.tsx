import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "Now",
  description:
    "What Fronk Kunanon Jarat is working on right now — building GoGoCash, running IT at The Binary Holdings, and what's currently on the desk in Bangkok.",
};

const LAST_UPDATED = "14 May 2026";

export default function NowPage() {
  return (
    <Container size="lg" className="py-20">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-widest text-muted">Now</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          What I&apos;m working on.
        </h1>
        <p className="mt-4 text-sm text-muted">Last updated {LAST_UPDATED}.</p>
      </header>

      <Prose>
        <h2>Building</h2>
        <p>
          <a
            href="https://gogocash.co"
            target="_blank"
            rel="noopener noreferrer"
          >
            GoGoCash
          </a>{" "}
          is the main thing — a shopping-to-earn cashback platform with 1,000+
          users earning up to 30% back across 220+ merchants like Apple,
          Samsung, Lazada, Shopee, TikTok Shop, and Temu. Most of my product
          time goes into expanding the merchant network, sharpening attribution,
          and making the cashback flow feel instant.
        </p>
        <p>
          In parallel I&apos;m building{" "}
          <a href="https://manut.xyz" target="_blank" rel="noopener noreferrer">
            Manut AI
          </a>{" "}
          — a self-hosted AI knowledge workspace. Smaller surface, faster
          iteration, mostly stress-testing AI workflows that GoGoCash can
          eventually borrow from.
        </p>

        <h2>Day job</h2>
        <p>
          IT Manager at{" "}
          <a
            href="https://thebinaryholdings.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Binary Holdings
          </a>
          . Day-to-day I&apos;m owning infrastructure and operations across the
          group — the unglamorous plumbing that lets a small team feel like a
          larger one.
        </p>

        <h2>Learning</h2>
        <p>
          Going through{" "}
          <a
            href="https://protocol.camp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Protocol Camp
          </a>{" "}
          cohort 2025 — the curriculum and the conversations with the other
          founders are pulling my thinking on protocol-level design and
          token incentives forward. Wraps in January.
        </p>

        <h2>Community</h2>
        <p>
          Active in the Bangkok Startup Association and trying to show up to
          more of the in-person sessions. The Bangkok founder community is
          smaller and warmer than people outside the region assume — worth the
          time.
        </p>

        <h2>Reading &amp; thinking about</h2>
        <p>
          How cashback and rewards programs actually compound versus how they
          look on a pitch deck. How small fintech teams in Southeast Asia
          compound trust faster than they compound features. When to pause a
          venture cleanly versus let it drift — something I worked through
          earlier this year.
        </p>

        <h2>Travel</h2>
        <p>
          Based in Bangkok. Occasionally in Singapore and Chiang Mai for work.
          Happy to meet founders, builders, and operators in any of those — see{" "}
          <Link href="/contact">contact</Link>.
        </p>

        <hr />

        <p className="text-sm text-muted">
          More long-form notes live in the <Link href="/writing">journal</Link>;
          the fastest way to reach me is <Link href="/contact">email</Link>.
          This is a <em>now</em> page — see{" "}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            nownownow.com
          </a>{" "}
          for the convention.
        </p>
      </Prose>
    </Container>
  );
}
