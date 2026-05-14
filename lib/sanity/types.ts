import type { PortableTextBlock } from "@portabletext/react";

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
  hotspot?: unknown;
}

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: string;
  tags: readonly string[] | null;
  coverImage: SanityImage | null;
}

export interface Post extends PostSummary {
  body: PortableTextBlock[];
  author: {
    name: string;
    bio: string | null;
    avatar: SanityImage | null;
  } | null;
}
