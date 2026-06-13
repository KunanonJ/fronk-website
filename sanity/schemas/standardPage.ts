import { defineField, defineType } from "sanity";

export const standardPage = defineType({
  name: "standardPage",
  title: "Standard page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "date",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish at",
      type: "datetime",
      description:
        "Leave blank to publish immediately. Future dates stay hidden publicly.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableBody",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
