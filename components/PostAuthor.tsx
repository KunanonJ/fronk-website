import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import type { Post } from "@/lib/sanity/types";
import { Card } from "@/components/ui/Card";

interface PostAuthorProps {
  author: NonNullable<Post["author"]>;
}

export function PostAuthor({ author }: PostAuthorProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        {author.avatar ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden border-brutal bg-surface">
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
          <p className="font-display font-bold">{author.name}</p>
          {author.bio ? (
            <p className="mt-1 text-sm text-muted">{author.bio}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
