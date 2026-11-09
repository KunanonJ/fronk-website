import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/portfolio/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/portfolio/")({
  head: () => pageHead(metadata),
  component: Page,
});
