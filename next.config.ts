import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de productos en Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yrvunjrqxowuraezggdh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
