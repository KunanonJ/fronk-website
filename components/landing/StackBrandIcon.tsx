import {
  ChartColumn,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import {
  siClaude,
  siClaudecode,
  siCloudflare,
  siCursor,
  siExpo,
  siFirebase,
  siGithub,
  siGooglecloud,
  siHono,
  siMongodb,
  siNestjs,
  siNextdotjs,
  siPostgresql,
  siPrisma,
  siReact,
  siSanity,
  siSolidity,
  siTailwindcss,
  siTurborepo,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import type { StackIconId } from "@/lib/content/stackIcons";

export type { StackIconId };

const BRAND: Partial<Record<StackIconId, SimpleIcon>> = {
  typescript: siTypescript,
  nextdotjs: siNextdotjs,
  react: siReact,
  expo: siExpo,
  tailwindcss: siTailwindcss,
  turborepo: siTurborepo,
  nestjs: siNestjs,
  mongodb: siMongodb,
  firebase: siFirebase,
  googlecloud: siGooglecloud,
  cloudflare: siCloudflare,
  hono: siHono,
  postgresql: siPostgresql,
  prisma: siPrisma,
  solidity: siSolidity,
  sanity: siSanity,
  github: siGithub,
  cursor: siCursor,
  claudecode: siClaudecode,
  claude: siClaude,
};

const LUCIDE_FALLBACK: Partial<Record<StackIconId, LucideIcon>> = {
  playwright: FlaskConical,
  finance: ChartColumn,
};

type StackBrandIconProps = {
  id: StackIconId;
  className?: string;
  title?: string;
};

export default function StackBrandIcon({
  id,
  className = "h-4 w-4",
  title,
}: StackBrandIconProps) {
  const brand = BRAND[id];
  if (brand) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={`shrink-0 fill-current ${className}`}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        {title ? <title>{title}</title> : null}
        <path d={brand.path} />
      </svg>
    );
  }

  const Lucide = LUCIDE_FALLBACK[id];
  if (Lucide) {
    return (
      <Lucide
        className={`shrink-0 ${className}`}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      />
    );
  }

  return (
    <span
      className={`inline-block shrink-0 rounded-sm bg-primary/25 ${className}`}
      aria-hidden
    />
  );
}
