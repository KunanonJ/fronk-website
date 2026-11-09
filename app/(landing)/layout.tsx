import LandingSiteFooter from "@/components/landing/LandingSiteFooter";
import SmoothCursor from "@/components/landing/SmoothCursor";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-root min-h-[100svh] bg-page font-sans text-ink antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-chip focus:bg-ink focus:px-3 focus:py-2 focus:text-page"
      >
        Skip to content
      </a>
      <SmoothCursor />
      {children}
      <LandingSiteFooter />
    </div>
  );
}
