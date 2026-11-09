# Phase 3: About and Contact

**Status:** SHIPPED in #65 (09-11-26), verified live: e2e + axe 100/100; LCP on the real network /contact 1.56 s (was 8.0-8.7 s), /about 1.8 s. Evidence: `../reports/phase-3_about-contact_REPORT_09-11-26.md`.
**Created:** 09-11-26
**Umbrella:** `visual-redesign_UMBRELLA_PLAN_09-11-26.md`
**Covers audit findings:** 6 (the contact hero video), 14 (the remainder: in-page navigation on the long About page; the signup was removed in #57)
**Depends on:** Phases 0 and 1

## Objective

About introduces Kunanon with the centered portrait (locked, #57) in the new system, and reads well on a phone. Contact is one calm card where every state (idle, sending, success, error) is clear, accessible and honest.

## Known levers (verify at entry)

### About (`app/(landing)/about/page.tsx`)

1. **Hero** (`components/landing/about/AboutHero.tsx`):
   - keep the layout: portrait, name h1, "Fronk · Bangkok, Thailand", role line, CTAs, socials, "Read my story";
   - move it onto the Phase 0 tokens and primitives: `Button` primary and secondary, `MonoLabel` for the location line, and the `display` type token;
   - replace the inline Instrument Serif style.

   The portrait stays a plain `<img fetchpriority="high">` (`/profile-portrait.webp`).
2. **Sections** (`components/landing/AboutPageContent.tsx`: story, principles, now, stack, path, FAQ, CTA):
   - restyle with `Section`, `MonoLabel` and the reading-width `Container`;
   - the stack icons (`components/landing/StackBrandIcon.tsx`) are recoloured to tokens;
   - the GitHub activity grid (`components/landing/ContributionActivity.tsx`, fed by `/api/github/contributions`) uses Glaze-to-Signal levels instead of its current colours, and keeps its tooltips and reduced-motion behaviour.
3. **Jump list** (finding 14): a compact in-page list (Story, How I work, Now, Stack, Path, FAQ) after the hero, horizontally scrollable on phones. Use plain anchors to the existing section ids, not JS scroll.
4. **FAQ:** a hairline accordion using `<details>`/`<summary>`, so it works without JS. The visible questions and answers must stay identical to `lib/content/faq.ts` `FAQ_ITEMS`, because the FAQPage JSON-LD (`buildFaqJsonLd` in `lib/seo/jsonLd.ts`) must match the visible text (sea-discovery requirement).

### Contact (`app/(landing)/contact/page.tsx`, `components/landing/FormaContactPage.tsx`)

1. Remove the CloudFront sky video and the headline text-shadow workaround from Phase 0 of ux-experience.
2. **Layout:** a page heading plus one form card (radius-panel, Paper) on a Glaze-to-Clay wash. Mono 12 px labels with the existing visually-hidden labels made visible. A Signal pill submit.
3. **States:**
   - **Sending:** disabled submit with a progress label.
   - **Success:** replaces the form in place (Pipedrive flow pattern) with the copy from `lib/content/contact.ts`.
   - **Error:** an Ember square marker plus error text in `--error-text` (`#B3360A`, which passes on Clay and Glaze), on the Paper card. The visitor's text is kept, and the mailto fallback stays in the `aria-live` region.
4. Keep everything functional from #53:
   - the honeypot;
   - the `elapsedMs` timing;
   - `aria-pressed` topic chips inside a `fieldset`/`legend`;
   - the 20 KB limit;
   - the copy module.

   Topic chips become the `Chip` primitive styled as toggles.

## Touchpoints

`components/landing/about/AboutHero.tsx` and its test, `components/landing/AboutPageContent.tsx`, `components/landing/StackBrandIcon.tsx`, `components/landing/ContributionActivity.tsx`, `components/landing/FormaContactPage.tsx` and its test, `app/(landing)/contact/layout.tsx` (if the Inter load survived Phase 0), and `lib/content/contact.ts` (only for copy the owner approves).

## Gates

- **Speed:** probe: LCP under 2.5 s on `/about` and `/contact` (phone profile); no CloudFront requests on `/contact`.
- **Contact:** `components/landing/FormaContactPage.test.tsx` and `app/api/contact/route.test.ts` pass. On the preview, without secrets, the 503 path shows the error state and the mailto fallback, with the text kept (as in the Phase 0 report of ux-experience). The success state is checked with a mocked fetch in the unit test.
- **About:** the FAQPage JSON-LD is unchanged (diff the built `<script type="application/ld+json">` before and after), the jump links scroll to the right sections, and `<details>` works with JS disabled.
- **Accessibility:** axe in both themes on `/about` and `/contact`; the error and success text pass contrast (covered by the Phase 0 contrast test); the type-floor and raw-hex ratchets are lowered.
- **Standard gates.**

## Out of scope

New About copy (owner-supplied), the newsletter (removed while the blog is hidden), and Turnstile (general backlog).
