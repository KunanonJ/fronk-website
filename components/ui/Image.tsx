import { forwardRef, type CSSProperties, type ImgHTMLAttributes } from "react";

/*
 * `next/image` as a plain <img> (tanstack-migration). The site never used
 * Next's optimiser on Workers (no IMAGES binding), so output pixels match;
 * `fill` reproduces Next's absolute-fill styles, `priority` eager loading.
 */

type StaticImport = { src: string; width?: number; height?: number };

type NextImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | StaticImport;
  fill?: boolean;
  priority?: boolean;
  quality?: number | string;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: unknown;
  overrideSrc?: string;
};

const FILL: CSSProperties = {
  position: "absolute",
  height: "100%",
  width: "100%",
  inset: 0,
  objectFit: "cover",
  color: "transparent",
};

const Image = forwardRef<HTMLImageElement, NextImageProps>(function Image(
  {
    src,
    alt,
    fill,
    priority,
    quality: _q,
    placeholder: _p,
    blurDataURL: _b,
    unoptimized: _u,
    loader: _l,
    overrideSrc,
    style,
    width,
    height,
    loading,
    ...rest
  },
  ref,
) {
  const resolved = typeof src === "string" ? src : src.src;
  return (
    <img
      ref={ref}
      alt={alt}
      src={overrideSrc ?? resolved}
      width={
        fill
          ? undefined
          : (width ?? (typeof src === "object" ? src.width : undefined))
      }
      height={
        fill
          ? undefined
          : (height ?? (typeof src === "object" ? src.height : undefined))
      }
      loading={priority ? "eager" : (loading ?? "lazy")}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={fill ? { ...FILL, ...style } : { color: "transparent", ...style }}
      {...rest}
    />
  );
});

export default Image;
