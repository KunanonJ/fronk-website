import Image from "next/image";
import PortfolioMockup, {
  MockupStage,
} from "@/components/landing/portfolio/PortfolioMockup";
import type { PortfolioProject } from "@/lib/content/portfolio";

const serif = {
  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
} as const;

/** Gradient focal points rotate per project so placeholders don't look cloned. */
const GLOW_POSITIONS = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"] as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

type PortfolioCoverProps = {
  project: PortfolioProject;
  /** Position in the list; picks the placeholder glow corner. */
  index?: number;
  /** `sizes` hint for next/image. */
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * 16:10 cover. Order of preference: the registered screenshot, then the
 * code-drawn mockup, then a placeholder tile (gradient + initials). All built
 * from theme tokens, so they work in light and dark. Mockup and placeholder are
 * decorative: the card always renders the project name as real text.
 */
export default function PortfolioCover({
  project,
  index = 0,
  sizes = "(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className = "",
}: PortfolioCoverProps) {
  const frame = `relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-primary/12 ${className}`;

  if (project.cover) {
    return (
      <div className={`${frame} bg-primary/[0.04]`}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  // No screenshot yet: show the code-drawn mockup. Decorative here, since the
  // card renders the project name as text right below.
  if (project.mockup) {
    return (
      <MockupStage className={`${frame} p-[6%]`}>
        <PortfolioMockup
          mockup={project.mockup}
          className="drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
        />
      </MockupStage>
    );
  }

  const glow = GLOW_POSITIONS[index % GLOW_POSITIONS.length];

  return (
    <div
      className={frame}
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(120% 90% at ${glow}, color-mix(in srgb, var(--landing-ink) 16%, transparent), transparent 62%), linear-gradient(180deg, color-mix(in srgb, var(--landing-ink) 4%, transparent), color-mix(in srgb, var(--landing-ink) 8%, transparent))`,
      }}
    >
      <span
        className="pointer-events-none absolute -bottom-[0.16em] right-[0.06em] select-none text-[10rem] leading-none text-primary/[0.14] sm:text-[12rem]"
        style={serif}
      >
        {initials(project.name)}
      </span>
    </div>
  );
}
