import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/formatDate";
import { urlFor } from "@/lib/sanity/client";
import type { PostSummary } from "@/lib/sanity/types";

export function BlogCard({ post }: { post: PostSummary }) {
  const coverUrl = post.coverImage
    ? urlFor(post.coverImage).width(240).height(160).fit("crop").auto("format").url()
    : null;

  return (
    <Card hover className="mb-4">
      <Link
        href={`/writing/${post.slug}`}
        className="group relative block p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <article className="flex gap-6">
          {coverUrl ? (
            <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden border-brutal bg-surface sm:block">
              <Image
                src={coverUrl}
                alt={post.coverImage?.alt ?? post.title}
                width={144}
                height={96}
                className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <time dateTime={post.publishedAt} className="font-mono">
                {formatDate(post.publishedAt)}
              </time>
              {post.tags && post.tags.length > 0 && (
                <>
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                      {tag}
                    </Badge>
                  ))}
                </>
              )}
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-tight transition-colors duration-150 group-hover:text-accent">
              {post.title}
            </h3>
            {post.excerpt ? (
              <p className="mt-3 text-muted">{post.excerpt}</p>
            ) : null}
          </div>
        </article>
      </Link>
    </Card>
  );
}
