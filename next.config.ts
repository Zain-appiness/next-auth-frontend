import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*", // Matches all API routes
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true", // Enable credentials (cookies or Authorization headers)
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allow requests from any origin, or specify a particular domain like 'http://localhost:3000'
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT", // Allowed methods
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version", // Allowed headers
          },
        ],
      },
    ];
  },
};

export default nextConfig;
