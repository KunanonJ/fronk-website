import { describe, expect, it } from "vitest";
import {
  DEFAULT_WRITING_PAGE,
  resolveWritingPageContent,
} from "./writingPage";

describe("resolveWritingPageContent", () => {
  it("returns static defaults when CMS content is missing", () => {
    expect(resolveWritingPageContent(null)).toEqual(DEFAULT_WRITING_PAGE);
  });

  it("uses CMS copy when present", () => {
    expect(
      resolveWritingPageContent({
        eyebrow: "Journal",
        heading: "Notes from the field.",
        description: "Weekly updates from building GoGoCash.",
        seo: {
          title: "Field notes",
          description: "Weekly founder updates.",
        },
      }),
    ).toEqual({
      eyebrow: "Journal",
      heading: "Notes from the field.",
      description: "Weekly updates from building GoGoCash.",
      metadata: {
        title: "Field notes",
        description: "Weekly founder updates.",
      },
    });
  });

  it("falls back field-by-field when CMS values are blank", () => {
    expect(
      resolveWritingPageContent({
        eyebrow: "  ",
        heading: "Custom heading.",
        description: null,
        seo: { title: "", description: "Custom meta description." },
      }),
    ).toEqual({
      eyebrow: DEFAULT_WRITING_PAGE.eyebrow,
      heading: "Custom heading.",
      description: DEFAULT_WRITING_PAGE.description,
      metadata: {
        title: DEFAULT_WRITING_PAGE.metadata.title,
        description: "Custom meta description.",
      },
    });
  });
});
