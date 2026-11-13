import type { NextConfig } from "next";
import createWithVercelToolbar from "@vercel/toolbar/plugins/next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lance-live/sds"],
  agentRules: false,
  devIndicators: { position: "bottom-right" },
};

const withVercelToolbar = createWithVercelToolbar();

export default withVercelToolbar(nextConfig);
