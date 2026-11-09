# AI Coding Guidelines & Skills — KunanonJ

Prompts and standards for coding agents (Claude Code, Cursor, Codex, Copilot, Gemini) working on this site and related Fronk projects.

Site: https://kunanonj.com  
Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Sanity · Cloudflare Workers (OpenNext)

Also see: [/agents.md](/agents.md) · [/llms.txt](/llms.txt) · [/sitemap.md](/sitemap.md)

---

## 1. Core principles

1. **Deep modules, simple interfaces**
   * Prefer complete helpers over shallow wrappers.
   * Keep public APIs small; put complexity inside the module.

2. **Next.js App Router + Tailwind v4**
   * Server Components by default; `"use client"` only at interactive leaves.
   * Theme via CSS `@theme` tokens, keyframes, and `@utility` — not ad-hoc one-offs.
   * Palette (visual-redesign, 09-11-26): Signal `#2B3BFF`, Glaze `#E8EBFF`, Paper `#FFFFFF`, Ink `#0B0D17`, Clay `#FFE3D6`, Ember `#FF5A1F` (Ember only for live or failed state). Light theme by default. Use the role tokens in `app/globals.css` (`bg-page`, `text-ink`, `bg-action`...), never raw hex. Fonts: Geist + Geist Mono (Noto Sans Thai for Thai).

3. **Motion**
   * Prefer Apple-like easing: `cubic-bezier(0.16, 1, 0.3, 1)` / `cubic-bezier(0.22, 1, 0.36, 1)`.
   * Respect `prefers-reduced-motion`.
   * Route transitions: global `RouteFade`, a ~250 ms opacity fade of `<main>`. Never cover the page with a full-screen wipe or splash.
   * First-visit intro: at most 1.5 s, skippable on any key, click, tap or scroll (`lib/content/introGreetings.ts`).

4. **Content**
   * Marketing copy lives in `lib/content/` (especially `landing.ts`).
   * Blog/resume via Sanity with static fallbacks.
   * Prefer `/blog` over legacy `/writing`.

5. **TypeScript**
   * Strict typing; avoid `any`.
   * Typecheck uses TypeScript 7; ESLint resolves the TS6 API package side-by-side.

---

## 2. Recipes

### System alignment

```markdown
You are a senior front-end engineer pair-programming on kunanonj.com.
When writing components:
- Use TypeScript strictly; Server Components by default.
- Use the design-system role tokens (`bg-page`, `text-ink`, `border-hairline`, `bg-action`) and the type scale; light by default, never below 12 px.
- Keep SEO metadata, canonical URLs, and ARIA labels intact.
- Prefer editing lib/content/* for copy changes over hardcoding strings in JSX.
```

### Commit message

```markdown
feat|fix|chore([scope]): [short active-voice summary]

- Detailed bullet 1
- Detailed bullet 2
```

### Before proposing UI changes

1. Read [/sitemap.md](/sitemap.md) for current routes.
2. Check `components/landing/` before inventing parallel chrome.
3. Keep primary nav: KunanonJ · About · Ventures · Portfolio · Skills · Library · Contact (Press and Blog are hidden; `BLOG_PUBLIC` in `lib/content/blogVisibility.ts` restores Blog).

---

## 3. Do not

* Scrape or modify `/studio` content via public agents without credentials.
* Reintroduce FogLAMP multi-page chrome (retired).
* Break the global route splash or intro loader session behavior.
* Commit secrets, `.env*`, or Sanity tokens.

---

*Last updated: 2026-07-19*
