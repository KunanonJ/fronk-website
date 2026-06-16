# Executive Summary

Add Sanity CMS management for the public Fronk website while preserving the current hardcoded content as production fallback. The first implementation covers editable home, standard pages, ventures, resume profile content, writing, draft preview, app-level scheduling, and tag-based revalidation.

# Business Goals

- Let non-code edits ship through Sanity Studio at `/studio`.
- Keep `kunanonj.com` stable when Sanity is unconfigured, empty, or temporarily unavailable.
- Support scheduled publishing and draft previews before public release.

# Technical Goals

- Extend the existing Sanity integration instead of replacing it.
- Keep public pages statically cacheable with ISR/tag revalidation.
- Make CMS queries typed and reusable.
- Avoid hardcoded Sanity project IDs, datasets, or tokens.

# Requirements

- Model site settings, home page, standard pages, ventures, resume profile, authors, and posts.
- Hide draft and future-dated content from public queries.
- Allow drafts/future content in preview mode when a read token is configured.
- Revalidate affected cache tags from signed Sanity webhooks.
- Seed the current static content into Sanity without overwriting edited documents.

# Non-Goals

- Full visual redesign.
- Removing current static fallbacks.
- Replacing Sanity Studio with a custom admin UI.
- Performing live hosting-provider mutations from this repo change.

# Architecture

- Sanity schemas live under `sanity/schemas`.
- GROQ queries live in `lib/sanity/queries.ts`.
- Fetch wrappers live in `lib/sanity/fetch.ts` and return safe fallbacks on errors.
- Cache tags are centralized in `lib/sanity/revalidation.ts`.
- `/api/revalidate` validates Sanity signatures and invalidates tags by document type.
- `/api/draft` and `/api/draft/disable` control Next.js draft mode.

# Data Models

- `siteSettings`: brand, description, email, socials, navigation, footer.
- `homePage`: hero copy, featured ventures section, writing CTA.
- `standardPage`: slugged pages such as `about`, `now`, and `contact`.
- `venture`: product/company cards with status, stack, URL, and schedule fields.
- `resumeProfile`: noindex resume page content and timeline sections.
- `post`: journal posts with author, body, tags, cover image, and `publishedAt`.

# API Contracts

- `POST /api/revalidate`: signed Sanity webhook body with `_type`; returns JSON with revalidated tags.
- `GET /api/draft?secret=...&slug=/path`: enables draft mode and redirects only to internal paths.
- `GET /api/draft/disable?slug=/path`: disables draft mode and redirects only to internal paths.

# Security

- Webhook requires `SANITY_REVALIDATE_SECRET`.
- Draft preview requires `SANITY_PREVIEW_SECRET`.
- Preview draft reads require `SANITY_API_READ_TOKEN`.
- Redirect inputs are constrained to internal paths.
- CMS links are rendered with existing safe external-link handling.

# Edge Cases

- Missing Sanity configuration: render static fallback content.
- Empty dataset: render static fallback content.
- Sanity fetch error: log in development and render fallback content.
- Future-dated document: hidden publicly, visible in draft mode.
- Unknown webhook type: revalidate global content to avoid stale shared UI.

# Testing Strategy

- Unit-test query scheduling filters.
- Unit-test document-type to cache-tag routing.
- Route-test revalidation webhook behavior.
- Route-test draft mode secret and safe redirect behavior.
- Run lint, typecheck, test, and build before completion.

# Rollback Plan

- Revert CMS code changes and keep existing static content path intact.
- Remove new Sanity schemas without data migration requirements.
- Disable Sanity webhooks or unset `SANITY_REVALIDATE_SECRET` if webhook behavior misfires.
- Unset `SANITY_PREVIEW_SECRET` to disable draft preview.

# Milestones

## Milestone 1 - CMS Foundation

Goal: Add schemas, types, queries, fetchers, fallbacks, and tests.

Success Metrics: Tests pass; public pages render without Sanity credentials.

Risks: Query shape mismatch; mitigated by fallbacks and typecheck.

Rollback: Remove new CMS files and return page imports to static content.

## Milestone 2 - Publishing Workflow

Goal: Add draft mode, scheduled filters, and webhook tag routing.

Success Metrics: Route tests pass; webhook returns affected tags.

Risks: Preview reads need a read token; mitigated by explicit env documentation.

Rollback: Remove draft routes and use the current published-only client.

## Milestone 3 - Content Import

Goal: Seed current content into Sanity with idempotent creates.

Success Metrics: Seed script can run repeatedly without overwriting edited documents.

Risks: Editor token permissions; mitigated by failing before mutation when token/env is missing.

Rollback: Delete seeded documents from Studio if needed.

# Epics

- Editable public pages: editors update page titles, leads, and body content in Studio.
- Editable ventures: editors manage venture cards and homepage featured ordering.
- Writing workflow: editors publish, preview, schedule, and revalidate journal posts.
- Resume workflow: editors maintain resume sections without deploying code.
- Operational safety: public site remains available with static fallbacks.

# User Stories

As an editor, I want to update About/Now content in Studio so that the site can change without code deploys.

Acceptance Criteria: CMS content renders when present; static content renders when absent.

As an editor, I want to schedule a journal post so that it appears automatically at `publishedAt`.

Acceptance Criteria: Future posts are hidden publicly and visible in preview mode.

As an operator, I want Sanity edits to revalidate only relevant pages so that the hosted site serves fresh content quickly.

Acceptance Criteria: Signed webhooks map document types to deterministic cache tags.

# Tasks

## Task

Objective: Add CMS schemas and typed fetchers.

Scope: `sanity/schemas`, `lib/sanity`.

Files: schema, query, type, fallback, and fetch modules.

Dependencies: Existing Sanity client.

Risk Tier: R2.

Acceptance Criteria: Typecheck passes and pages can render from CMS or fallback.

Tests: Query and fallback unit tests.

Rollback: Remove new schemas/fetchers and restore static imports.

Assigned Model: GPT-5.3-Codex-Spark.

Assigned Agent: main.

## Task

Objective: Add publishing workflow routes.

Scope: `app/api/revalidate`, `app/api/draft`.

Files: route handlers and route tests.

Dependencies: Next draft mode and Sanity webhook parsing.

Risk Tier: R2.

Acceptance Criteria: Invalid requests reject; valid requests enable preview/revalidate tags.

Tests: Vitest route tests.

Rollback: Delete routes and remove env docs.

Assigned Model: GPT-5.3-Codex-Spark.

Assigned Agent: main.

# Acceptance Criteria

- `pnpm test` passes.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm build` passes.
- `/writing` no longer requires Sanity to be configured before the site can render.
- `/about`, `/now`, `/ventures`, `/resume`, and `/` can render CMS content when present and static content otherwise.
- Draft mode and webhook routes have tests for failure and success paths.
