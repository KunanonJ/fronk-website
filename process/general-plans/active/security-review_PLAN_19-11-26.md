# Security review and refactor (19-11-26)

Status: EXECUTE (owner request: "review all security concerns and do code refactor")

Harness note: `.claude/agents`, `.claude/skills` and `process/context/all-context.md`
are absent in this checkout, so the phases run in the main session
(orchestration.md, Harness-Absent Fallback). Four read-only audits ran in
parallel: server and edge, client, supply chain and CI, refactor candidates.

## Objective

Fix every in-repo security finding worth fixing, record the ones that need a
console change (Cloudflare, Sanity, GitHub) for the owner, and land the
behaviour-preserving refactors the scout ranked highest. Two pull requests:
`fix/security-hardening` first, then the refactor, rebased on it.

## Findings and decisions

No high or critical finding. `pnpm audit`: one moderate (satori SVG escaping,
GHSA-wx4j-mvgx-mqwp), unreachable by input (OG cards come from static content
by slug, output is PNG).

### Fixed in the security PR

| ID | Finding | Fix |
|---|---|---|
| S1 | `sitemapToXml` writes `<loc>` unescaped; post slugs come from Sanity (live once `BLOG_PUBLIC`) | escape every value with a shared `escapeXml`; drop posts whose slug is not `a-z0-9-` |
| S2 | CMS URLs reach plain `<a href>` (React blocks only `javascript:`) | `safeHref` (http, https, mailto, tel, paths) in `Link` and `ResumePrint` |
| S3 | a lone surrogate from a WebMCP draft makes `encodeURIComponent` throw on submit | replace lone surrogates with U+FFFD before encoding |
| S4 | `/studio` served without the site CSP and frameable by `*.sanity.io`, though it is now a static link page | remove the studio exception (http.ts, `_headers`, route) |
| S5 | query strings bust the edge cache on endpoints whose output ignores them (OG images, icons, text endpoints, GitHub contributions), each miss costing a render, a Sanity read or a GitHub API call | 308 to the bare path on those endpoints |
| S6 | `getBlogPost` validator accepts any value; arbitrary strings reach Sanity and the log label | require a slug string (`a-z0-9-`, at most 96) |
| S7 | the webhook reads an unbounded body before checking the signature header | 401 without the header, then read at most 1 MiB (413 over) |
| S8 | the webhook names the missing secret to unauthenticated callers | generic 500, detail to the log |
| S9 | `/api/csp-report` logs up to 20 attacker-chosen lines per request | at most 3, repeats dropped |
| S10 | no `Cross-Origin-Opener-Policy` | `same-origin` on Worker and static responses |
| S11 | `sanity schema deploy` runs in every Workers Builds build when the token is set, branches and Dependabot included | deploy only on the production branch |
| S12 | CI actions pinned by mutable tags | pin to commit SHAs (verified with `gh api`) |
| S13 | seed script falls back to the runtime read token for writes; `.env.example` lists secrets nothing reads | require `SANITY_TOKEN`; prune the examples |
| S14 | `.codex/hooks/.logs/` not ignored; privacy hook misses `.dev.vars` | ignore it; add the pattern |

### Owner actions (consoles, not in the repo)

1. Delete the unused Worker secrets (`SANITY_AUTH_TOKEN`, `SANITY_API_READ_TOKEN`,
   `SANITY_PREVIEW_SECRET`, `CRON_SECRET`) and rotate `SANITY_AUTH_TOKEN`.
2. Decide on public preview URLs for branch builds (`preview_urls`) and the
   workers.dev route (`workers_dev`); both default to on.
3. Sanity CORS: remove the credentialed `kunanonj.com` and `www` origins.
4. GitHub: enforce branch protection for admins, require SHA-pinned actions,
   check the Railway app and its three environments.
5. Zone: redirect `www` to the apex; a rate-limiting rule for `/_serverFn/`,
   `/blog*` and `/resume`; HSTS `includeSubDomains` once every subdomain is HTTPS.

### Accepted, with reasons

- `script-src 'unsafe-inline'`: documented trade-off (streamed hydration scripts);
  every sink found escapes.
- `@sanity/webhook` compares signatures with `!==`: remote timing is impractical
  and a forgery only buys a cache purge.
- The WebMCP draft replaces typed text: the visitor still sends from their own app.
- automerge.yml runs the PR's own copy: only the owner can push branches.

## Touchpoints

Security PR: `lib/seo/metadataRoutes.ts`, `lib/content/rss.ts`, `lib/content/blog.ts`,
`lib/utils/{safeHref,xml}.ts`, `components/navigation/Link.tsx`,
`components/resume/ResumePrint.tsx`, `lib/contact/compose.ts`, `src/server.ts`,
`src/server/{http,revalidate,cspReport,content.functions}.ts`, `src/routes/studio.tsx`,
`public/_headers`, `tests/fixtures/site-parity.json` (studio CSP),
`scripts/{sanity-schema-deploy,seed-content}.mjs`, `.github/workflows/ci.yml`,
`.env.example`, `.dev.vars.example`, `.gitignore`, `.codex/hooks/lib/privacy-checker.cjs`.

Refactor PR: see the scout's candidates R1-R9, R11 (JSON-LD component, cache helper,
text responses, knip strictness, topic routes, Next.js leftovers, OG icons, site
origin helper, header-copy helper, head loops).

## Public Contracts

- `/studio` now carries the site CSP and `X-Frame-Options: SAMEORIGIN` only.
- A query string on an OG image, icon, text endpoint or `/api/github/contributions`
  answers 308 to the bare path.
- `/api/revalidate` answers 401 before reading the body when the signature header
  is missing, 413 over 1 MiB.
- Every other URL's output is unchanged (parity: only `/studio`'s CSP moves).

## Blast Radius

Worker entry and headers on every response; the sitemap; the blog server function;
CI pinning. The refactor must keep output identical (parity plus a full-HTML diff).

## Verification Evidence

(filled in at closeout)

## Resume and Execution Handoff

Branch `fix/security-hardening` (security) and the refactor worktree branch. Gates:
typecheck, lint, format, knip, unit tests, build, parity, browser gate; then PR, CI,
squash-merge, live checks, cleanup.
