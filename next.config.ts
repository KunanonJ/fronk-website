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
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

initOpenNextCloudflareForDev();

export default withBundleAnalyzer(nextConfig);
