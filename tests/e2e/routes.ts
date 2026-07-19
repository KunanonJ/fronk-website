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
    path: "/showcase",
    name: "showcase",
    expectsHeadingPattern: /fintech|Visuals|Start a project/i,
  },
  { path: "/resume", name: "resume", expectsHeadingPattern: /\S/ },
];
