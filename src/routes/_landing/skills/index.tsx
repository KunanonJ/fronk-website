import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/skills/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/skills/")({
  head: () => pageHead(metadata),
  component: Page,
});
