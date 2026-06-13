import { defineField, defineType } from "sanity";

export const resumeProfile = defineType({
  name: "resumeProfile",
  title: "Resume profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: "sections",
      title: "Timeline sections",
      type: "array",
      of: [{ type: "resumeTimelineSection" }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "headline" },
  },
});
