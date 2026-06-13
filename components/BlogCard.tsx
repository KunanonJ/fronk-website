import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils/formatDate";
import { urlFor } from "@/lib/sanity/client";
import type { PostSummary } from "@/lib/sanity/types";

export function BlogCard({ post }: { post: PostSummary }) {
  const coverUrl = post.coverImage
    ? urlFor(post.coverImage).width(240).height(160).fit("crop").auto("format").url()
    : null;

  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group block border-b border-border py-8 transition-[opacity,transform] duration-300 ease-out first:pt-0 last:border-b-0 hover:-translate-y-0.5 hover:opacity-90 focus-visible:opacity-90 focus-visible:outline-none"
    >
      <article className="flex gap-6">
        {coverUrl ? (
          <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-border sm:block">
            <Image
              src={coverUrl}
              alt={post.coverImage?.alt ?? post.title}
              width={144}
              height={96}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3 text-sm text-muted">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{post.tags.slice(0, 2).join(", ")}</span>
              </>
            )}
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight transition-colors duration-200 group-hover:text-accent">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-3 text-muted">{post.excerpt}</p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
