import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile in the parent
  // directory was making Next infer the wrong root).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
