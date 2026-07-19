import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Next 16 prints no JS-size table, and @next/bundle-analyzer is a silent no-op
// under the default Turbopack build. So the treemap requires the webpack bundler
// (`pnpm analyze` === `ANALYZE=true next build --webpack`); the actual per-route
// first-load gate runs against the real Turbopack output via `pnpm perf:budget`.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // About page is real at `/about` (was stock `/stock/asme`)
      { source: "/stock/asme", destination: "/about", permanent: true },
      // Ventures lives as the home section; keep a named URL
      { source: "/ventures", destination: "/#ventures", permanent: true },
      // Exclude static files (e.g. future /ventures/*.png) from the section redirect.
      {
        source: "/ventures/:slug((?!.*\\..*).*)",
        destination: "/#ventures",
        permanent: true,
      },
      { source: "/now", destination: "/", permanent: true },
      { source: "/writing", destination: "/blog", permanent: true },
      { source: "/writing/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/work", destination: "/#ventures", permanent: true },
      { source: "/rss.xml", destination: "/feed.xml", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://www.sanity.io https://*.sanity.io",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.higgs.ai",
      },
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "soft-zoom-63098134.figma.site",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

initOpenNextCloudflareForDev();

export default withBundleAnalyzer(nextConfig);
