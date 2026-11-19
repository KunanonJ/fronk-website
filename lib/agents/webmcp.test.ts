import { describe, expect, it, vi } from "vitest";
import {
  fillContactDraft,
  onContactDraft,
  type ContactDraft,
} from "@/lib/agents/contactDraft";
import { siteTools, sitePath, type ToolDeps } from "@/lib/agents/webmcp";
import { CONTACT_LIMITS } from "@/lib/content/contact";

function deps(overrides: Partial<ToolDeps> = {}): ToolDeps {
  return {
    fetchText: vi.fn(async (path: string) => `text of ${path}`),
    navigate: vi.fn(async () => {}),
    setTheme: vi.fn(),
    draftContact: vi.fn(async () => true),
    ...overrides,
  };
}

const tool = (d: ToolDeps, name: string) =>
  siteTools(d).find((t) => t.name === name)!;

const textOf = (result: { content: { text: string }[] }) =>
  result.content.map((c) => c.text).join("\n");

describe("the WebMCP tools", () => {
  it("follow the spec's naming rule and describe themselves", () => {
    const tools = siteTools(deps());
    expect(tools.map((t) => t.name)).toEqual([
      "get_site_overview",
      "get_full_profile",
      "list_pages",
      "read_page",
      "list_agent_skills",
      "open_page",
      "set_color_theme",
      "draft_contact_message",
    ]);
    for (const t of tools) {
      expect(t.name).toMatch(/^[A-Za-z0-9_.-]{1,128}$/);
      expect(t.description.length, t.name).toBeGreaterThan(20);
      expect(t.title, t.name).not.toBe("");
      expect(t.inputSchema.type, t.name).toBe("object");
      expect(() => JSON.stringify(t.inputSchema), t.name).not.toThrow();
    }
  });

  it("marks the tools that only read as read-only", () => {
    const readOnly = siteTools(deps())
      .filter((t) => t.annotations.readOnlyHint)
      .map((t) => t.name);
    expect(readOnly).toEqual([
      "get_site_overview",
      "get_full_profile",
      "list_pages",
      "read_page",
      "list_agent_skills",
    ]);
  });

  it("return the site's own agent texts", async () => {
    const d = deps();
    expect(textOf(await tool(d, "get_site_overview").execute({}))).toBe(
      "text of /llms.txt",
    );
    expect(textOf(await tool(d, "get_full_profile").execute({}))).toBe(
      "text of /llms-full.txt",
    );
    expect(textOf(await tool(d, "list_pages").execute({}))).toBe(
      "text of /sitemap.md",
    );
    expect(textOf(await tool(d, "list_agent_skills").execute({}))).toBe(
      "text of /skills.json",
    );
  });

  it("reads a page's Markdown version, and says which pages have one", async () => {
    const d = deps();
    const read = tool(d, "read_page");
    expect(textOf(await read.execute({ path: "/" }))).toBe("text of /index.md");
    expect(textOf(await read.execute({ path: "/about?x=1" }))).toBe(
      "text of /about.md",
    );
    expect(
      textOf(await read.execute({ path: "/portfolio/tbh-intranet" })),
    ).toBe("text of /portfolio/tbh-intranet.md");
    const none = await read.execute({ path: "/skills" });
    expect(none.isError).toBe(true);
    expect(textOf(none)).toMatch(/get_full_profile/);
    expect(d.fetchText).toHaveBeenCalledTimes(3);
  });

  it("opens only paths on this site", async () => {
    const d = deps();
    const open = tool(d, "open_page");
    expect(textOf(await open.execute({ path: "/contact" }))).toBe(
      "Opened /contact.",
    );
    for (const path of [
      "//evil.example",
      "/\\evil.example",
      "https://evil.example",
      "javascript:alert(1)",
      "about",
      "/a b",
      42,
    ]) {
      const result = await open.execute({ path });
      expect(result.isError, String(path)).toBe(true);
    }
    expect(d.navigate).toHaveBeenCalledTimes(1);
    expect(d.navigate).toHaveBeenCalledWith("/contact");
  });

  it("switches between the site's themes only", async () => {
    const d = deps();
    const set = tool(d, "set_color_theme");
    expect((await set.execute({ theme: "dark" })).isError).toBeUndefined();
    expect(d.setTheme).toHaveBeenCalledWith("dark");
    expect((await set.execute({ theme: "sepia" })).isError).toBe(true);
    expect(d.setTheme).toHaveBeenCalledTimes(1);
  });

  it("drafts a message for the visitor to send, and never sends it", async () => {
    const d = deps();
    const draft = tool(d, "draft_contact_message");
    const ok = await draft.execute({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello from an agent.",
    });
    expect(ok.isError).toBeUndefined();
    expect(textOf(ok)).toMatch(/press Send/);
    expect(d.draftContact).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello from an agent.",
    });
    expect((await draft.execute({ name: "Ada" })).isError).toBe(true);
    const closed = await tool(
      deps({ draftContact: async () => false }),
      "draft_contact_message",
    ).execute({ name: "A", email: "a@example.com", message: "Hello there." });
    expect(closed.isError).toBe(true);
    expect(textOf(closed)).toMatch(/@/);
  });
});

describe("draft_contact_message's checks", () => {
  it("returns the form's own complaint instead of a draft Send would refuse", async () => {
    const d = deps();
    const result = await tool(d, "draft_contact_message").execute({
      name: "Ada",
      email: "ada.example.com",
      message: "Hello from an agent.",
    });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toMatch(/^email: /);
    expect(d.draftContact).not.toHaveBeenCalled();
  });

  it("cuts an overlong message without splitting a character", async () => {
    const d = deps();
    const emoji = "\u{1F600}"; // two UTF-16 units
    const message = "a".repeat(CONTACT_LIMITS.messageMax - 1) + emoji + "tail";
    await tool(d, "draft_contact_message").execute({
      name: "Ada",
      email: "ada@example.com",
      message,
    });
    const sent = vi.mocked(d.draftContact).mock.calls[0]![0].message;
    expect(sent).toHaveLength(CONTACT_LIMITS.messageMax - 1);
    expect(sent.at(-1)).toBe("a");
  });
});

describe("sitePath", () => {
  it("keeps same-site paths and refuses the rest", () => {
    expect(sitePath(" /about ")).toBe("/about");
    expect(sitePath("/portfolio?category=ai")).toBe("/portfolio?category=ai");
    expect(sitePath("//evil.example")).toBeNull();
    expect(sitePath("http://evil.example")).toBeNull();
    expect(sitePath(null)).toBeNull();
  });
});

describe("the contact form's draft bridge", () => {
  it("hands a draft to the mounted form only", () => {
    const draft: ContactDraft = { name: "A", email: "a@b.co", message: "Hi." };
    expect(fillContactDraft(draft)).toBe(false);
    const got: ContactDraft[] = [];
    const stop = onContactDraft((d) => got.push(d));
    expect(fillContactDraft(draft)).toBe(true);
    stop();
    expect(fillContactDraft(draft)).toBe(false);
    expect(got).toEqual([draft]);
  });
});
