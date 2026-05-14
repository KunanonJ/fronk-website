import { groq } from "next-sanity";

export const POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
    | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      tags,
      coverImage {
        ...,
        "alt": coalesce(alt, "")
      }
    }
`;

export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    body,
    coverImage {
      ...,
      "alt": coalesce(alt, "")
    },
    "author": author->{name, bio, avatar}
  }
`;

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))][].slug.current
`;
