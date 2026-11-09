import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(system)/design/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_system/design")({
  head: () => pageHead(metadata),
  component: Page,
});
