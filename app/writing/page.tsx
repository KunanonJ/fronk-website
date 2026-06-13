import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { DraftBanner } from "@/components/DraftBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchWritingPage } from "@/lib/sanity/fetch";
import { formatDate } from "@/lib/utils/formatDate";
import { isSanityConfigured } from "@/sanity/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchWritingPage();
  const content = resolveWritingPageContent(cms);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: "/writing" },
  };
}

export default async function WritingPage() {
  const { isEnabled: preview } = await draftMode();
  const [posts, cms] = await Promise.all([
    fetchAllPosts({ preview }),
    fetchWritingPage({ preview }),
  ]);
  const content = resolveWritingPageContent(cms);
  const configured = isSanityConfigured();

  return (
    <>
      {preview && <DraftBanner exitPath="/writing" />}
      <Container size="lg" className="py-14 sm:py-20 lg:py-24">
        <PageHeader
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        {posts.length > 0 ? (
          <ul className="border-t border-border">
            {posts.map((post) => (
              <li key={post._id} className="border-b border-border">
                <Link
                  href={`/writing/${post.slug}`}
                  className="group block py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-col sm:items-start sm:gap-2">
                    <time
                      dateTime={post.publishedAt}
                      className="label-mono text-subtle"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                    {post.tags && post.tags.length > 0 ? (
                      <span className="label-mono text-subtle">
                        {post.tags.slice(0, 2).join(" · ")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 min-w-0 sm:mt-0">
                    <h2 className="font-display text-2xl font-light tracking-tight text-fg transition-colors duration-150 group-hover:text-accent sm:text-3xl">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 max-w-prose text-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel p-8 text-center text-muted">
            {configured ? (
              <p>
                No posts yet. Open the{" "}
                <Link
                  href="/studio"
                  className="text-fg underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                >
                  Studio
                </Link>{" "}
                to publish the first one.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="label-mono text-subtle">System</p>
                <p className="font-display text-lg font-semibold text-fg">
                  Sanity is not configured yet.
                </p>
                <p className="text-sm">
                  Set{" "}
                  <code className="border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                    NEXT_PUBLIC_SANITY_PROJECT_ID
                  </code>{" "}
                  and{" "}
                  <code className="border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                    NEXT_PUBLIC_SANITY_DATASET
                  </code>{" "}
                  in{" "}
                  <code className="border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                    .env.local
                  </code>
                  . See the README for full setup instructions.
                </p>
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
