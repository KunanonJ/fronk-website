import { getSkillBySlug } from "@/lib/content/skills";
import { OG_SIZE } from "@/lib/og/card";
import { renderOgCard } from "@/lib/og/render";

export const alt = "Agent skill";
export const size = OG_SIZE;
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function SkillOgImage({ params }: Props) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  return renderOgCard({
    eyebrow: "Skill",
    title: skill?.name ?? "Skills",
    subtitle: skill?.description ?? "Agent skills from Superstacks",
  });
}
