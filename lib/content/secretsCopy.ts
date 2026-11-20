import { AVAILABILITY } from "@/lib/content/availability";

/*
 * The words of the site's secrets (now-building-and-genz Phase 3): the ⌘K
 * commands, the found-trait toast, the pixel party and the contact form's
 * stamp. A sibling of `searchCopy` (./profileChrome), in its own module so
 * only the lazy chunks that show them load them. All DRAFT for the owner.
 * The one fact here, what he is building, comes from AVAILABILITY.
 */
export const secretsCopy = {
  commands: {
    group: "Commands", // DRAFT
    count: (n: number) => `${n} ${n === 1 ? "command" : "commands"}`, // DRAFT
    none: (query: string) =>
      `No command matches “${query}”. Type / for the list.`, // DRAFT
    /** Each command's name, as typed, and what it does. */
    list: {
      party: ["/party", "Throw a pixel party"],
      "theme-light": ["/theme light", "Switch to the light theme"],
      "theme-dark": ["/theme dark", "Switch to the dark theme"],
      "copy-email": ["/copy email", "Copy my email address"],
      random: ["/random", "Open a random case study"],
      traits: ["/traits", "See the traits you have found"],
      resume: ["/resume", "Open the résumé"],
      contact: ["/contact", "Get in touch"],
      shortcuts: ["/shortcuts", "The keyboard shortcuts"],
      sudo: ["sudo hire kunanon", "A secret. Press Enter."],
      gm: ["gm", "A secret. Press Enter."],
    }, // DRAFT
    copied: (email: string) => `Copied ${email}.`, // DRAFT
    copyFailed: (email: string) =>
      `Could not copy it. The address is ${email}.`, // DRAFT
    sudo: `Permission denied: currently building ${AVAILABILITY.ventures.join(" and ")}. Try /contact.`, // DRAFT
    gm: "gm. Bangkok says hi.", // DRAFT
    shortcutsTitle: "Keyboard shortcuts", // DRAFT
    shortcuts: [
      ["⌘K or Ctrl K", "Open search"],
      ["Esc", "Close it"],
      ["↑ ↓", "Move through the list"],
      ["Enter", "Open or run"],
      ["/", "Commands"],
      ["A certain famous code", "A pixel party, anywhere"],
    ], // DRAFT
  },
  toast: {
    found: (label: string, found: number, total: number) =>
      found === total
        ? `You found ${label} · ${found}/${total}, the gold edition`
        : `You found ${label} · ${found}/${total}`, // DRAFT
    again: (label: string) => `Pixel party · ${label} on`, // DRAFT
    see: "See your portrait", // DRAFT
    dismiss: "Dismiss", // DRAFT
  },
  stamp: "Draft ready", // DRAFT
} as const;
