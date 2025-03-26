/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { reactRoot: "concurrent" },
};

module.exports = nextConfig;
