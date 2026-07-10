import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The prototype ships no remote images; local assets live in /public.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
