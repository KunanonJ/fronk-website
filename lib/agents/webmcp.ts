import { markdownPathFor } from "@/lib/agents/markdownPaths";
import type { ContactDraft } from "@/lib/agents/contactDraft";
import { oneLine } from "@/lib/contact/compose";
import { firstContactIssue } from "@/lib/contact/schema";
import {
  CONTACT_LIMITS,
  CONTACT_TOPICS,
  isContactTopic,
} from "@/lib/content/contact";
import { siteConfig } from "@/lib/site";

/*
 * The site's WebMCP tools (https://github.com/webmachinelearning/webmcp): what
 * kunanonj.com offers an AI agent working in the visitor's browser. The read
 * tools return the text the site already publishes for agents (llms.txt,
 * llms-full.txt, sitemap.md, the Markdown versions of pages, skills.json); the
 * others do what the visitor could do (open a page, switch the theme, fill in
 * the contact form for the visitor to review and open in their email app).
 * Nothing here sends a message or changes data on the server.
 * components/agents/WebMcpTools.tsx registers them with the browser.
 */

export interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

export interface SiteTool {
  /** 1 to 128 ASCII letters, digits, `_`, `-` or `.` (the spec's rule). */
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
}

/** What the tools need from the page: injected, so tests can fake them. */
export interface ToolDeps {
  /** Fetches a same-site text file (llms.txt, a Markdown page...). */
  fetchText: (path: string) => Promise<string>;
  /** Opens a same-site path in this tab, as a link would. */
  navigate: (path: string) => Promise<void>;
  setTheme: (theme: ColorTheme) => void;
  /** Puts a draft in the contact form; false when the form did not open. */
  draftContact: (draft: ContactDraft) => Promise<boolean>;
}

export const COLOR_THEMES = ["light", "dark", "system"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

const text = (value: string): ToolResult => ({
  content: [{ type: "text", text: value }],
});
const failure = (value: string): ToolResult => ({
  content: [{ type: "text", text: value }],
  isError: true,
});

/** The first `max` UTF-16 units, without a lone half of a surrogate pair. */
function clip(value: string, max: number): string {
  const cut = value.slice(0, max);
  return /[\uD800-\uDBFF]$/.test(cut) ? cut.slice(0, -1) : cut;
}

/**
 * A path on this site an agent may open: one leading slash and no scheme,
 * host or whitespace, so "/about" passes and "//evil.example" does not.
 */
export function sitePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  return /^\/(?![/\\])[^\s]*$/.test(path) ? path : null;
}

const PATH_PARAM = {
  type: "string",
  description:
    "A path on kunanonj.com, starting with a slash, for example /about or /portfolio/tbh-intranet.",
} as const;

const READ_ONLY = { readOnlyHint: true } as const;
const ACTS = { readOnlyHint: false } as const;
const NO_INPUT = { type: "object", properties: {} } as const;

/** The site's tools, bound to this page's fetch, router and theme. */
export function siteTools(deps: ToolDeps): SiteTool[] {
  return [
    {
      name: "get_site_overview",
      title: "Site overview",
      description:
        "Who Kunanon Jarat (Fronk) is, what he builds and where each part of kunanonj.com lives: the site's llms.txt, a short Markdown summary with links.",
      inputSchema: NO_INPUT,
      annotations: READ_ONLY,
      execute: async () => text(await deps.fetchText("/llms.txt")),
    },
    {
      name: "get_full_profile",
      title: "Full profile",
      description:
        "Everything the site says, as one text: the résumé with every role and bullet, the projects and ventures, the skills and the topic hubs (llms-full.txt).",
      inputSchema: NO_INPUT,
      annotations: READ_ONLY,
      execute: async () => text(await deps.fetchText("/llms-full.txt")),
    },
    {
      name: "list_pages",
      title: "List pages",
      description:
        "Every page of kunanonj.com with its address and a line about it (sitemap.md).",
      inputSchema: NO_INPUT,
      annotations: READ_ONLY,
      execute: async () => text(await deps.fetchText("/sitemap.md")),
    },
    {
      name: "read_page",
      title: "Read a page",
      description:
        "The Markdown version of a page: the Home (/), About (/about) or a project (/portfolio/<slug>). Other pages have none; get_full_profile covers them.",
      inputSchema: {
        type: "object",
        properties: { path: PATH_PARAM },
        required: ["path"],
      },
      annotations: READ_ONLY,
      execute: async ({ path }) => {
        const page = sitePath(path)?.split(/[?#]/)[0];
        const markdown = page ? markdownPathFor(page) : null;
        if (!markdown) {
          return failure(
            `No Markdown version of ${String(path)}. The Home (/), About (/about) and each project (/portfolio/<slug>) have one; get_full_profile covers the rest.`,
          );
        }
        return text(await deps.fetchText(markdown));
      },
    },
    {
      name: "list_agent_skills",
      title: "List agent skills",
      description:
        "The open-source agent skills Kunanon publishes as Superstacks (MIT): each skill's name, summary, origin and install commands, as JSON (skills.json).",
      inputSchema: NO_INPUT,
      annotations: READ_ONLY,
      execute: async () => text(await deps.fetchText("/skills.json")),
    },
    {
      name: "open_page",
      title: "Open a page",
      description:
        "Open a page of kunanonj.com in this tab, for example /portfolio, /about, /skills or /contact. list_pages names them all.",
      inputSchema: {
        type: "object",
        properties: { path: PATH_PARAM },
        required: ["path"],
      },
      annotations: ACTS,
      execute: async ({ path }) => {
        const page = sitePath(path);
        if (!page) {
          return failure(
            `${String(path)} is not a path on this site. Use one that starts with a slash, such as /about.`,
          );
        }
        await deps.navigate(page);
        return text(`Opened ${page}.`);
      },
    },
    {
      name: "set_color_theme",
      title: "Set the colour theme",
      description:
        "Show the site in its light or dark theme, or follow the device's setting (system).",
      inputSchema: {
        type: "object",
        properties: {
          theme: {
            type: "string",
            enum: [...COLOR_THEMES],
            description: "light, dark, or system to follow the device.",
          },
        },
        required: ["theme"],
      },
      annotations: ACTS,
      execute: async ({ theme }) => {
        if (!COLOR_THEMES.includes(theme as ColorTheme)) {
          return failure(`Choose light, dark or system, not ${String(theme)}.`);
        }
        deps.setTheme(theme as ColorTheme);
        return text(`The site now uses the ${String(theme)} theme.`);
      },
    },
    {
      name: "draft_contact_message",
      title: "Draft a message to Kunanon",
      description:
        "Fill in the contact form on /contact with the visitor's name, the message and, optionally, what it is about, for the visitor to review. Its button opens the visitor's own email app with the message addressed to Kunanon; nothing is sent until the visitor presses Send there.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The visitor's name.",
            maxLength: CONTACT_LIMITS.nameMax,
          },
          message: {
            type: "string",
            description: "The message, in the visitor's words.",
            minLength: CONTACT_LIMITS.messageMin,
            maxLength: CONTACT_LIMITS.messageMax,
          },
          topics: {
            type: "array",
            description: "What it is about, from the form's own list.",
            items: { type: "string", enum: [...CONTACT_TOPICS] },
          },
        },
        required: ["name", "message"],
      },
      annotations: ACTS,
      execute: async ({ name, message, topics }) => {
        if (typeof name !== "string" || typeof message !== "string") {
          return failure("Give a name and a message.");
        }
        const values = {
          // One line, as the form's input shows it and the subject needs.
          name: clip(oneLine(name), CONTACT_LIMITS.nameMax),
          message: clip(message.trim(), CONTACT_LIMITS.messageMax),
          topics: topics ?? [],
        };
        // The form's own rules (its topic list among them), so a draft its
        // button would refuse comes back to the agent instead of reaching
        // the visitor.
        const issue = firstContactIssue(values);
        if (issue) return failure(`${issue.field}: ${issue.message}`);
        const draft: ContactDraft = {
          name: values.name,
          message: values.message,
          // Topics given replace the form's choices; none given keeps them.
          ...(Array.isArray(topics)
            ? { topics: [...new Set(topics.filter(isContactTopic))] }
            : {}),
        };
        if (!(await deps.draftContact(draft))) {
          return failure(
            `The contact form did not open. The visitor can write to ${siteConfig.email} instead.`,
          );
        }
        return text(
          "The draft is in the contact form on /contact. Ask the visitor to check it and press its button, which opens their email app; they send it from there.",
        );
      },
    },
  ];
}
