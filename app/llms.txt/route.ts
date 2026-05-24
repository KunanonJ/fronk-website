import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";
import { getAllVentures } from "@/lib/content/ventures";
import { fetchAllPosts } from "@/lib/sanity/fetch";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const ventures = getAllVentures();
  const posts = await fetchAllPosts();

  const textLines: string[] = [];

  // Title & Header
  textLines.push(`# ${siteConfig.name}`);
  textLines.push(`> ${siteConfig.tagline}`);
  textLines.push("");
  textLines.push(siteConfig.description);
  textLines.push("");
  textLines.push(`- **Location:** Bangkok, Thailand`);
  textLines.push(`- **Email:** ${siteConfig.email}`);
  textLines.push(`- **Website:** ${siteConfig.url}`);
  textLines.push("");

  // Social Links
  textLines.push("## Socials & Handles");
  textLines.push(`- **Twitter/X:** ${siteConfig.socials.x}`);
  textLines.push(`- **LinkedIn:** ${siteConfig.socials.linkedin}`);
  textLines.push(`- **GitHub:** ${siteConfig.socials.github}`);
  textLines.push(`- **Telegram:** ${siteConfig.socials.telegram}`);
  textLines.push(`- **Farcaster:** ${siteConfig.socials.farcaster}`);
  textLines.push(`- **Discord:** \`${siteConfig.discordHandle}\``);
  textLines.push("");

  // Ventures
  textLines.push("## Selected Ventures");
  textLines.push("Active products and ventures built and actively managed by Fronk:");
  textLines.push("");

  for (const v of ventures) {
    textLines.push(`### ${v.name} (${v.year})`);
    textLines.push(`- **Tagline:** ${v.tagline}`);
    textLines.push(`- **URL:** ${v.url}`);
    textLines.push(`- **Role:** ${v.role}`);
    textLines.push(`- **Status:** ${v.status.toUpperCase()}`);
    textLines.push(`- **Tech Stack:** ${v.stack.join(", ")}`);
    textLines.push(`- **Summary:** ${v.description}`);
    textLines.push("");
  }

  // Writing
  textLines.push("## Journal & Writing");
  textLines.push("Long-form notes on building tech ventures, fundraising, hiring, and shipping:");
  textLines.push("");

  if (posts.length === 0) {
    textLines.push("No articles published yet.");
  } else {
    for (const post of posts) {
      const date = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Undated";
      textLines.push(`### ${post.title}`);
      textLines.push(`- **Published:** ${date}`);
      textLines.push(`- **Slug:** \`/writing/${post.slug}\``);
      textLines.push(`- **URL:** ${siteConfig.url}/writing/${post.slug}`);
      if (post.tags && post.tags.length > 0) {
        textLines.push(`- **Tags:** ${post.tags.join(", ")}`);
      }
      if (post.excerpt) {
        textLines.push(`- **Excerpt:** ${post.excerpt}`);
      }
      textLines.push("");
    }
  }

  const responseText = textLines.join("\n");

  return new NextResponse(responseText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
