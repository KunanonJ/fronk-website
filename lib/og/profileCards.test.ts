import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { ProfileCard } from "@/lib/og/profileCard";
import { ABOUT_CARD, HOME_CARD, profileCardAlt } from "@/lib/og/profileCards";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/routeMeta";
import { Route as AboutRoute } from "@/src/routes/_landing/about";

type Node = {
  type: unknown;
  props: Record<string, unknown> & { children?: unknown };
};

/** Calls function components, as satori does, and lists every element. */
function elements(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) {
    for (const child of node) elements(child, out);
  } else if (node && typeof node === "object" && "props" in node) {
    const element = node as Node;
    if (typeof element.type === "function") {
      return elements(
        (element.type as (p: unknown) => unknown)(element.props),
        out,
      );
    }
    out.push(element);
    elements(element.props.children, out);
  }
  return out;
}

const texts = (node: unknown) =>
  elements(node)
    .map((e) => e.props.children)
    .filter((c): c is string => typeof c === "string");

describe("the profile share cards", () => {
  it("say each page's hero, word for word", () => {
    expect(profileCardAlt(HOME_CARD)).toBe(
      "Kunanon Jarat’s portrait beside “Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.”",
    );
    expect(profileCardAlt(ABOUT_CARD)).toBe(
      "Kunanon Jarat’s portrait beside “About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok.”",
    );
    for (const card of [HOME_CARD, ABOUT_CARD]) {
      expect(card.pill).toBe(OPEN_TO_ROLES.pill.label);
    }
  });

  it("give the pages' share images alt text that matches them", () => {
    expect(DEFAULT_OG_IMAGE.alt).toBe(profileCardAlt(HOME_CARD));
    const head = AboutRoute.options.head!({} as never) as unknown as {
      meta: { property?: string; content?: string }[];
    };
    const alt = head.meta.find((m) => m.property === "og:image:alt");
    expect(alt?.content).toBe(profileCardAlt(ABOUT_CARD));
  });

  it("render the headline, the lead, the domain and the bundled portrait", () => {
    const card = createElement(ProfileCard, ABOUT_CARD);
    const all = texts(card);
    for (const part of [
      "About",
      "Kunanon Jarat:",
      "AI, ERP/CRM",
      "and",
      ABOUT_CARD.accent,
      ABOUT_CARD.lead,
      OPEN_TO_ROLES.pill.label,
      "kunanonj.com",
    ]) {
      expect(all, part).toContain(part);
    }
    const images = elements(card).filter((e) => e.type === "img");
    expect(images).toHaveLength(1);
    expect(String(images[0]!.props.src)).toMatch(/^data:image\/jpeg;base64,/);
    expect(images[0]!.props).toMatchObject({ width: 320, height: 400 });
  });
});
