import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/api/avatars/**',
      },
      // Add production API domain when deployed
      // {
      //   protocol: 'https',
      //   hostname: 'api.yourapp.com',
      //   pathname: '/avatars/**',
      // },
    ],
  },
};

export default nextConfig;
