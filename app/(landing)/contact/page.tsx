import type { Metadata } from "next";
import FormaContactPage from "@/components/landing/FormaContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Say hello — craft bold ideas and ship them as products.",
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  return <FormaContactPage />;
}
