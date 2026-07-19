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
  { path: "/", name: "home", expectsHeadingPattern: /KunanonJ|See ventures|Ventures/i },
  {
    path: "/about",
    name: "about",
    expectsHeadingPattern:
      /Built for the curious|Founder,\s*Bangkok|GoGoCash|Manifesto|operating principles/i,
  },
  {
    path: "/showcase",
    name: "showcase",
    expectsHeadingPattern: /Live Better|Start Today|KunanonJ/i,
  },
  {
    path: "/contact",
    name: "contact",
    expectsHeadingPattern: /Say hello|Send my message|products/i,
  },
  {
    path: "/press",
    name: "press",
    expectsHeadingPattern: /Press|View|GoGoCash|Manut/i,
  },
  {
    path: "/blog",
    name: "blog",
    expectsHeadingPattern: /Blog|Search posts|Read|GoGoCash|Manut|Bangkok/i,
  },
  { path: "/resume", name: "resume", expectsHeadingPattern: /\S/ },
];
