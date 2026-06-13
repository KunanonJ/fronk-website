"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface CompanyLogoProps {
  name: string;
  /** Domain to look up via DuckDuckGo's free favicon CDN, e.g. "bitkub.com". */
  domain?: string;
  /** Local override (e.g. "/logos/binary-holdings.svg"). Wins over `domain`. */
  src?: string;
  /** Pixel size — width and height. Defaults to 40. */
  size?: number;
  className?: string;
}

function initialsFor(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/);
  if (words.length === 0) return "·";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

function resolveLogoUrl(src: string | undefined, domain: string | undefined): string | undefined {
  if (src) return src;
  if (!domain) return undefined;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export function CompanyLogo({
  name,
  domain,
  src,
  size = 40,
  className,
}: CompanyLogoProps) {
  const initialUrl = resolveLogoUrl(src, domain);
  const [failed, setFailed] = useState(!initialUrl);

  if (failed || !initialUrl) {
    return (
      <div
        aria-hidden="true"
        style={{ width: size, height: size }}
        className={cn(
          "flex flex-shrink-0 items-center justify-center border border-border bg-subtle text-xs font-semibold text-muted",
          className,
        )}
      >
        {initialsFor(name)}
      </div>
    );
  }

  return (
    // Using plain <img> (not next/image) because these are small (≤40px),
    // come from a third-party CDN, and need a graceful fallback that
    // next/image doesn't expose cleanly. We also catch the case where the
    // CDN returns a 200 but with an empty image body (naturalWidth === 0).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={initialUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true);
      }}
      style={{ width: size, height: size }}
      className={cn(
        "flex-shrink-0 border border-border bg-white object-contain p-1",
        className,
      )}
    />
  );
}
