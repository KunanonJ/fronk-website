# Visual redesign research: premium, minimal, clean (09-11-26)

**Mode:** RESEARCH. No code has changed.
**Owner ask:** "analyse my website and do deep research from mobbin to improve my personal website to be high quality, premium, elegant, minimal, clean". The references are https://www.helumi.app/ and the owner's palette images.
**Sources:**
- 17 Mobbin searches (38 references kept; IDs checked against the raw results);
- helumi.app HTML plus its three CSS files (tokens read directly from `:root`);
- the live site and code at `main` @ `936543d`;
- WCAG contrast computed for every palette pair.

## 1. Where the site is today

| Area | Today | Effect on "premium, minimal" |
|---|---|---|
| Theme | Dark-first cinematic: black canvas, cream ink `#dedbc8`, liquid-glass panels | Moody rather than clean; glass and video compete with the content |
| Type | 4 families: Instrument Serif (display), Hanken Grotesk, Almarai (landing body), Space Mono. The SEO audit counted 9 font preloads | No single voice; the serif plus mono pairing reads retro |
| Imagery | Hot-linked third-party AI videos (home and contact heroes), Unsplash blog banners; About now uses the owner's portrait (#57) | Stock imagery says nothing about the owner and costs most of the LCP (10.7 s on `/`) |
| Motion | First-visit intro, route fade, custom cursor, word pull-ups, framer-motion everywhere | Fine after Phase 1, but motion is decoration more than meaning |
| Components | Mixed radii, glass, outlined chips, icons in the nav pill | No shared system, so pages feel assembled rather than designed |
| Strengths to keep | One h1 per page, strong SEO and JSON-LD, contrast-safe tokens (#36), honest content, portfolio mockups and diagrams, the floating pill nav idea | |

## 2. Reference: helumi.app (exact tokens from its CSS)

- **Type:** Apple system stack (`SF Pro Display`/`SF Pro Text`) with Inter as fallback; Caveat for a handwritten sign-off. Weights are mostly 600 and 500. Tracking is -0.01 to -0.035em on headings.
- **Scale:** text 12/14/16/20/24/32/48 px; spacing 4/8/12/16/24/32/48/64/80 px; content width **880 px**; section spacing 64 px, rising to 80 px on desktop.
- **Shape:** radius 16 px (10 px small). Edges are hairline borders drawn as `box-shadow: 0 0 0 .5px rgb(0 0 0 / 12%)` rather than heavy shadows.
- **Colour:** monochrome. Page `#f5f5f5`, surface `#fff`, fill `#e9e8ea`, ink `#000`, secondary ink at 64% and 56% black; the accent is black too. Light theme only.
- **Easing:** `cubic-bezier(.22, 1, .36, 1)`, the same curve this site already uses.
- **Why it feels premium:**
  - one promise and one repeated CTA;
  - specific numbers instead of adjectives;
  - real product UI as the imagery;
  - short plain copy;
  - a first-person founder note with a small photo.

  It isn't sparse; the premium feel comes from consistency and restraint.

## 3. Mobbin patterns that fit this site

Full list with links: §8. The strongest fits:

1. **Hero:** a left-aligned two-line statement (second line in secondary grey), a mono status chip, one primary pill and one ghost pill, and a data strip instead of decoration. See Cloudstudio "Agents" and Analogue Agency.
2. **Nav:** keep the floating pill, but use text labels instead of icons. The active item gets a tint plus a small square marker, and Contact is a solid inset pill. See mymind and T1 Energy.
3. **Work:** numbered two-column cards with one hero metric. Case studies get a right-hand metadata rail (Role / Stack / Year / Status) and a four-column facts strip. See Cloudstudio "Selected work" and the Tailscale case study.
4. **About:** either keep the centered portrait (owner's 09-11-26 choice, #57) or use a split: a tinted statement card beside a 4:5 portrait card of equal height (Kalstore). Decide during the redesign.
5. **Contact:** one large-radius form card on a warm wash, mono labels, a pill submit, and a success state that replaces the form in place (Until; Pipedrive flow).
6. **Proof:** stat tiles with a mono label, tabular numerals and hairline dividers (Spade, Fluz).
7. **Electric blue plus a sparing orange:** Agentcard, Patch and Reducto use a `#2B3BFF`-like blue with a single orange square. That is the owner's Ember rule.
8. **Footer:** three link columns over an oversized name wordmark (Maze, Structured).
9. **Dark mode:** near-black, hairlines instead of shadows, indigo as the only colour (Twenty, Linear).

## 4. Palette: roles and contrast

The owner's palette: Signal `#2B3BFF`, Glaze `#E8EBFF`, Paper `#FFFFFF`, Ink `#0B0D17`, Clay `#FFE3D6`, Ember `#FF5A1F`.

| Pair | Ratio | Use |
|---|---|---|
| Signal on Paper / Paper on Signal | 6.62 | AA text: links, primary buttons |
| Signal on Glaze / Signal on Clay | 5.60 / 5.43 | AA text |
| Ink on Paper / Glaze / Clay | 19.37 / 16.38 / 15.87 | Body text anywhere |
| Ink on Ember | 6.21 | AA: dark text on an Ember chip |
| Ember on Paper / Paper on Ember | 3.12 | **Large text or non-text only** |
| Ember on Glaze / Clay / a #E9EAF0 page | about 2.6 | **Fails even non-text**: put Ember markers on Paper or Ink, or pair them with a text label |
| Signal on Ink | 2.93 | **Fails text and non-text**: in dark mode, links and focus use a lighter Signal, e.g. `#7C86FF` (6.19) or `#8E97FF` (7.40) |
| Glaze / Paper / Clay / Ember on Ink | 16.38 / 19.37 / 15.87 / 6.21 | AA |

Surface separation: Glaze and Clay are about 1.02:1 against a light page, so tinted cards need a hairline or shadow to read as separate surfaces.

**Proposed roles:**

| Role | Light | Dark |
|---|---|---|
| Page | `#F5F6FA` (or Mist `#E9EAF0`) | Ink `#0B0D17` |
| Surface | Paper | `#151829` |
| Tinted surface | Glaze, plus a hairline | `#1D2136` |
| Warm surface | Clay, plus a hairline | `#151829` with Clay at 8% |
| Text / secondary | Ink / `#565B70` (5.6:1) | Glaze / `#A1A6BD` |
| Hairline | Ink at 8% | Glaze at 8% |
| Primary action | Signal fill, Paper text | Signal fill, Paper text |
| Link / focus ring | Signal | `#7C86FF`-`#8E97FF` |
| Live / failed marker | Ember squares (on Paper or Ink) | Ember |
| Error text | `#C93C0A` (5.08 on Paper), with an Ember marker | `#FF7A45` |

## 5. Proposed design system (draft for the PLAN phase)

- **Fonts:** one sans plus one mono. Either Inter Tight (display) with Inter (body), or Hanken Grotesk for both, which is already loaded and costs nothing extra. Pair with JetBrains Mono or Geist Mono. Retire Instrument Serif, Almarai and Space Mono. That's 4 families down to 2 and fewer preloads; Thai pages keep a Thai-capable fallback (e.g. IBM Plex Sans Thai or Noto Sans Thai).
- **Type scale (desktop / mobile):**
  - display 88/56, line-height 1.0, -0.045em, 700;
  - H1 64/44, -0.04em; H2 44/32, -0.03em, 600; H3 28/22, -0.02em, 600;
  - lead 20/18; body 16-17 at 1.6;
  - mono label 12 px uppercase, +0.06em;
  - stats 64/44 with tabular numerals.
- **Spacing:** 4-based (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Sections 96-128 px apart (64-80 on phones).
- **Radius:** chip 8, input 12, card 20-28, hero panel 32-36, pill 999. Pixel squares stay at 0.
- **Elevation:** a light-mode soft stack, e.g. `0 1px 2px` Ink at 4%, plus `0 12px 32px -12px` Ink at 10%, plus a faint Signal glow. Dark mode uses hairlines, not shadows.
- **Grid:** 12 columns, 24 px gutters; content 1120-1200 px; reading measure about 680 px (helumi uses 880 px for everything).
- **Motif:** one shared pixel-grid component (8-16 px Signal squares) for the hero tile, metrics, 404 and footer. Ember squares appear only when bound to a live or failed state, following the owner's palette note.

## 6. Ranked changes

1. **Light theme by default** (Paper and Glaze on a pale page); keep dark as a toggle. This is the biggest single shift toward "clean".
2. **Tokens first:** move the role table into `app/globals.css` for both themes, mapped to Tailwind, with no raw hex in components. Everything else builds on this.
3. **One sans plus one mono** (above). It also helps the speed budget.
4. **New home hero:** statement, status chip, Signal CTA and a pixel tile in place of the video wordmark. That also removes today's slowest LCP element.
5. **Shared pixel-motif component** with the Ember rule.
6. **Portfolio:** numbered metric cards on the index; a metadata rail and facts strip on detail pages.
7. **About:** the portrait hero (#57) restyled to the new tokens, or the split-card variant; the FAQ as a hairline accordion.
8. **Nav:** text-label pill, tinted active state with a Signal square, Ink Contact pill.
9. **Contact:** a Clay card with in-place success; Ember only on errors.
10. **Proof strip and footer:** stat tiles, and a footer with an oversized name wordmark.

## 7. Overlap with other work

- `ux-experience` (Phases 2-5) said "no visual redesign". The redesign supersedes most of its Phase 3 (type floor, tap targets) and Phase 4 (information architecture) presentation work. Phase 2 (speed) is mostly delivered by retiring the videos and the extra fonts.
- The TanStack Start migration touches routing, data and metadata, not visual components. See `tanstack-start-migration-research_REPORT_09-11-26.md` for sequencing.

## 8. Mobbin references (IDs as returned by search)

- **Heroes:**
  - [Cloudstudio Agents](https://mobbin.com/sites/sections/b75f8e03-b2a2-4869-8791-e1999bd626a7)
  - [Analogue Agency](https://mobbin.com/sites/sections/ec7c6b3a-accc-48a3-b3b9-c5a87f7d63bf)
  - [Attio](https://mobbin.com/sites/sections/2e4e3401-9442-417b-a41a-dff97a660a95)
  - [Customer.io](https://mobbin.com/sites/sections/c74125df-8280-4579-9289-6255600499f1)
- **Nav:**
  - [mymind](https://mobbin.com/sites/sections/c2861ec1-5f2c-4915-9753-98b94e3f5fdf)
  - [T1 Energy](https://mobbin.com/sites/sections/08b1da0a-e784-4a8c-8d23-0359ff00b023)
  - [Fourmula AI](https://mobbin.com/sites/sections/3332ff1d-967c-4f6a-99fa-f9a4734c181b)
- **Work:**
  - [Cloudstudio Selected work](https://mobbin.com/sites/sections/48890788-7d16-4887-baaa-5b22583ef055)
  - [Unseen Studio](https://mobbin.com/sites/sections/79d328bc-800b-4830-9de1-7ef8fd2dd00f)
  - [Fiasco](https://mobbin.com/sites/sections/4ed7c118-a866-41fa-824c-32a24323c927)
  - [Tailscale case study](https://mobbin.com/sites/sections/84f94fa1-216c-40e9-aa21-d4b6e8039f5b)
  - [COLLINS](https://mobbin.com/sites/sections/213b1c6a-6655-4330-965d-4851cf1e25cd)
- **About:**
  - [Kalstore founder](https://mobbin.com/sites/sections/5e1e6047-eef1-417c-b42b-c7ab44205e35)
  - [Slack, Stewart Butterfield](https://mobbin.com/sites/sections/1bafeb86-728a-425b-aa78-c5e680e7f640)
  - [incident.io letter](https://mobbin.com/sites/sections/67e11461-af20-4b7e-8e9a-8f0cdc669a8d)
- **Contact:**
  - [Until](https://mobbin.com/sites/sections/f61b18d1-3828-4989-a9ae-b260c8dc3f79)
  - [Savor](https://mobbin.com/sites/sections/ae1f5fe6-9420-45e4-b097-64ae2aa8c06e)
  - [Pipedrive form flow](https://mobbin.com/flows/c77f9668-552e-4da7-88a7-c7f2c10332ed)
  - [Seasats](https://mobbin.com/sites/sections/008b60bc-fba0-4d85-8dbf-105466ef0cc3)
- **Footer:**
  - [Maze](https://mobbin.com/sites/sections/43b8823a-7002-4bd5-a23d-88673d35492a)
  - [Structured](https://mobbin.com/sites/sections/cf954a98-4f2e-41d3-b2a1-168e4ba0108d)
  - [Spade](https://mobbin.com/sites/sections/6d088b40-a574-4e35-905c-bff022cfc5d5)
- **Proof:**
  - [Spade stats](https://mobbin.com/sites/sections/34a2151f-c9b2-4121-b790-8e85202fe9ca)
  - [Aave](https://mobbin.com/sites/sections/02770c29-a1ea-4602-894f-9a59a779f0ea)
  - [Fluz](https://mobbin.com/sites/sections/2cd277b3-579b-4d9d-8a70-bc882293c9e7)
  - [Railway](https://mobbin.com/sites/sections/fdccd8a8-b0fc-4cf4-ac07-75a7775ee4e3)
- **Typography-led:**
  - [Rains](https://mobbin.com/sites/sections/7c131587-262f-4b5d-a691-df7ed8c8e5d7)
  - [Runway](https://mobbin.com/sites/sections/10d39ce5-31db-4556-8169-96098e3e8ede)
  - [Wix Studio](https://mobbin.com/sites/sections/ce65a4cd-2ce5-40ac-b2d7-e597d1f95520)
- **Blue plus orange:**
  - [Agentcard](https://mobbin.com/sites/sections/bf129abc-ab32-4ea9-a872-6c99837e513d)
  - [Patch](https://mobbin.com/sites/sections/40cfa79f-c1db-4e7c-aa91-b542618a8469)
  - [Reducto](https://mobbin.com/sites/sections/962f4563-2dbe-4876-8944-1805c15b2608)
  - [Antimetal CTA](https://mobbin.com/sites/sections/2e58a2d3-8310-4e89-9654-d63be89cba15)
  - [Mesh (mobile)](https://mobbin.com/screens/2b7ecf5e-c4f5-4894-8bb1-dd2d1314625b)
  - [Public (mobile)](https://mobbin.com/screens/38a6a8f3-8f04-493a-a4f6-285cbf76d46f)
- **Dark:**
  - [Twenty](https://mobbin.com/sites/sections/462859fb-70c3-4bcb-9315-9e65c987bfad)
  - [Antimetal](https://mobbin.com/sites/sections/38557cd6-0834-4d5a-b186-89ac968d8332)
  - [Linear case study](https://mobbin.com/sites/sections/444de3af-c5ad-4a90-b7a5-f667a22b10f9)
