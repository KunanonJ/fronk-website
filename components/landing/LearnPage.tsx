import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import type { LearnLink } from "@/lib/content/learn";
import {
  getLearnTopicLinks,
  getLearnWritingLinks,
  learnOperatorNotes,
  learnPage,
} from "@/lib/content/learn";
import type { BlogCard } from "@/lib/content/blog";

function LearnCard({ item }: { item: LearnLink }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-2xl border border-white/10 bg-[#101010] p-5 transition-colors hover:border-white/25 sm:p-6"
    >
      <h3 className="text-base font-medium text-primary sm:text-lg">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-primary/65">
        {item.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary/70 transition-colors group-hover:text-primary">
        Open
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function LearnSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: readonly LearnLink[];
}) {
  return (
    <section aria-labelledby={id} className="mb-14 last:mb-0 sm:mb-16">
      <h2
        id={id}
        className="mb-5 text-xl font-medium tracking-tight text-primary sm:text-2xl"
        style={{
          fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
        }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <LearnCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function LearnPage({
  posts,
}: {
  posts: readonly BlogCard[];
}) {
  return (
    <LibraryPageShell
      eyebrow={learnPage.eyebrow}
      title={learnPage.title}
      description={learnPage.description}
      navId="learn-mobile-nav"
    >
      <LearnSection
        id="learn-topics"
        title="Topic hubs"
        items={getLearnTopicLinks()}
      />
      <LearnSection
        id="learn-writing"
        title="Writing"
        items={getLearnWritingLinks(posts)}
      />
      <LearnSection
        id="learn-operator"
        title="Operator notes"
        items={learnOperatorNotes}
      />
    </LibraryPageShell>
  );
}
