/**
 * The site meta description (about 155 characters), in its own module so the
 * shared client chunk (lib/content/landing.ts, lib/site.ts) carries this one
 * string instead of every identity statement. lib/content/identity.ts
 * re-exports it.
 */
export const PERSON_META_DESCRIPTION =
  "Kunanon Jarat (Fronk): AI engineering lead and solopreneur in Bangkok. Founder of GoGoCash, builder of Manut AI, open to Forward Deployed Engineer roles.";
