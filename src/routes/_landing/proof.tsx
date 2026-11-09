import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "@/app/(landing)/proof/page";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/proof")({
  head: () => pageHead(metadata),
  component: Page,
});
