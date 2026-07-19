import { Almarai, Instrument_Serif } from "next/font/google";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${almarai.variable} ${instrumentSerif.variable} landing-root min-h-[100svh] bg-black text-primary antialiased`}
      style={{ fontFamily: "var(--font-almarai), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
