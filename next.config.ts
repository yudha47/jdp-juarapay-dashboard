import type { NextConfig } from "next";

const ALLOW_ALL_IMAGE_HOSTS = true; // Set to false in production and specify allowed hosts in remotePatterns for better security

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,

  // output file tracing.
  outputFileTracingRoot: process.cwd(),

  // matikan ignoreBuildErrors/ignoreDuringBuilds saat sudah stabil.
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: ["leaflet"],

  images: {
    remotePatterns: ALLOW_ALL_IMAGE_HOSTS
      ? [
          { protocol: "https", hostname: "**" },
          { protocol: "http", hostname: "**" },
        ]
      : [
          // Example of allowing specific hosts:
          { protocol: "https", hostname: "image.astronauts.cloud", pathname: "/**" },
        ],

    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,

    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; img-src 'self' data: https: http:; media-src 'none'; script-src 'none'; sandbox;",
  },

  // async redirects() {
  //   if (process.env.NODE_ENV !== "production") return [];
    
  //   return [
  //     {
  //       source: "/",
  //       has: [
  //         {
  //           type: "host",
  //           value: "sandbox.juarapay.id",
  //         },
  //       ],
  //       destination: "https://juarapay.id",
  //       permanent: false,
  //     },
  //   ];
  // },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;