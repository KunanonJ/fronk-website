import { fireEvent, render, screen, within } from "@testing-library/react";
import type { PortableTextBlock } from "@portabletext/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import BlogIndexPage from "@/components/landing/blog/BlogIndexPage";
import BlogPostView from "@/components/landing/blog/BlogPostView";
import { resolveBlogCards } from "@/lib/content/blog";
import type { Post } from "@/lib/sanity/types";

const posts = resolveBlogCards([]);

function renderIndex(
  props: Partial<React.ComponentProps<typeof BlogIndexPage>> = {},
) {
  const onTagChange = vi.fn();
  const onQueryChange = vi.fn();
  render(
    <BlogIndexPage
      posts={posts}
      eyebrow="Blog"
      tag=""
      query=""
      onTagChange={onTagChange}
      onQueryChange={onQueryChange}
      {...props}
    />,
  );
  return { onTagChange, onQueryChange };
}

const rows = () =>
  within(screen.getByRole("article", { name: "Posts" })).queryAllByRole(
    "listitem",
  );

describe("BlogIndexPage", () => {
  it("draws the canvas hero in three block lines", () => {
    renderIndex();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Notes on fintech, AI workspaces, and shipping from Bangkok.",
    );
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
  });

  it("features the cornerstone and sums up the archive", () => {
    renderIndex();
    const featured = screen.getByRole("article", { name: "Cornerstone" });
    expect(featured).toHaveTextContent("AI transformation for Thai SMEs");
    expect(
      within(featured).getByRole("link", { name: /^Read/ }),
    ).toHaveAttribute("href", "/blog/ai-transformation-thailand-smes");
    const archive = screen.getByRole("article", { name: "Archive" });
    expect(archive).toHaveTextContent("Posts15");
    expect(archive).toHaveTextContent("Tags17");
    expect(archive).toHaveTextContent("Latest10/09/2026");
    expect(archive).toHaveTextContent("First14/02/2026");
  });

  it("lists every post, newest first, with the result label", () => {
    renderIndex();
    expect(rows()).toHaveLength(15);
    expect(rows()[0]).toHaveTextContent("01");
    expect(rows()[0]).toHaveTextContent("Intelligence AI inside ERP");
    expect(screen.getByText("Showing 15 of 15 posts")).toBeInTheDocument();
  });

  it("filters by the ?tag= value whatever its case", () => {
    renderIndex({ tag: "sme" });
    expect(rows()).toHaveLength(3);
    expect(
      screen.getByText("Showing 3 of 15 posts tagged SME"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SME 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows everything for a tag no post carries", () => {
    renderIndex({ tag: "crypto" });
    expect(rows()).toHaveLength(15);
    expect(screen.getByRole("button", { name: "All 15" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("toggles a tag through the chips and the venture rows", () => {
    const { onTagChange } = renderIndex({ tag: "GoGoCash" });
    const ventures = screen.getByRole("group", { name: "Filter by venture" });
    const gogo = within(ventures).getByRole("button", { name: /GoGoCash/ });
    expect(gogo).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(gogo);
    expect(onTagChange).toHaveBeenLastCalledWith("");
    fireEvent.click(within(ventures).getByRole("button", { name: /Manut/ }));
    expect(onTagChange).toHaveBeenLastCalledWith("Manut");
    fireEvent.click(screen.getByRole("button", { name: "AI 6" }));
    expect(onTagChange).toHaveBeenLastCalledWith("AI");
  });

  it("searches as you type and reports the query", () => {
    const { onQueryChange } = renderIndex();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search posts" }), {
      target: { value: "loops" },
    });
    expect(onQueryChange).toHaveBeenLastCalledWith("loops");
    expect(rows()).toHaveLength(2);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search posts" }), {
      target: { value: "zzzz" },
    });
    expect(rows()).toHaveLength(0);
    expect(
      screen.getByText("No posts match your filters."),
    ).toBeInTheDocument();
  });

  it("starts from the ?q= value", () => {
    renderIndex({ query: "bangkok" });
    expect(screen.getByRole("searchbox")).toHaveValue("bangkok");
    expect(rows().length).toBeGreaterThan(0);
    expect(rows().length).toBeLessThan(15);
  });
});

function renderPost(slug: string, post: Post | null = null) {
  return render(
    <ChromeProvider>
      <BlogPostView slug={slug} post={post} />
    </ChromeProvider>,
  );
}

describe("BlogPostView (bento post)", () => {
  it("shows the hero, the note and its details", () => {
    const { container } = renderPost("ai-transformation-thailand-smes");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "AI transformation for Thai SMEs",
    );
    expect(screen.getByRole("link", { name: "Back to Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    const note = screen.getByRole("article", { name: "The note" });
    expect(within(note).getAllByRole("paragraph")).toHaveLength(3);
    const details = screen.getByRole("article", { name: "Details" });
    expect(details).toHaveTextContent("Written byKunanon Jarat");
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).not.toBeNull();
  });

  it("lists the links found in the body", () => {
    renderPost("ai-transformation-thailand-smes");
    const card = screen.getByRole("article", { name: "Linked in this note" });
    expect(
      within(card)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/topics/ai-transformation-thailand", "/ventures/manut"]);
  });

  it("switches the related posts by tag", () => {
    renderPost("ai-transformation-thailand-smes");
    const card = screen.getByRole("article", { name: "More on this tag" });
    expect(card).toHaveTextContent("Latest 3 of 5 other posts tagged AI");
    expect(within(card).getAllByRole("listitem")).toHaveLength(3);
    fireEvent.click(within(card).getByRole("button", { name: "Thailand 1" }));
    expect(card).toHaveTextContent("Latest 1 of 1 other post tagged Thailand");
    expect(within(card).getAllByRole("listitem")).toHaveLength(1);
  });

  it("counts the posts it knows in Keep reading", () => {
    renderPost("ai-transformation-thailand-smes");
    expect(
      screen.getByRole("article", { name: "Keep reading" }),
    ).toHaveTextContent("15Posts on the blog");
    expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("throws a 404 for an unknown slug", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderPost("not-a-post")).toThrow("notFound");
  });
});

describe("Portable Text styles (post body)", () => {
  const block = (
    key: string,
    style: string,
    text: string,
    extra: Partial<PortableTextBlock> = {},
  ): PortableTextBlock => ({
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
    ...extra,
  });

  const body: PortableTextBlock[] = [
    block("h", "h2", "A section"),
    block("s", "h3", "A subsection"),
    block("p", "normal", "Body copy", {
      markDefs: [{ _key: "l", _type: "link", href: "/about" }],
      children: [
        { _type: "span", _key: "a", text: "Read ", marks: [] },
        { _type: "span", _key: "b", text: "about me", marks: ["l"] },
        { _type: "span", _key: "c", text: " and ", marks: [] },
        { _type: "span", _key: "d", text: "npm i", marks: ["code"] },
      ],
    }),
    block("b1", "normal", "First point", { listItem: "bullet", level: 1 }),
    block("b2", "normal", "Second point", { listItem: "bullet", level: 1 }),
    block("n1", "normal", "Step one", { listItem: "number", level: 1 }),
    block("q", "blockquote", "A quote"),
    {
      _type: "codeBlock",
      _key: "code",
      code: "pnpm test",
      filename: "terminal",
    } as unknown as PortableTextBlock,
  ];

  const post: Post = {
    _id: "cms-styles",
    title: "Styles",
    slug: "styles",
    excerpt: "Every block style.",
    publishedAt: "2026-11-10T00:00:00.000Z",
    tags: ["AI"],
    coverImage: null,
    body,
    author: { name: "Fronk", bio: null, avatar: null },
  };

  it("nests the body headings under the note's kicker", () => {
    renderPost("styles", post);
    const note = screen.getByRole("article", { name: "The note" });
    expect(
      within(note).getByRole("heading", { level: 3, name: "A section" }),
    ).toBeInTheDocument();
    expect(
      within(note).getByRole("heading", { level: 4, name: "A subsection" }),
    ).toBeInTheDocument();
  });

  it("draws lists, quotes, code and links in the canvas style", () => {
    renderPost("styles", post);
    const note = screen.getByRole("article", { name: "The note" });
    const lists = within(note).getAllByRole("list");
    expect(lists.map((l) => l.tagName)).toEqual(["UL", "OL"]);
    expect(within(lists[1]!).getByText("01")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(note.querySelector("blockquote")?.className).toMatch(/rounded-well/);
    const pre = note.querySelector("pre");
    expect(pre).toHaveAttribute("tabindex", "0");
    expect(within(note).getByText("terminal").tagName).toBe("FIGCAPTION");
    expect(within(note).getByText("npm i").tagName).toBe("CODE");
    const link = within(note).getByRole("link", { name: "about me" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link.className).toMatch(/underline/);
    expect(screen.getByRole("article", { name: "Details" })).toHaveTextContent(
      "Written byFronk",
    );
    expect(
      within(
        screen.getByRole("article", { name: "Linked in this note" }),
      ).getByRole("link"),
    ).toHaveAttribute("href", "/about");
  });
});
