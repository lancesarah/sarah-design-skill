import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lance-live/gallery-ui"],
  agentRules: false,
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
