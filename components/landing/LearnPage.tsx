import LibraryPageShell from "@/components/landing/LibraryPageShell";
import {
  LibraryLinkCard,
  LibrarySectionHeading,
} from "@/components/landing/LibraryLinkCard";
import type { LearnLink } from "@/lib/content/learn";
import {
  getLearnTopicLinks,
  getLearnWritingLinks,
  learnOperatorNotes,
  learnPage,
} from "@/lib/content/learn";
import type { BlogCard } from "@/lib/content/blog";

function LearnSection({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: readonly LearnLink[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mb-16 last:mb-0 sm:mb-20">
      <LibrarySectionHeading id={id} count={items.length}>
        {title}
      </LibrarySectionHeading>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <LibraryLinkCard
              href={item.href}
              title={item.title}
              description={item.description}
              cta="Open"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LearnPage({ posts }: { posts: readonly BlogCard[] }) {
  return (
    <LibraryPageShell
      eyebrow={learnPage.eyebrow}
      title={learnPage.title}
      description={learnPage.description}
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
