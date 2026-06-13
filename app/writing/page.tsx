import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/BlogCard";
import { DraftBanner } from "@/components/DraftBanner";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchWritingPage } from "@/lib/sanity/fetch";
import { isSanityConfigured } from "@/sanity/env";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchWritingPage();
  const content = resolveWritingPageContent(cms);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
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
      <Container size="lg" className="py-20">
        <header className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-muted">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {content.heading}
          </h1>
          <p className="mt-4 text-lg text-muted">{content.description}</p>
        </header>

        {posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
            {configured ? (
              <p>
                No posts yet. Open the{" "}
                <Link href="/studio" className="text-accent hover:underline">
                  Studio
                </Link>{" "}
                to publish the first one.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-fg">
                  Sanity is not configured yet.
                </p>
                <p className="text-sm">
                  Set{" "}
                  <code className="rounded bg-subtle px-1.5 py-0.5 text-xs">
                    NEXT_PUBLIC_SANITY_PROJECT_ID
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-subtle px-1.5 py-0.5 text-xs">
                    NEXT_PUBLIC_SANITY_DATASET
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-subtle px-1.5 py-0.5 text-xs">
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
