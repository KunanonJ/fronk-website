import { getSkillBySlug } from "@/lib/content/skills";
import { renderOgCard } from "@/lib/og/render";

type Props = { params: Promise<{ slug: string }> };

export default async function SkillOgImage({ params }: Props) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return new Response("Not found", { status: 404 });
  return renderOgCard({
    eyebrow: "Skill",
    title: skill.name,
    subtitle: skill.description,
  });
}
