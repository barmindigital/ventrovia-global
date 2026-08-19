import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ventroviaglobal.com" }],
        destination: "https://ventroviaglobal.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
