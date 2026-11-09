import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { ResumeView } from "@/components/resume/ResumeView";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import { fetchResumeProfile } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Kunanon Jarat (Fronk) — Founder, IT manager, AI engineering lead, and project leader across fintech, AI, and Web3.",
  alternates: { canonical: "/resume" },
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function ResumePage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await fetchResumeProfile({ preview });
  const profile = resolveResumeProfile(cms);

  return <ResumeView profile={profile} />;
}
