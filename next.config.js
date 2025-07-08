/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Turbopack is now stable in Next.js 15
  turbopack: {
    // Turbopack configurations (if needed)
  },
};

module.exports = nextConfig;
