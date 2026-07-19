import { Almarai } from "next/font/google";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${almarai.variable} landing-root min-h-[100svh] bg-black text-primary antialiased`}
      style={{ fontFamily: "var(--font-almarai), system-ui, sans-serif" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-white/40 focus:bg-primary focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}
