/**
 * Public routes under test. `/studio` (Sanity) is excluded — third-party chrome.
 * Retired FogLAMP marketing routes redirect into the landing shell.
 */
export interface RouteUnderTest {
  readonly path: string;
  readonly name: string;
  /** A heading or text we expect on the page, used as a render smoke check. */
  readonly expectsHeadingPattern: RegExp;
}

export const ROUTES: readonly RouteUnderTest[] = [
  {
    path: "/",
    name: "home",
    expectsHeadingPattern:
      /Forward deployed AI engineering|Ventures|Selected work/i,
  },
  {
    path: "/about",
    name: "about",
    expectsHeadingPattern:
      /Kunanon Jarat|Founder,\s*Bangkok|GoGoCash|Manifesto|operating principles/i,
  },
  {
    path: "/contact",
    name: "contact",
    expectsHeadingPattern: /Say hello|Send message|Let[’']s talk/i,
  },
  {
    path: "/press",
    name: "press",
    expectsHeadingPattern: /Press|View|GoGoCash|Manut/i,
  },
  {
    // Any unknown path: the root's 404 page (status 404), with the site chrome.
    path: "/does-not-exist",
    name: "not-found",
    expectsHeadingPattern: /Nothing lives here/i,
  },
  {
    // Unlinked and noindex: the bento system on one page.
    path: "/design",
    name: "design",
    expectsHeadingPattern: /Design system/i,
  },
  {
    path: "/portfolio",
    name: "portfolio",
    expectsHeadingPattern: /Selected work|Portfolio|TBH Intranet/i,
  },
  {
    path: "/portfolio/tbh-intranet",
    name: "portfolio-project",
    expectsHeadingPattern: /TBH Intranet|What it does|Tech stack/i,
  },
  {
    path: "/portfolio/ai-automation",
    name: "portfolio-diagrams",
    expectsHeadingPattern: /AI Automation|How it works|Architecture/i,
  },
  {
    // The public project (this site): no Outcome or My part card, and a
    // link to the source in the hero.
    path: "/portfolio/kunanonj-com",
    name: "portfolio-site",
    expectsHeadingPattern: /^kunanonj\.com\./i,
  },
  {
    path: "/skills",
    name: "skills",
    expectsHeadingPattern: /agent skills|Install the whole pack|verify-loop/i,
  },
  {
    path: "/skills/verify-loop",
    name: "skill-detail",
    expectsHeadingPattern: /verify-loop|Install this skill|SKILL\.md/i,
  },
  {
    path: "/blog",
    name: "blog",
    expectsHeadingPattern: /Blog|Search posts|Read|GoGoCash|Manut|Bangkok/i,
  },
  {
    path: "/learn",
    name: "learn",
    expectsHeadingPattern: /How I think about|Topic hub|Operator notes/i,
  },
  {
    path: "/examples",
    name: "examples",
    expectsHeadingPattern: /Examples|Builders|Operators|Founders/i,
  },
  {
    path: "/stack",
    name: "stack",
    expectsHeadingPattern: /Stack|Build|Ship|Operate|Cursor|Next\.js/i,
  },
  {
    path: "/proof",
    name: "proof",
    expectsHeadingPattern: /Proof|Users|Merchants|GoGoCash|Manut/i,
  },
  {
    path: "/build",
    name: "build",
    expectsHeadingPattern: /Build|Next|In progress|Shipped/i,
  },
  {
    path: "/resume",
    name: "resume",
    expectsHeadingPattern: /Kunanon Jarat|Currently|Experience/i,
  },
  {
    path: "/topics/ai-transformation-thailand",
    name: "topic-hub",
    expectsHeadingPattern: /AI|Thailand/i,
  },
  {
    // Four sections: the FDE positioning hub (EO-2).
    path: "/topics/forward-deployed-ai-engineering",
    name: "topic-hub-fde",
    expectsHeadingPattern: /Forward deployed/i,
  },
  {
    // The Thai FDE hub: two sections, with the availability pill and the
    // hiring buttons in Thai (recruiter-fit phase 2).
    path: "/th/topics/forward-deployed-ai-engineering",
    name: "topic-hub-fde-th",
    expectsHeadingPattern: /\S/,
  },
  {
    path: "/th/topics/ai-transformation-thailand",
    name: "topic-hub-th",
    expectsHeadingPattern: /\S/,
  },
  {
    // One section and one FAQ: the grid variant the canvas does not draw.
    path: "/th/topics/tech-startup-thailand-sea",
    name: "topic-hub-th-short",
    expectsHeadingPattern: /SEA/,
  },
  {
    path: "/ventures/gogocash",
    name: "venture-hub",
    expectsHeadingPattern: /GoGoCash/i,
  },
  {
    // No metrics and no core loop: the venture variant the canvas leaves out.
    path: "/ventures/manut",
    name: "venture-hub-manut",
    expectsHeadingPattern: /Manut AI/i,
  },
];
