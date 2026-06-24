import { groq } from "next-sanity";

const publicPostFilter = groq`
  _type == "post" &&
  defined(slug.current) &&
  publishedAt <= now() &&
  !(_id in path("drafts.**"))
`;

const publicPublishedFilter = groq`
  !(_id in path("drafts.**")) &&
  (!defined(publishedAt) || publishedAt <= now())
`;

const ventureProjection = groq`
  _id,
  name,
  "slug": slug.current,
  tagline,
  description,
  year,
  role,
  status,
  "stack": coalesce(stack, []),
  url,
  urlLabel,
  featured
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

export const PREVIEW_POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
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

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    name,
    shortName,
    tagline,
    description,
    email,
    discordHandle,
    socials,
    navigation[] { label, href },
    footerTagline
  }
`;

export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage"][0] {
    heroEyebrow,
    heroTitle,
    heroTagline,
    heroIntro,
    primaryCta { label, href },
    secondaryCta { label, href },
    featuredSectionKicker,
    featuredSectionTitle,
    featuredLimit,
    writingTitle,
    writingDescription,
    writingCta { label, href }
  }
`;

export const STANDARD_PAGE_QUERY = groq`
  *[
    _type == "standardPage" &&
    slug.current == $slug &&
    ${publicPublishedFilter}
  ][0] {
    title,
    "slug": slug.current,
    eyebrow,
    heading,
    description,
    lastUpdated,
    body,
    seo {
      title,
      description
    }
  }
`;

export const PREVIEW_STANDARD_PAGE_QUERY = groq`
  *[_type == "standardPage" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    eyebrow,
    heading,
    description,
    lastUpdated,
    body,
    seo {
      title,
      description
    }
  }
`;

export const VENTURES_QUERY = groq`
  *[_type == "venture" && defined(slug.current) && ${publicPublishedFilter}]
    | order(coalesce(sortOrder, 0) asc, year desc) {
      ${ventureProjection}
    }
`;

export const FEATURED_VENTURES_QUERY = groq`
  *[
    _type == "venture" &&
    defined(slug.current) &&
    featured == true &&
    ${publicPublishedFilter}
  ] | order(coalesce(sortOrder, 0) asc, year desc)[0...$limit] {
      ${ventureProjection}
    }
`;

export const PREVIEW_VENTURES_QUERY = groq`
  *[_type == "venture" && defined(slug.current)]
    | order(coalesce(sortOrder, 0) asc, year desc) {
      ${ventureProjection}
    }
`;

export const PREVIEW_FEATURED_VENTURES_QUERY = groq`
  *[_type == "venture" && defined(slug.current) && featured == true]
    | order(coalesce(sortOrder, 0) asc, year desc)[0...$limit] {
      ${ventureProjection}
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
