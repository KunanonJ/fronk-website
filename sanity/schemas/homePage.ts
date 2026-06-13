import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "heroTagline",
      title: "Hero tagline",
      type: "string",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "heroIntro",
      title: "Hero intro",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(360),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA",
      type: "cta",
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "cta",
    }),
    defineField({
      name: "featuredSectionKicker",
      title: "Featured ventures kicker",
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "featuredSectionTitle",
      title: "Featured ventures title",
      type: "string",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "featuredLimit",
      title: "Featured venture limit",
      type: "number",
      validation: (Rule) => Rule.integer().min(1).max(6),
    }),
    defineField({
      name: "writingTitle",
      title: "Writing CTA title",
      type: "string",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "writingDescription",
      title: "Writing CTA description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(360),
    }),
    defineField({
      name: "writingCta",
      title: "Writing CTA",
      type: "cta",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
