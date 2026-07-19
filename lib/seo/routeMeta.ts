import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

type RouteShareInput = {
  title: string;
  description: string;
  path: string;
  /** Defaults to website */
  type?: "website" | "article";
  publishedTime?: string;
  images?: readonly string[];
};

/**
 * Per-route metadata so child pages do not inherit homepage OG title/url.
 */
export function routeShareMeta({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  images,
}: RouteShareInput): Metadata {
  const url = path.startsWith("http")
    ? path
    : `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const ogImages = images?.length
    ? images.map((src) => ({ url: src }))
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path.startsWith("/") ? path : `/${path}` },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: siteConfig.name,
      title,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: "@fkj98",
      site: "@fkj98",
      title,
      description,
      ...(ogImages ? { images: [...images!] } : {}),
    },
  };
}
