/**
 * Contact route wrapper. It used to load Inter; since visual-redesign Phase 0
 * the page uses the site sans (Geist) like every other route.
 */
export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
