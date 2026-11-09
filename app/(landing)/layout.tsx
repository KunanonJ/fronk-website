import LandingSiteFooter from "@/components/landing/LandingSiteFooter";
import SmoothCursor from "@/components/landing/SmoothCursor";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-root min-h-[100svh] bg-landing font-sans text-primary antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-black/40 focus:bg-cream focus:px-3 focus:py-2 focus:text-black dark:focus:border-white/40"
      >
        Skip to content
      </a>
      <SmoothCursor />
      {children}
      <LandingSiteFooter />
    </div>
  );
}
