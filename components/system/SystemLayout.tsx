/**
 * Minimal chrome for system pages (/design): no nav or footer. The page
 * inherits the site's font and colour from <html>.
 */
export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100svh] bg-page text-ink">{children}</div>;
}
