import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles output mode automatically - no standalone needed */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Exclude mini-services from the build
  serverExternalPackages: ['@libsql/client'],
};

export default nextConfig;