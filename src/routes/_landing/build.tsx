import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/build/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/build")({
  head: () => pageHead(metadata),
  component: Page,
});
