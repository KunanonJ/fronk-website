import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArrowDownRightIcon,
  CloseIcon,
  GlobeIcon,
  HashIcon,
  MailIcon,
  MenuIcon,
  SendIcon,
} from "./ui-icons";

const icons = {
  GlobeIcon,
  ArrowDownRightIcon,
  MenuIcon,
  CloseIcon,
  MailIcon,
  SendIcon,
  HashIcon,
} as const;

describe("ui icons (WP-02)", () => {
  it.each(Object.entries(icons))("%s renders without throw and uses currentColor", (name, Icon) => {
    const html = renderToStaticMarkup(createElement(Icon, { className: "h-4 w-4" }));
    expect(html).toContain("<svg");
    expect(html).toContain("currentColor");
    expect(html).not.toMatch(/\.(png|jpg|gif|webp)/i);
    expect(name).toBeTruthy();
  });
});
