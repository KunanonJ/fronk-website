import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter-contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${inter.variable} ${inter.className}`}>{children}</div>;
}
