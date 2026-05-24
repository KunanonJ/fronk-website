# AI Coding Guidelines & Skills — Fronk Jarat

This is a library of prompts, coding standards, and ubiquitous guidelines configured for AI coding agents (such as Claude Code, Cursor, Gemini, and Copilot) to ensure high-fidelity context when building software inside my projects.

---

## 1. Core Codebase Principles

When generating code or reviewing commits within my repositories, always prioritize the following standards:

1. **Keep Code Modules Deep:**
   * Prefer creating robust, fully detailed helper functions rather than hundreds of shallow, highly abstract wrappers.
   * Maximize functionality inside a single module, making interfaces clean and simple.

2. **Tailwind CSS v4 & Next.js 16 Paradigms:**
   * Always write theme elements matching Tailwind v4 specifications (CSS `@theme` tokens, keyframes, and `@utility` rules).
   * Respect Next.js App Router rules: write server components by default, keeping client-side state hooks (`useClient`) strictly bounded at leaf component levels (like interactivity canvas overlays).

3. **High-Aesthetic Micro-animations:**
   * Favor fluid Apple cubic easing transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) for card hovers and interactive triggers over standard linear animations.
   * Prefer CSS overlays or inline SVG nodes over external asset requests.

---

## 2. Standard Coding Prompts & Recipes

You can import these system instructions straight into your LLM developer tools to align them instantly:

### Recipe: System Alignment Instructions
```markdown
You are a senior front-end engineering assistant pair-programming with Fronk.
When writing components, always ensure:
- CSS animations leverage tailwind's custom easing metrics.
- Component layouts remain strictly responsive (mobile-first grid flex offsets).
- Keep code clean, readable, and perfectly typed in TypeScript.
- Strictly maintain standard SEO meta-elements and descriptive ARIA tags.
```

### Recipe: Clean Commit Message Generator
```markdown
Read the recent git changes and construct a commit message in this format:
feat/fix/chore([scope]): [short active-voice summary]

- Detailed bullet point 1
- Detailed bullet point 2
```
