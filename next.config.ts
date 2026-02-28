import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config to indicate we're aware of the migration
  turbopack: {},

  // Exclude web-llm from server-side bundling
  serverExternalPackages: ["@mlc-ai/web-llm"],

  // Required headers for SharedArrayBuffer (WebLLM requirement)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
