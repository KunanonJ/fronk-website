# AI Coding Guide: kunanonj.com

Standards for coding agents (Claude Code, Codex, Cursor, Copilot, Gemini) working on this site and related Fronk projects. For the agent skills Kunanon Jarat publishes, see [/skills](/skills) and [/skills.json](/skills.json).

Site: https://kunanonj.com  
Stack: TanStack Start (Router, Query, Form) · React 19 · TypeScript · Tailwind CSS 4 · Valibot · Sanity · Cloudflare Workers

Also see: [/agents.md](/agents.md) · [/llms.txt](/llms.txt) · [/sitemap.md](/sitemap.md)

---

## 1. Core principles

1. **Deep modules, simple interfaces**
   - Prefer complete helpers over shallow wrappers.
   - Keep public APIs small; put complexity inside the module.

2. **TanStack Start on Workers**
   - File routes in `src/routes/`; a route owns its `head()`, `headers()`, loader and component.
   - Typed URL state with Valibot schemas in `validateSearch`; defaults stripped from the URL.
   - Sanity reads run in server functions through TanStack Query. The pages that use them carry `Cache-Tag`, are purged by the Sanity webhook and expire at the edge within the hour; the server functions' own answers are `no-store`.
   - Pages built from `lib/content` are prerendered; everything else renders in the Worker.

3. **Design system (bento)**
   - Role tokens in `src/styles/globals.css` (`bg-page`, `bg-surface`, `text-ink`, `text-ink-2`, `border-hairline`, `bg-cta` for ink primary buttons, `text-link`, `bg-mark`); never raw hex (a test enforces it). Light theme by default; nothing under 12 px.
   - Shared pieces live in `components/bento/` (header, menu, share, cards, chips, segmented controls, the Bangkok card); reuse them before adding new chrome.
   - Palette: Signal, Glaze, Paper, Ink, Clay, Ember (Ember only for live or failed states).

4. **Motion**
   - Entrance stagger, hover lift and panel pop from `globals.css`; reduced motion turns all of it off.
   - Page changes use view transitions of type `page`; the theme switch uses type `theme`.
   - The hero h1 is the LCP element: never start it invisible or blurred.
   - First-visit intro: at most 1.5 s, skippable, ends with a short celebratory burst.

5. **Content**
   - Copy lives in `lib/content/`; identity facts in `lib/content/identity.ts`. Never invent claims, numbers or dates.
   - Blog and résumé come from Sanity with static fallbacks. The blog is hidden (`BLOG_PUBLIC`).

6. **TypeScript**
   - Strict typing; avoid `any` and `as` casts.
   - `pnpm typecheck` runs TypeScript 7; ESLint loads the TypeScript 6 API package.

---

## 2. Recipes

### System alignment

```markdown
You are a senior front-end engineer pair-programming on kunanonj.com (TanStack Start on Cloudflare Workers).
When writing components:
- TypeScript strictly; reuse components/bento before adding chrome.
- Role tokens only (bg-page, text-ink, border-hairline, bg-cta); light by default, never below 12 px.
- Keep head() metadata, canonical URLs, JSON-LD and ARIA labels intact.
- Edit lib/content/* for copy instead of hardcoding strings in JSX.
- Run pnpm typecheck, lint, format:check, knip and test before proposing a change.
```

### Commit message

```markdown
feat|fix|chore([scope]): [short active-voice summary]

- Detailed bullet 1
- Detailed bullet 2
```

### Before proposing UI changes

1. Read [/sitemap.md](/sitemap.md) for current routes.
2. Check `components/bento/` and `components/landing/` before inventing parallel chrome.
3. The site menu comes from `siteMenu` in `lib/content/landing.ts`; Press and Blog stay out of it while hidden.

---

## 3. Do not

- Scrape or modify `/studio` content without credentials.
- Add links to `/blog` or `/press` while they are hidden.
- Break the intro's session behaviour or the reduced-motion switch.
- Commit secrets, `.env*` files or Sanity tokens.
