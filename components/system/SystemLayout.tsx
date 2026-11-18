/**
 * Minimal chrome for system pages (/design): no nav or footer. The page sits
 * in the redesign's token scope (lib/design/scope.ts), whose font and colour
 * it inherits from <html>.
 */
export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100svh] bg-page text-ink">{children}</div>;
}
