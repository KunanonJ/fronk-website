import { fetchPostBySlug } from "@/lib/sanity/fetch";
import { resolvePostMetadata } from "@/lib/content/postMetadata";
import { readingTimeFromBlocks } from "@/lib/utils/readingTime";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Writing";
export const size = OG_SIZE;
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Branded share card for posts. Posts with a cover image keep it — the
 * page's generateMetadata sets openGraph.images explicitly, which takes
 * precedence over this file-convention fallback.
 */
export default async function PostOgImage({ params }: ImageProps) {
  const { slug } = await params;
  try {
    const post = await fetchPostBySlug(slug);
    if (post) {
      const metadata = resolvePostMetadata(post);
      const read = post.body ? readingTimeFromBlocks(post.body) : null;
      return renderOgCard({
        eyebrow: read ? `Writing · ${read.minutes} min read` : "Writing",
        title: metadata.title,
        subtitle: metadata.description,
      });
    }
  } catch {
    // Sanity unavailable — fall through to the generic card.
  }
  return renderOgCard({ eyebrow: "Writing", title: "Writing" });
}
