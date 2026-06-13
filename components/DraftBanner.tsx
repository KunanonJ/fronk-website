interface DraftBannerProps {
  exitPath: string;
}

export function DraftBanner({ exitPath }: DraftBannerProps) {
  const href = `/api/draft/disable?slug=${encodeURIComponent(exitPath)}`;

  return (
    <div
      role="status"
      className="border-b border-accent/30 bg-accent/10 px-4 py-2 text-center text-sm text-fg"
    >
      Preview mode — viewing unpublished or scheduled content.{" "}
      <a href={href} className="font-medium text-accent hover:underline">
        Exit preview
      </a>
    </div>
  );
}
