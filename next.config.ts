import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.21online.lat" },
      { protocol: "https", hostname: "bepremiumrealestate.net" },
      { protocol: "https", hostname: "www.bepremiumrealestate.net" },
      { protocol: "https", hostname: "**.bepremiumrealestate.net" },
    ],
  },
};

export default nextConfig;
