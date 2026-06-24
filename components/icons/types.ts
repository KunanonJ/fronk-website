import type { ComponentType, SVGProps } from "react";

/** Shared props for Lucide icons and inline brand SVGs. */
export type IconProps = SVGProps<SVGSVGElement>;

export type IconComponent = ComponentType<IconProps>;
