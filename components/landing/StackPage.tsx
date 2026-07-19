"use client";

import LibraryPageShell from "@/components/landing/LibraryPageShell";
import StackBrandIcon from "@/components/landing/StackBrandIcon";
import {
  STACK_GROUPS,
  stackItemsByGroup,
  stackPage,
} from "@/lib/content/stack";

export default function StackPage() {
  return (
    <LibraryPageShell
      eyebrow={stackPage.eyebrow}
      title={stackPage.title}
      description={stackPage.description}
      navId="stack-mobile-nav"
    >
      <div className="space-y-12">
        {STACK_GROUPS.map((group) => {
          const items = stackItemsByGroup(group);
          return (
            <section key={group} aria-labelledby={`stack-${group}`}>
              <h2
                id={`stack-${group}`}
                className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-primary/55"
              >
                {group}
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-primary/45">
                      <th className="px-4 py-3 font-medium sm:px-5">Name</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Purpose</th>
                      <th className="px-4 py-3 font-medium sm:px-5">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-4 py-3.5 font-medium text-primary sm:px-5">
                          <span className="inline-flex items-center gap-2.5">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <StackBrandIcon
                                id={item.icon}
                                title={item.name}
                                className="h-4 w-4"
                              />
                            </span>
                            {item.name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-primary/70 sm:px-5">
                          {item.purpose}
                        </td>
                        <td className="px-4 py-3.5 sm:px-5">
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
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
