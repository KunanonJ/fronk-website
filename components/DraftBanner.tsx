import { Badge } from "@/components/ui/Badge";

interface DraftBannerProps {
  exitPath: string;
}

export function DraftBanner({ exitPath }: DraftBannerProps) {
  const href = `/api/draft/disable?slug=${encodeURIComponent(exitPath)}`;

  return (
    <div
      role="status"
      className="border-b-2 border-border bg-accent px-4 py-2 text-center text-sm text-accent-fg"
    >
      <Badge variant="inverted" className="mr-2">
        Preview
      </Badge>
      Viewing unpublished or scheduled content.{" "}
      <a href={href} className="font-medium underline decoration-2 underline-offset-2">
        Exit preview
      </a>
    </div>
  );
}
