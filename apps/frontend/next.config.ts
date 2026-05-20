import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@rankflow/shared"],
  turbopack: {
    root: path.join(process.cwd(), "../..")
  }
};

export default nextConfig;
