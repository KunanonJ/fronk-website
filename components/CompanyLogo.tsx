import { cn } from "@/lib/utils/cn";
import { companyInitials, companyLogoSrc } from "@/lib/content/companyLogos";

interface CompanyLogoProps {
  name: string;
  /** Company domain, e.g. "bitkub.com"; looked up in the self-hosted set. */
  domain?: string;
  /** Explicit image path (a CMS override). Wins over `domain`. */
  src?: string;
  /** Pixel size (width and height). Defaults to 40. */
  size?: number;
  /** The bento résumé's 12 px tile; the printed résumé keeps the 8 px chip. */
  tile?: boolean;
  className?: string;
}

const TILE =
  "flex shrink-0 items-center justify-center overflow-hidden border border-hairline";

/**
 * Company mark for /resume (visual-redesign Phase 5). No client state:
 * logos are self-hosted (lib/content/companyLogos), so there is no
 * third-party request and no client-side error fallback to hydrate. Unknown
 * companies get an initials tile. Decorative: the company name is in the text.
 */
export function CompanyLogo({
  name,
  domain,
  src,
  size = 40,
  tile = false,
  className,
}: CompanyLogoProps) {
  const url = src ?? companyLogoSrc(domain);
  const radius = tile ? "rounded-tile" : "rounded-chip";

  if (!url) {
    return (
      <span
        aria-hidden="true"
        data-logo="initials"
        style={{ width: size, height: size }}
        className={cn(
          TILE,
          radius,
          "bg-surface-tint font-mono text-label font-medium text-ink-2",
          className,
        )}
      >
        {companyInitials(name)}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-logo="image"
      style={{ width: size, height: size }}
      // Logos are drawn for light backgrounds, so the tile stays white in dark mode.
      className={cn(TILE, radius, "bg-paper p-1", className)}
    >
      {/* Plain <img>: tiny static files, no optimisation needed. */}
      <img
        src={url}
        alt=""
        width={size - 8}
        height={size - 8}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
