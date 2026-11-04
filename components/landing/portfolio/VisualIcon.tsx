import {
  Bell,
  Building2,
  Clock,
  Copy,
  Database,
  Eye,
  FileText,
  GitCommitHorizontal,
  Globe,
  Image,
  Layers,
  ListChecks,
  Mail,
  Monitor,
  Network,
  PenLine,
  Scissors,
  Search,
  Send,
  Server,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  siAnthropic,
  siCss,
  siExpress,
  siFastapi,
  siFfmpeg,
  siGithub,
  siGithubactions,
  siGithubpages,
  siGooglecloud,
  siGooglegemini,
  siGooglesheets,
  siHtml5,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siResend,
  siShadcnui,
  siSocketdotio,
  siSupabase,
  siTailwindcss,
  siTurborepo,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import type {
  VisualBrandIconId,
  VisualGenericIconId,
  VisualIconId,
} from "@/lib/content/visualIcons";

const BRAND = {
  nextdotjs: siNextdotjs,
  tailwindcss: siTailwindcss,
  shadcnui: siShadcnui,
  express: siExpress,
  socketdotio: siSocketdotio,
  postgresql: siPostgresql,
  supabase: siSupabase,
  googlegemini: siGooglegemini,
  anthropic: siAnthropic,
  turborepo: siTurborepo,
  vercel: siVercel,
  githubactions: siGithubactions,
  github: siGithub,
  nodedotjs: siNodedotjs,
  javascript: siJavascript,
  resend: siResend,
  html5: siHtml5,
  css: siCss,
  python: siPython,
  githubpages: siGithubpages,
  googlecloud: siGooglecloud,
  googlesheets: siGooglesheets,
  fastapi: siFastapi,
  ffmpeg: siFfmpeg,
} satisfies Record<VisualBrandIconId, SimpleIcon>;

const GENERIC = {
  users: Users,
  server: Server,
  database: Database,
  sparkles: Sparkles,
  mail: Mail,
  clock: Clock,
  network: Network,
  filetext: FileText,
  listchecks: ListChecks,
  bell: Bell,
  building: Building2,
  pen: PenLine,
  eye: Eye,
  copy: Copy,
  search: Search,
  scissors: Scissors,
  send: Send,
  usercheck: UserCheck,
  layers: Layers,
  trendingdown: TrendingDown,
  shieldalert: ShieldAlert,
  gitcommit: GitCommitHorizontal,
  image: Image,
  video: Video,
  globe: Globe,
  monitor: Monitor,
} satisfies Record<VisualGenericIconId, LucideIcon>;

function isBrand(id: VisualIconId): id is VisualBrandIconId {
  return id in BRAND;
}

type VisualIconProps = {
  id: VisualIconId;
  className?: string;
};

/** Decorative icon for diagrams; the adjacent label carries the meaning. */
export default function VisualIcon({ id, className = "h-4 w-4" }: VisualIconProps) {
  if (isBrand(id)) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`shrink-0 fill-current ${className}`}
        aria-hidden="true"
        focusable="false"
      >
        <path d={BRAND[id].path} />
      </svg>
    );
  }
  const Icon = GENERIC[id];
  return <Icon className={`shrink-0 ${className}`} aria-hidden="true" />;
}
