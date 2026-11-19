import { expect, test, type Page } from "@playwright/test";

/**
 * WebMCP (lib/agents/webmcp.ts, components/agents/WebMcpTools.tsx): the
 * tools the site registers with an AI agent in the visitor's browser. No
 * shipping browser exposes WebMCP yet, so each test stands in a
 * `document.modelContext` that records what the page registers, then runs
 * the tools as an agent would. Desktop Chromium and the WebKit phone only:
 * the tools do not depend on the width.
 */

const BEHAVIOUR = new Set(["desktop", "webkit-phone"]);
const TOOLS = [
  "get_site_overview",
  "get_full_profile",
  "list_pages",
  "read_page",
  "list_agent_skills",
  "open_page",
  "set_color_theme",
  "draft_contact_message",
];

type Result = { content: { type: string; text: string }[]; isError?: boolean };

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(!BEHAVIOUR.has(testInfo.project.name), "behaviour projects only");
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // Storage can be unavailable; the intro then plays, which is fine.
    }
    const tools = new Map<string, { execute: (input: object) => unknown }>();
    const calls: string[] = [];
    Object.assign(window, { __webmcp: { tools, calls } });
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(
          tool: { name: string; execute: (input: object) => unknown },
          options?: { signal?: AbortSignal },
        ) {
          calls.push(tool.name);
          tools.set(tool.name, tool);
          options?.signal?.addEventListener("abort", () =>
            tools.delete(tool.name),
          );
          return Promise.resolve();
        },
      },
    });
  });
});

function registered(page: Page) {
  return page.evaluate(() => {
    const { tools, calls } = (
      window as unknown as {
        __webmcp: { tools: Map<string, unknown>; calls: string[] };
      }
    ).__webmcp;
    return { names: [...tools.keys()], calls: calls.length };
  });
}

/** Runs a registered tool as an agent would, and returns its result. */
function run(page: Page, name: string, input: object = {}): Promise<Result> {
  return page.evaluate(
    ([tool, args]) =>
      (
        window as unknown as {
          __webmcp: {
            tools: Map<string, { execute: (input: object) => unknown }>;
          };
        }
      ).__webmcp.tools
        .get(tool as string)!
        .execute(args as object) as Promise<Result>,
    [name, input] as const,
  );
}

async function visit(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "networkidle" });
  await expect.poll(async () => (await registered(page)).names).toEqual(TOOLS);
}

const textOf = (result: Result) => result.content.map((c) => c.text).join("");

const DRAFT = "Hello from an agent, on the visitor's behalf.";

/**
 * Notes each mailto: link the page opens (the contact form hands its email
 * to the visitor's email app by clicking one) instead of launching an app.
 */
async function recordOpenedEmails(page: Page) {
  await page.addInitScript(() => {
    const opened: string[] = [];
    Object.assign(window, { __openedEmails: opened });
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      // The attribute as written: .href re-encodes it (' becomes %27).
      if (this.protocol === "mailto:") opened.push(this.getAttribute("href")!);
      else click.call(this);
    };
  });
}

function openedEmails(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __openedEmails: string[] }).__openedEmails,
  );
}

test.describe("WebMCP tools", () => {
  test("registers the site's tools once, and keeps them across client navigations", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await visit(page);
    expect((await run(page, "open_page", { path: "/about" })).isError).toBe(
      undefined,
    );
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toContainText("Kunanon Jarat");
    expect(await registered(page)).toEqual({ names: TOOLS, calls: 8 });
    expect(errors).toEqual([]);
  });

  test("hands an agent the site's own texts", async ({ page }) => {
    await visit(page);
    expect(textOf(await run(page, "get_site_overview"))).toContain(
      "Kunanon Jarat",
    );
    expect(textOf(await run(page, "list_pages"))).toContain("/portfolio");
    expect(
      textOf(await run(page, "read_page", { path: "/portfolio/tbh-intranet" })),
    ).toContain("TBH Intranet");
    const skills = JSON.parse(textOf(await run(page, "list_agent_skills")));
    expect(skills).toBeTruthy();
    const none = await run(page, "read_page", { path: "/skills" });
    expect(none.isError).toBe(true);
  });

  test("opens only this site's pages, and switches the theme", async ({
    page,
  }) => {
    await visit(page);
    const away = await run(page, "open_page", { path: "//evil.example" });
    expect(away.isError).toBe(true);
    await expect(page).toHaveURL(/\/$/);
    await run(page, "set_color_theme", { theme: "dark" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await run(page, "set_color_theme", { theme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("drafts a contact message for the visitor to review, and opens nothing by itself", async ({
    page,
  }) => {
    await recordOpenedEmails(page);
    await visit(page);
    const result = await run(page, "draft_contact_message", {
      name: "Ada Agent",
      message: DRAFT,
      topics: ["Manut AI"],
    });
    expect(result.isError, textOf(result)).toBe(undefined);
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator("#contact-name")).toHaveValue("Ada Agent");
    await expect(page.locator("#contact-message")).toHaveValue(DRAFT);
    await expect(
      page.getByRole("button", { name: "Manut AI" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-send")).toBeFocused();
    // The visitor sends it, not the agent: nothing opens until they press.
    expect(await openedEmails(page)).toEqual([]);
  });

  test("pressing the button after a draft opens that email, addressed to the owner", async ({
    page,
  }) => {
    await recordOpenedEmails(page);
    await visit(page);
    await run(page, "draft_contact_message", {
      name: "Ada Agent",
      message: DRAFT,
      topics: ["Hiring"],
    });
    await expect(page.locator("#contact-send")).toBeFocused();
    await page.keyboard.press("Enter");
    const status = page
      .getByRole("article", { name: "Say hello", exact: true })
      .getByRole("status");
    await expect(status).toContainText("Your email is ready.");
    await expect(status).toBeFocused();
    const opened = await openedEmails(page);
    expect(opened).toHaveLength(1);
    const email = new URL(opened[0]!);
    expect(email.pathname).toBe("fronk.kunanon@gmail.com");
    expect(email.searchParams.get("subject")).toBe(
      "Hiring: Ada Agent via kunanonj.com",
    );
    expect(email.searchParams.get("body")).toBe(`${DRAFT}\r\n\r\nAda Agent`);
    await expect(page.locator("#contact-open")).toHaveAttribute(
      "href",
      opened[0]!,
    );
  });
});
