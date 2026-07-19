/** Minimal chrome for /resume (and future system pages). No FogLAMP header/footer. */
export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] bg-bg font-sans text-fg">{children}</div>
  );
}
