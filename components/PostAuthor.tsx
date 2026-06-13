import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import type { Post } from "@/lib/sanity/types";

interface PostAuthorProps {
  author: NonNullable<Post["author"]>;
}

export function PostAuthor({ author }: PostAuthorProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-subtle/30 p-5">
      {author.avatar ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
          <Image
            src={urlFor(author.avatar).width(112).height(112).fit("crop").url()}
            alt={author.name}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div>
        <p className="font-medium">{author.name}</p>
        {author.bio ? (
          <p className="mt-1 text-sm text-muted">{author.bio}</p>
        ) : null}
      </div>
    </div>
  );
}
