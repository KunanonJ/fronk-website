import {
  Bell,
  Building2,
  Clock,
  Copy,
  Database,
  Eye,
  FileText,
  GitCommitHorizontal,
  Layers,
  ListChecks,
  Mail,
  PenLine,
  Scissors,
  Search,
  Send,
  Server,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { VisualIconId } from "@/lib/content/visualIcons";

const ICONS = {
  filetext: FileText,
  listchecks: ListChecks,
  database: Database,
  bell: Bell,
  clock: Clock,
  server: Server,
  trendingdown: TrendingDown,
  shieldalert: ShieldAlert,
  mail: Mail,
  gitcommit: GitCommitHorizontal,
  building: Building2,
  pen: PenLine,
  eye: Eye,
  copy: Copy,
  search: Search,
  sparkles: Sparkles,
  layers: Layers,
  usercheck: UserCheck,
  scissors: Scissors,
  send: Send,
} satisfies Record<VisualIconId, LucideIcon>;

/**
 * Decorative icon for a "How it works" step, drawn at the canvas's 1.8
 * stroke; the step's label beside it carries the meaning.
 */
export default function VisualIcon({
  id,
  size = 20,
}: {
  id: VisualIconId;
  size?: number;
}) {
  const Icon = ICONS[id];
  return (
    <Icon size={size} strokeWidth={1.8} aria-hidden className="shrink-0" />
  );
}
