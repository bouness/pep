import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  basePath: "/pep",
  assetPrefix: "/pep/",
  images: {
    loader: "akamai", // Recommended for static images on GitHub Pages
    path: "",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
