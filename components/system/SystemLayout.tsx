/** Minimal chrome for system pages (/design): no nav or footer. */
export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] bg-page font-sans text-ink">{children}</div>
  );
}
