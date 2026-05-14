import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import {
  getAllVentureSlugs,
  getVentureBySlug,
  type Venture,
} from "@/lib/content/ventures";

const STATUS_LABEL: Record<Venture["status"], string> = {
  active: "Active",
  acquired: "Acquired",
  "shut-down": "Shut down",
  paused: "Paused",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllVentureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) return { title: "Not found" };
  return {
    title: venture.name,
    description: venture.tagline,
  };
}

export default async function VenturePage({ params }: PageProps) {
  const { slug } = await params;
  const venture = getVentureBySlug(slug);
  if (!venture) notFound();

  return (
    <Container size="lg" className="py-20">
      <Link
        href="/ventures"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> All ventures
      </Link>

      <header className="mt-8 mb-12">
        <div className="flex items-baseline gap-3 text-sm text-muted">
          <span>{venture.year}</span>
          <span>•</span>
          <span>{venture.role}</span>
          <span>•</span>
          <span>{STATUS_LABEL[venture.status]}</span>
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {venture.name}
        </h1>
        <p className="mt-4 text-lg text-muted">{venture.tagline}</p>

        {venture.url && (
          <a
            href={venture.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            Visit site <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {venture.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </header>

      <Prose>
        <p className="lead">{venture.summary}</p>

        <h2>Problem</h2>
        <p>{venture.problem}</p>

        <h2>Approach</h2>
        <p>{venture.approach}</p>

        <h2>Outcome</h2>
        <p>{venture.outcome}</p>

        <h2>What I learned</h2>
        <ul>
          {venture.learnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Prose>
    </Container>
  );
}
