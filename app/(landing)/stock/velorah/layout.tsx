import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter-stock",
});

export default function VelorahStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${inter.variable} ${inter.className}`}>{children}</div>;
}
