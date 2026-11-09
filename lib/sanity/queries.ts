import { groq } from "./groq";

const publicPostFilter = groq`
  _type == "post" &&
  defined(slug.current) &&
  publishedAt <= now() &&
  !(_id in path("drafts.**"))
`;

export const POSTS_QUERY = groq`
  *[${publicPostFilter}]
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
      },
      seo {
        title,
        description
      }
    }
`;

export const POST_QUERY = groq`
  *[${publicPostFilter} && slug.current == $slug][0] {
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
    seo {
      title,
      description
    },
    "author": author->{name, bio, avatar}
  }
`;

export const POST_SLUGS_QUERY = groq`
  *[${publicPostFilter}][].slug.current
`;

export const PREVIEW_POSTS_QUERY = groq`
  *[_type == "post" && defined(slug.current)]
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
      },
      seo {
        title,
        description
      }
    }
`;

export const PREVIEW_POST_QUERY = groq`
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
    seo {
      title,
      description
    },
    "author": author->{name, bio, avatar}
  }
`;


export const WRITING_PAGE_QUERY = groq`
  *[_type == "writingPage"][0] {
    eyebrow,
    heading,
    description,
    seo {
      title,
      description
    }
  }
`;

export const RESUME_PROFILE_QUERY = groq`
  *[_type == "resumeProfile"][0] {
    name,
    headline,
    summary,
    sections[] {
      title,
      items[] {
        title,
        subtitle,
        timeframe,
        description,
        highlights,
        url,
        logoDomain,
        logoName
      }
    }
  }
`;
