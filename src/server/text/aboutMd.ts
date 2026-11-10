import { aboutPage } from "@/lib/content/aboutPage";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_NAME } from "@/lib/content/identity";
import { operatingModel } from "@/lib/content/operatingModel";
import {
  SITE_BASE,
  absoluteUrl,
  markdownResponse,
  paragraphToMarkdown,
} from "@/src/server/text/markdown";

const PAGE = "/about";

/**
 * /about.md: the About page as Markdown, for agents that prefer text to HTML
 * (linked from the page head as rel="alternate" type="text/markdown"). Built
 * from the same lib/content modules as the page, in the page's order.
 */
export function buildAboutMd(): string {
  const { hero, story, now, path, principles, stack, cta } = aboutPage;
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# About ${PERSON_NAME} (${hero.nickname})`, "");
  push(`Source: ${SITE_BASE}${PAGE}  `, `Updated: ${SITE_UPDATED}`, "");
  push(`${hero.role} ${hero.location}.`, "");
  // The page shows this in its hero pill and in "Let's talk".
  push(OPEN_TO_ROLES.sentence, "");

  push(`## ${story.heading}`, "", story.whoIs, "");
  for (const p of story.paragraphs) push(paragraphToMarkdown(p, PAGE), "");

  push(`## ${path.heading}`, "");
  for (const chip of path.chips) push(`- **${chip.label}:** ${chip.detail}`);
  push("", `${path.resumeLabel}: ${absoluteUrl(path.resumeHref)}`, "");

  push(`## ${principles.heading}`, "");
  principles.items.forEach((item, index) =>
    push(`${index + 1}. **${item.title}** ${item.body}`),
  );
  push("");

  push(`## ${now.heading}`, "");
  for (const p of now.paragraphs) push(paragraphToMarkdown(p, PAGE), "");

  push(`## ${stack.heading}`, "", stack.lede, "");
  for (const group of stack.groups)
    push(
      `- **${group.label}:** ${group.items.map((i) => `${i.name} (${i.detail})`).join("; ")}`,
    );
  push("");

  push(`## ${operatingModel.heading}`, "", operatingModel.intro, "");
  operatingModel.stages.forEach((stage, index) =>
    push(`${index + 1}. **${stage.label}.** ${stage.principle}`),
  );
  push(
    "",
    `Full version with the skills for each stage: ${absoluteUrl(operatingModel.markdownHref)}`,
    "",
  );

  push(`## ${aboutPage.faq.heading}`, "");
  for (const f of FAQ_ITEMS) push(`### ${f.question}`, "", f.answer, "");

  push(`## ${cta.heading}`, "", cta.body, "");
  for (const link of cta.links)
    push(`- [${link.label}](${absoluteUrl(link.href)})`);
  push("");

  return out.join("\n");
}

export function GET(): Response {
  return markdownResponse(buildAboutMd());
}
