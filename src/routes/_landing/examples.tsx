import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/examples/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/examples")({
  head: () => pageHead(metadata),
  component: Page,
});
