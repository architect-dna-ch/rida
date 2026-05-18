import type { NextConfig } from "next";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  ...(isCapacitor && { output: "export", trailingSlash: true }),
  ...(!isCapacitor && {
    headers: async () => [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
        ],
      },
    ],
  }),
};

export default nextConfig;
