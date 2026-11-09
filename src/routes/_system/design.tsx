import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "@/lib/seo/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { PixelGrid } from "@/components/ui/PixelGrid";
import { Section } from "@/components/ui/Section";
import { ThemeToggle } from "@/components/ThemeToggle";
import { pageHead } from "@/src/lib/head";

/**
 * Design-system review page (visual-redesign Phase 0). Unlinked, noindex,
 * and kept out of sitemap.xml and llms.txt; used for screenshot review of
 * the tokens and primitives in both themes. Phase 6 decides whether it stays.
 */
const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const SWATCHES = [
  ["page", "bg-page"],
  ["surface", "bg-surface"],
  ["surface-tint", "bg-surface-tint"],
  ["surface-warm", "bg-surface-warm"],
  ["well", "bg-well"],
  ["ink", "bg-ink"],
  ["ink-2", "bg-ink-2"],
  ["action", "bg-action"],
  ["link", "bg-link"],
  ["ember", "bg-ember"],
] as const;

const TYPE = [
  ["text-h1", "Building fintech and AI from Bangkok"],
  ["text-h2", "Selected work"],
  ["text-h3", "TBH Intranet"],
  ["text-lead", "One back office for a multi-entity group."],
  ["text-body", "Founder of GoGoCash and Manut AI. IT Manager & AI Engineering Lead at The Binary Holdings."],
  ["text-small", "Updated 9 November 2026"],
] as const;

function DesignSystemPage() {
  return (
    <main id="main" className="min-h-[100svh] bg-page text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-10 sm:px-6">
        <div>
          <MonoLabel>Internal</MonoLabel>
          <h1 className="mt-2 font-display text-h1 text-ink">Design system</h1>
        </div>
        <ThemeToggle />
      </header>

      <Section heading="Colour roles" eyebrow="Tokens">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SWATCHES.map(([name, cls]) => (
            <li key={name} className="flex flex-col gap-2">
              <span className={`h-16 rounded-chip border border-hairline ${cls}`} />
              <span className="font-mono text-label text-ink-2">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Type scale" eyebrow="Geist">
        <div className="flex flex-col gap-6">
          {TYPE.map(([cls, sample]) => (
            <div key={cls} className="flex flex-col gap-1">
              <span className="font-mono text-label text-ink-2">{cls}</span>
              <p className={`font-display ${cls} text-ink`}>{sample}</p>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-label text-ink-2">text-stat</span>
            <p className="font-display text-stat tabular-nums text-ink">1,000+</p>
          </div>
        </div>
      </Section>

      <Section heading="Buttons and chips" eyebrow="Primitives">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="inverse">Contact</Button>
          <Button variant="ghost">Ghost link</Button>
          <Button size="sm">Small</Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Chip>Fintech</Chip>
          <Chip tone="signal">Next.js</Chip>
          <Chip state="live">Validator</Chip>
          <Chip state="failed">Nightly job</Chip>
        </div>
      </Section>

      <Section heading="Cards" eyebrow="Surfaces">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["paper", "tint", "warm", "ink"] as const).map((tone) => (
            <Card key={tone} tone={tone} className="p-6">
              <MonoLabel className={tone === "ink" ? "text-page" : undefined}>{tone}</MonoLabel>
              <p className="mt-3 text-h3">Card title</p>
              <p className={`mt-2 text-small ${tone === "ink" ? "text-page" : "text-ink-2"}`}>
                Supporting copy on the {tone} surface.
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section heading="Pixel motif" eyebrow="Art">
        <div className="grid gap-6 sm:grid-cols-3">
          {(["idle", "live", "failed"] as const).map((state) => (
            <Card key={state} className="p-6">
              <MonoLabel>{state}</MonoLabel>
              <PixelGrid className="mt-4" seed={11} state={state} />
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

export const Route = createFileRoute("/_system/design")({
  head: () => pageHead(metadata),
  component: DesignSystemPage,
});
