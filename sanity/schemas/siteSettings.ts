import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(220),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "email",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "discordHandle",
      title: "Discord handle",
      type: "string",
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "object",
      fields: [
        defineField({ name: "x", title: "X", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
        defineField({ name: "github", title: "GitHub", type: "url" }),
        defineField({ name: "telegram", title: "Telegram", type: "url" }),
        defineField({ name: "farcaster", title: "Farcaster", type: "url" }),
        defineField({ name: "website", title: "Website", type: "url" }),
      ],
    }),
    defineField({
      name: "navigation",
      title: "Primary navigation",
      type: "array",
      of: [{ type: "navItem" }],
    }),
    defineField({
      name: "footerTagline",
      title: "Footer tagline",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(180),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline" },
  },
});
