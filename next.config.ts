import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // See scripts/webpack-ignore-url-imports.js — lets @shopify/hydrogen load
  // Shopify's analytics module from their CDN at runtime.
  webpack: (config) => {
    config.module.rules.push({
      test: /[\\/]node_modules[\\/]@shopify[\\/]hydrogen[\\/].*\.mjs$/,
      enforce: "pre",
      loader: path.join(process.cwd(), "scripts", "webpack-ignore-url-imports.js"),
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "*.shopify.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/product/:handle",
        destination: "/products/:handle",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
