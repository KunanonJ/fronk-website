import LibraryPageShell from "@/components/landing/LibraryPageShell";
import { LibrarySectionHeading } from "@/components/landing/LibraryLinkCard";
import StackBrandIcon from "@/components/landing/StackBrandIcon";
import {
  STACK_GROUPS,
  stackItemsByGroup,
  stackPage,
} from "@/lib/content/stack";

/** Stack tables (visual-redesign Phase 5): one Paper card per group. */
export default function StackPage() {
  return (
    <LibraryPageShell
      eyebrow={stackPage.eyebrow}
      title={stackPage.title}
      description={stackPage.description}
      navId="stack-mobile-nav"
    >
      <div className="space-y-16">
        {STACK_GROUPS.map((group) => {
          const items = stackItemsByGroup(group);
          return (
            <section key={group} aria-labelledby={`stack-${group}`}>
              <LibrarySectionHeading id={`stack-${group}`} count={items.length}>
                {group}
              </LibrarySectionHeading>
              <div className="overflow-x-auto rounded-card border border-hairline bg-surface shadow-card">
                <table className="w-full min-w-[36rem] border-collapse text-left text-small">
                  <thead>
                    <tr className="border-b border-hairline font-mono text-label uppercase text-ink-2">
                      <th
                        scope="col"
                        className="px-5 py-3.5 font-normal sm:px-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 font-normal sm:px-6"
                      >
                        Purpose
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3.5 font-normal sm:px-6"
                      >
                        Website
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b border-hairline last:border-0"
                      >
                        <th
                          scope="row"
                          className="px-5 py-3.5 text-left font-medium text-ink sm:px-6"
                        >
                          <span className="inline-flex items-center gap-3">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-chip bg-surface-tint text-ink">
                              <StackBrandIcon
                                id={item.icon}
                                title={item.name}
                                className="h-4 w-4"
                              />
                            </span>
                            {item.name}
                          </span>
                        </th>
                        <td className="px-5 py-3.5 text-ink-2 sm:px-6">
                          {item.purpose}
                        </td>
                        <td className="px-5 py-3.5 sm:px-6">
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-6 items-center text-link underline-offset-4 hover:underline"
                          >
                            {item.website.replace(/^https?:\/\//, "")}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </LibraryPageShell>
  );
}
