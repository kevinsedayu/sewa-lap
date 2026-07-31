import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*.webm',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Type', value: 'video/webm' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.mp4',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Type', value: 'video/mp4' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Izinkan domain Supabase Storage untuk video
  async rewrites() {
    return []
  },
};

export default nextConfig;
