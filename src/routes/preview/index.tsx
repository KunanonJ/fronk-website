import { createFileRoute } from "@tanstack/react-router";
import PreviewHome from "@/components/profile/preview/PreviewHome";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

const metadata: Metadata = {
  title: "Profile preview",
  robots: { index: false, follow: false },
};

export const Route = createFileRoute("/preview/")({
  head: () => pageHead(metadata),
  component: PreviewHome,
});
