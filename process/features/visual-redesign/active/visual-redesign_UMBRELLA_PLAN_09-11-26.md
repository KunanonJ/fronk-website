# Visual redesign: Umbrella

**Date:** 09-11-26
**Complexity:** Phase program (7 phases, 0 to 6)
**Status:** IN PROGRESS. Phases 0-5 shipped and verified live (#62-#67). Phase 6a (cleanup) executed 09-11-26; 6b (visual baselines in CI, closeout) next. Owner standing approval (09-11-26): run Phases 3-6, merging each on green checks.
**Feature:** `visual-redesign`
**Evidence:**
- `process/general-plans/references/visual-redesign-research_REPORT_09-11-26.md` (Mobbin, helumi.app tokens, palette contrast, ranked changes)
- `process/features/ux-experience/reports/ux-audit_REPORT_06-11-26.md` (findings 1 to 20)
**Supersedes:** `ux-experience` Phases 2 to 5. Those findings are folded in below, and that program is closed (see its umbrella in `process/features/ux-experience/completed/`).
**Followed by:** the TanStack Start migration (`process/general-plans/references/tanstack-start-migration-research_REPORT_09-11-26.md`). It starts after Phase 6 and proves parity against this program's final baselines.
**Harness note:** `.claude/` agents and `process/context/` are absent in this checkout. Phases run in the main session under the Harness-Absent Fallback (`process/development-protocols/orchestration.md`), with the same plan files and approval gates.

## Program Goal Charter

North star:
- A first-time visitor, on a phone or a desktop, sees a calm, premium personal site with one visual language. It shows who Kunanon is, what he builds and how to reach him, in the owner's palette, with nothing borrowed: no stock video and no template glass.

Definition of done:
- **Tokens:** one token system (light by default, dark as a toggle) drives every public route. Components contain no raw hex; colour lives in `app/globals.css` (SVG art reads tokens through classes). The contrast unit test passes for every role pair in both themes.
- **Fonts:** one sans, one mono, and a Thai-capable fallback. Instrument Serif, Almarai and Space Mono are gone from the site. OG images keep their own font files until Phase 4 restyles them.
- **Media and speed:** no third-party video or stock imagery in the home, about or contact heroes. Mobile LCP is under 2.5 s on `/`, `/about`, `/contact` and `/portfolio` under the audit probe profile.
- **Coverage:** every public route is redesigned: chrome, home, about, contact, the portfolio index and its 4 detail pages, the library pages, skills, topic and venture hubs, and `/resume`.
- **Readability and access:** no text under 12 px and no tap target under 24x24 CSS px. axe reports no serious or critical violations on any route, in both themes, at phone and desktop sizes.
- **Guardrails:** the perf budget is lowered from measured values, knip is clean, and the visual baselines are refreshed and reviewed. That set is the TanStack migration's parity reference.

What "verified" means (program level):
- **Gates every phase:**
  - `pnpm typecheck`, `pnpm lint` (0 errors), `pnpm test`, `pnpm build:cloudflare`, `pnpm perf:budget`;
  - e2e `smoke.spec.ts` plus `a11y.spec.ts` (desktop and mobile; a11y covers both themes), against the local Workers preview: `pnpm exec opennextjs-cloudflare preview --port 8795`. Port 8787 is taken by an unrelated local process.
- **Visual claims:** screenshots at 390x844 and 1440x900, in light and dark, reviewed by hand and listed in the phase report. Then a production check after the owner-approved deploy.
- **Speed claims:** use `scripts/ux-probe.mjs` (new in Phase 0: the ux-audit and Phase 1 probe made repeatable). Profile: 390x844, 4x CPU, about 1.6 Mbps, 150 ms RTT, cold cache. Record before and after numbers.
- **Process note:** `next build` rewrites the `AGENTS.md` heading. Restore it with `git checkout -- AGENTS.md` before committing (general backlog P3).

Scope tiers to phases:
- Foundation (tokens, light default, fonts, primitives, contrast and type-floor guards, probe): Phase 0
- Chrome (nav, theme toggle, footer, 404): Phase 1
- Home (hero, ventures, proof, portfolio strip): Phase 2
- About and Contact: Phase 3
- Portfolio and OG images: Phase 4
- Library pages, Skills, topic and venture hubs, `/resume`: Phase 5
- Cleanup and guardrails (dead code, aliases removed, budgets, baselines, full sweep): Phase 6

Explicitly out of scope:
- The TanStack Start migration (owner decision 09-11-26: redesign first).
- New content: articles, case-study copy rewrites, portfolio screenshots (owner-supplied; issues #43 and #44). Copy edits that a layout needs (a hero statement, a project metric) need owner sign-off at that phase's checkpoint.
- Unhiding the blog or press. `BLOG_PUBLIC` stays `false` (`lib/content/blogVisibility.ts`). `/blog` and `/press` only get token compatibility, since they are still reachable by URL.
- The production ISR fix and the page-title/sitelinks work. Both are separate work in other branches.
- SEO/AEO surfaces owned by `sea-discovery`. URLs, canonicals, hreflang, robots, JSON-LD content, sitemap membership and FAQ text don't change here.

Hard safety constraints (non-negotiable, every phase):
- **Approvals:** no merge to `main` and no production deploy without explicit owner approval in chat. Merging deploys production through Workers Builds.
- **Secrets:** never commit secrets, and never open `.env*` or `.dev.vars`.
- **Branches:** one branch and PR per phase; never push to `main`.
- **Routes that must keep working:** `/studio`, `/resume`, the PDF export (`pnpm pdf`, `scripts/generate-resume-pdf.mjs`), `/api/contact` and `/api/subscribe`. Keep the `BLOG_PUBLIC` behaviour and the noindex on `/blog`, `/blog/*` and `/press`.
- **Motion:** respect `prefers-reduced-motion` everywhere motion is touched. Keep the Phase 1 timing guarantees: if the intro survives Phase 2, it stays at or under 1.5 s and skippable; route changes stay at or under 300 ms (`components/landing/RouteFade.tsx`).
- **Accessibility:** the floor never regresses. The both-theme axe suite stays green in CI every phase.

## Locks (owner decisions, 09-11-26)

| Topic | Decision |
|---|---|
| Default theme | Light by default; dark stays available through the toggle |
| Palette | Signal `#2B3BFF`, Glaze `#E8EBFF`, Paper `#FFFFFF`, Ink `#0B0D17`, Clay `#FFE3D6`, Ember `#FF5A1F` |
| Ember | Only for "something firing or failed" (live or failed state), as small square markers, never decoration |
| References | helumi.app (restraint, one sans, hairlines, generous rhythm), plus the Mobbin research (38 references) |
| Order | This redesign runs before the TanStack Start migration |
| Hidden pages | Blog (`BLOG_PUBLIC = false`, #56) and Press (#50, #52) stay hidden |
| About hero | Centered portrait (#57). Restyle it to the new system; don't replace it with the research's split card unless the owner re-decides |

## Contrast rules (computed 09-11-26, WCAG 2.x)

| Pair | Ratio | Rule |
|---|---|---|
| Ink on Paper / `#F5F6FA` / Glaze / Clay | 19.37 / 17.94 / 16.38 / 15.87 | Body text on any light surface |
| Signal on Paper / `#F5F6FA` / Glaze / Clay | 6.62 / 6.13 / 5.60 / 5.43 | Signal is fine for links and primary buttons in light mode |
| Paper on Signal / Paper on hover `#1E2BD6` | 6.62 / 8.85 | Primary button text |
| Secondary text `#565B70` on Paper / `#F5F6FA` / Glaze / Clay | 6.72 / 6.22 / 5.68 / 5.51 | Light secondary text |
| Signal on Ink | **2.93** | Fails text and non-text. In dark mode, links and the focus ring use `#8E97FF` (7.40 on Ink, 6.71 on `#151829`) or `#7C86FF` (6.19 / 5.62) |
| Ember on Paper / Ink | 3.12 / 6.21 | Markers (non-text, 3:1) on Paper or Ink only |
| Ember on `#F5F6FA` / Glaze / Clay | **2.89** / about 2.6 / about 2.6 | Fails even 3:1. No Ember markers on tinted or page surfaces, and always pair them with a text label |
| Error text `#C93C0A` on Clay / Glaze | **4.16 / 4.30** | Fails AA. Use `#B3360A` (4.99 on Clay, 5.15 on Glaze, 6.09 on Paper) for light error text |
| Success text `#137036` | 5.06 on Clay, 6.18 on Paper | Light success text (`#15803D` fails on Clay at 4.11) |
| Dark secondary `#A1A6BD` on Ink / `#151829` / `#1D2136` | 8.03 / 7.29 / 6.58 | Dark secondary text |
| Glaze, Paper or Clay against a `#F5F6FA` page | 1.09 / 1.08 / 1.13 | Not separable. Tinted and white cards need a hairline or shadow |

## Phases

| Phase | Plan | Proves | Depends on |
|---|---|---|---|
| 0 Design system foundation | `phase-0_design-system-foundation_PLAN_09-11-26.md` | Tokens in both themes, light default, two font families, primitives, contrast and type-floor guards, probe committed; un-migrated pages still pass axe | none |
| 1 Chrome | `phase-1_chrome_PLAN_09-11-26.md` | Nav pill, theme toggle, footer and 404 in the new system on every route | 0 |
| 2 Home | `phase-2_home_PLAN_09-11-26.md` | Statement hero with no video, ventures, proof strip, portfolio strip; mobile LCP on `/` under 2.5 s | 0, 1 |
| 3 About and Contact | `phase-3_about-contact_PLAN_09-11-26.md` | Portrait hero restyled, story and FAQ accordion, contact card with in-place states; no hero video | 0, 1 |
| 4 Portfolio | `phase-4_portfolio_PLAN_09-11-26.md` | Numbered metric cards, metadata rail, facts strip, recoloured mockups and diagrams, restyled OG images | 0, 1 |
| 5 Library, Skills and hubs | `phase-5_library-skills-hubs_PLAN_09-11-26.md` | Learn, Examples, Stack, Proof, Build, Skills, topic and venture hubs, `/resume` in the new system; no third-party icon host | 0, 1 |
| 6 Cleanup and guardrails | `phase-6_cleanup-guardrails_PLAN_09-11-26.md` | Aliases and dead code gone, budgets lowered, baselines refreshed, full sweep at 0 | 1 to 5 |

Phases 2 to 5 depend only on 0 and 1, so their order can change. A phase can start once the previous phase's PR is merged and verified in production, so the work never stacks on unmerged branches.

Every phase runs the loop from `process/development-protocols/phase-programs.md`:
1. Re-research at entry, and turn the outline into a full plan.
2. Execution approval checkpoint (owner).
3. Execute.
4. Validate.
5. Regression check.
6. Report in `../reports/phase-N_<slug>_REPORT_<dd-mm-yy>.md`.
7. PR, then merge only with owner approval.

## Folded from ux-experience (Phases 2 to 5)

| Audit finding | Problem | Redesign phase | Note |
|---|---|---|---|
| 6 | Mobile LCP 4 to 10.7 s (video heroes, blog images) | 2 (home videos), 3 (contact video), 6 (budget) | The About video was already removed in #57. Blog index images are deferred while the blog is hidden |
| 7 | 240 to 310 KB JS per route (framer-motion, Sanity in client bundles) | 0 (fonts), 2 to 5 (replace framer reveals with CSS as each surface is rebuilt), 6 (budget and knip) | Sanity reaches client bundles through `BlogIndex` and `BlogPostPage` importing `lib/content/blog.ts`. That's blog-only while hidden; fix it in 6 or in the migration |
| 9 | 10 px text on every page (31 arbitrary sizes under 12 px today) | 0 (12 px floor, ratchet test), each phase lowers the count, 6 (sweep must reach 0) | |
| 10 | Tap targets under 24x24 | 0 (primitives default to 44 px controls), 1 (footer and nav), each phase, 6 (sweep) | |
| 11 | Six identical "Learn more" links on home | 2 | The ventures section is rebuilt with unique link names and one card per venture in the accessibility tree |
| 12 | `/resume` loads company icons from `icons.duckduckgo.com` (4 are 404s) | 5 | `components/CompanyLogo.tsx`: self-host in `public/brand/companies/` (new). Drop the `dns-prefetch` in `app/layout.tsx` |
| 13 | Home doesn't surface portfolio or writing | 2 (portfolio strip) | The "latest writing" strip is deferred while `BLOG_PUBLIC = false` |
| 14 | `/about` started with the newsletter signup | 3 | The signup was removed in #57. What's left is an in-page jump list for the long phone page |
| 15 | `/blog` shows 20 tag chips before the first post on phones | deferred | While the blog is hidden. Listed in `process/features/ux-experience/backlog/` |
| 16 | Hero says 2 ventures, the site says 3 | 2 | Owner picks the wording at the Phase 2 checkpoint |
| 17 | Decorative photo card takes a full phone screen | 2 | Removed or collapsed with the ventures rebuild |
| 18 | Leading "3" clipped by the reveal mask | 2 | Disappears if the reveal is replaced; otherwise fixed |
| 19 | Dead modules and unused dependencies (`three`, `gsap`, `lenis`) | 6 | knip-confirmed only |
| 20 | Stale visual baselines, lint warnings, reduced-motion hydration warning | 6 (baselines, lint), 1 (the nav toggle hydration warning, if it survives) | Turnstile stays in the general backlog |
| ux-experience Phase 2 deliverable | Repeatable probe script | 0 | `scripts/ux-probe.mjs` (new) |
| ux-experience Phase 5 items | `/stock/velorah` keep or retire; `AGENTS.md` H1/H2 churn | 6 | Owner decides on `/stock/velorah` at the Phase 6 checkpoint |

## Measurement

Baselines:
- the ux-audit numbers: LCP `/` 10.7 s, `/blog` 7.6 s, `/about` 4.3 s, `/portfolio` 1.9 s;
- the Phase 1 production probe: intro 1457 ms, route fade 199 to 249 ms;
- `pnpm perf:budget` measured on 09-11-26 builds (#55 to #57): marketing routes about 239 to 292 KB gzip, and other routes about 183 to 185 KB.

Phase 0 commits `scripts/ux-probe.mjs` (new) and records a fresh baseline for `/`, `/about`, `/contact` and `/portfolio` before any visual change.

## Closeout

After Phase 6 validation:

1. Archive this umbrella and the phase plans to `completed/`.
2. Update `process/features/CURRENT_FEATURES.md`.
3. Update the design facts that still describe the old look:
   - `README.md` line 19 ("Dark cinematic landing (Almarai + Instrument Serif, cream ...)");
   - `AGENTS.md` line 718 (prisma-landing cutover, cream primary);
   - `public/skills.md` §1.2 ("Landing cream primary").

   Phase 0 updates these first; closeout re-checks them.
4. Hand off to the TanStack migration: the final visual baselines, plus a per-route `<head>` snapshot from a fresh build.
5. Move anything left open to `backlog/` with the reason.
