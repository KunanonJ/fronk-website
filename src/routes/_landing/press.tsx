import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/press/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/press")({
  head: () => pageHead(metadata),
  component: Page,
});
