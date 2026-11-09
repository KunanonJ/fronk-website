import { createFileRoute } from "@tanstack/react-router";
import AboutPage, { metadata } from "@/app/(landing)/about/page";
import { pageHead } from "../../lib/head";

export const Route = createFileRoute("/_landing/about")({
  head: () => pageHead(metadata),
  component: AboutPage,
});
