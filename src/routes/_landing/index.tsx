import { createFileRoute } from "@tanstack/react-router";
import HomePage, { metadata } from "@/app/(landing)/page";
import { pageHead } from "../../lib/head";

export const Route = createFileRoute("/_landing/")({
  head: () => pageHead(metadata),
  component: HomePage,
});
