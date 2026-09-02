import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
