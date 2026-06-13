import type { ReactNode } from "react";
import Link from "next/link";
import { Prose } from "@/components/ui/Prose";

/**
 * Now — terminal-HUD readout. Each entry is a labeled instrument row: a mono
 * eyebrow over a hairline rule, with the body carried by Prose so links and
 * type inherit the shared terminal styling. Content is honest and unchanged.
 */
function NowEntry({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="rule-hud grid gap-3 pt-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <p className="label-mono text-subtle sm:pt-1">{label}</p>
      <Prose className="max-w-none">{children}</Prose>
    </section>
  );
}

export function NowFallback() {
  return (
    <div className="flex flex-col gap-8">
      <NowEntry label="Building">
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
          — Notion on steroids for solo entrepreneurs, plugging MongoDB, Meta,
          AI agents, and multi-model AI into one workspace. Smaller surface,
          faster iteration, and a useful lab for AI workflows that GoGoCash can
          eventually borrow from.
        </p>
      </NowEntry>

      <NowEntry label="Day job">
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
      </NowEntry>

      <NowEntry label="Learning">
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
      </NowEntry>

      <NowEntry label="Community">
        <p>
          Active in the Bangkok Startup Association and trying to show up to
          more of the in-person sessions. The Bangkok founder community is
          smaller and warmer than people outside the region assume — worth the
          time.
        </p>
      </NowEntry>

      <NowEntry label="Reading & thinking about">
        <p>
          How cashback and rewards programs actually compound versus how they
          look on a pitch deck. How small fintech teams in Southeast Asia
          compound trust faster than they compound features. When to pause a
          venture cleanly versus let it drift — something I worked through
          earlier this year.
        </p>
      </NowEntry>

      <NowEntry label="Travel">
        <p>
          Based in Bangkok. Occasionally in Singapore and Chiang Mai for work.
          Happy to meet founders, builders, and operators in any of those — see{" "}
          <Link href="/contact">contact</Link>.
        </p>
      </NowEntry>

      <Prose className="rule-hud max-w-none pt-8">
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
    </div>
  );
}
