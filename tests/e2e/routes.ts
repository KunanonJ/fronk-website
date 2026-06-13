/**
 * Public routes under test. `/studio` (Sanity) and `/resume.pdf` are excluded —
 * the former is third-party chrome, the latter is a binary artifact.
 */
export interface RouteUnderTest {
  readonly path: string;
  readonly name: string;
  /** A heading or text we expect on the page, used as a render smoke check. */
  readonly expectsHeadingPattern: RegExp;
}

export const ROUTES: readonly RouteUnderTest[] = [
  { path: "/", name: "home", expectsHeadingPattern: /\S/ },
  { path: "/about", name: "about", expectsHeadingPattern: /\S/ },
  { path: "/now", name: "now", expectsHeadingPattern: /\S/ },
  { path: "/ventures", name: "ventures", expectsHeadingPattern: /\S/ },
  { path: "/writing", name: "writing", expectsHeadingPattern: /\S/ },
  { path: "/contact", name: "contact", expectsHeadingPattern: /\S/ },
  { path: "/resume", name: "resume", expectsHeadingPattern: /\S/ },
];
