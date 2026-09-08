import type { NextConfig } from "next";
import { mergedManufacturerSlugs } from "./app/lib/merged-manufacturer-slugs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aihamyn.ae" }],
        destination: "https://aihamyn.ae/:path*",
        permanent: true,
      },
      ...mergedManufacturerSlugs.map(({ from, to }) => ({
        source: `/manufacturers/${from}`,
        destination: `/manufacturers/${to}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
