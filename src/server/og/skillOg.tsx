import { getSkillBySlug } from "@/lib/content/skills";
import { renderSlugCard } from "@/lib/og/render";

export default function SkillOgImage(slug: string): Response {
  const skill = getSkillBySlug(slug);
  return renderSlugCard(
    skill && {
      eyebrow: "Skill",
      title: skill.name,
      subtitle: skill.description,
    },
  );
}
