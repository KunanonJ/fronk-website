import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/contact/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/contact")({
  head: () => pageHead(metadata),
  component: Page,
});
